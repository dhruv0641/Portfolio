
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  imports: [ReactiveFormsModule, LottiePlayerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);

  status = signal<FormStatus>('idle');

  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  async onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.status.set('submitting');
    try {
      await this.contactService.submitForm(this.contactForm.value);
      this.status.set('success');
      this.contactForm.reset();
      setTimeout(() => this.status.set('idle'), 4000); // Reset after 4s
    } catch (error) {
      this.status.set('error');
      setTimeout(() => this.status.set('idle'), 4000); // Reset after 4s
    }
  }
}
