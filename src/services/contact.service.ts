
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  // Centralized API base — uses same origin in production, localhost:4000 in dev
  private get apiUrl(): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    // If running on Angular dev server (port 3000/4200), proxy to API on 4000
    if (origin.includes('localhost:3000') || origin.includes('localhost:4200')) {
      return 'http://localhost:4000/api/messages';
    }
    return `${origin}/api/messages`;
  }

  /**
   * Sanitize input to prevent XSS
   */
  private sanitize(value: string): string {
    return value.replace(/[<>]/g, '').trim();
  }

  /**
   * Submit contact form to admin API backend.
   * Falls back to mock if API is unreachable.
   */
  async submitForm(formData: { name?: string | null; email?: string | null; message?: string | null }): Promise<void> {
    const sanitized = {
      name: this.sanitize(formData.name || ''),
      email: this.sanitize(formData.email || ''),
      message: this.sanitize(formData.message || '')
    };

    // Validate
    if (!sanitized.name || sanitized.name.length < 2) throw new Error('Name is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized.email)) throw new Error('Invalid email');
    if (!sanitized.message || sanitized.message.length < 10) throw new Error('Message too short');

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitized)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error: any) {
      // If API is unreachable, fall back to mock
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        console.warn('API unreachable, using mock submission');
        await new Promise<void>((resolve) => setTimeout(resolve, 1500));
        return;
      }
      throw error;
    }
  }
}
