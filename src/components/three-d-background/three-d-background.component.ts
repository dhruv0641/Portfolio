
import { Component, ChangeDetectionStrategy, viewChild, ElementRef, afterNextRender, OnDestroy } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-d-background',
  template: '<canvas #canvas class="absolute top-0 left-0 w-full h-full"></canvas>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreeDBackgroundComponent implements OnDestroy {
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private particles!: THREE.Points;
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;
  private animationFrameId: number | null = null;
  private isLowEnd = false;
  private lastFrameTime = 0;
  private frameSkipThreshold = 16; // ~60fps target

  constructor() {
    afterNextRender(() => {
      // Detect low-end devices
      this.isLowEnd = (navigator.hardwareConcurrency || 4) < 4 ||
        /Android|iPhone|iPad/i.test(navigator.userAgent);
      this.initThree();
      this.animate(0);
    });
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('resize', this.boundResize);
    document.removeEventListener('mousemove', this.boundMouseMove);
    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as THREE.PointsMaterial).map?.dispose();
      (this.particles.material as THREE.PointsMaterial).dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }

  private createCircleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    if (context) {
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(200,255,255,1)');
        gradient.addColorStop(0.4, 'rgba(6,182,212,0.8)');
        gradient.addColorStop(1, 'rgba(6,182,212,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }

  private initThree(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.z = 300;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas().nativeElement,
      alpha: true,
      antialias: false,       // Performance: skip AA for particles
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x

    // Adaptive particle count based on device capability
    const particleCount = this.isLowEnd ? 1500 : 5000;
    const vertices = [];
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      vertices.push(x, y, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 2.5,
      map: this.createCircleTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    this.boundResize = this.onWindowResize.bind(this);
    this.boundMouseMove = this.onDocumentMouseMove.bind(this);
    window.addEventListener('resize', this.boundResize, { passive: true });
    document.addEventListener('mousemove', this.boundMouseMove, { passive: true });
  }

  private boundResize: any;
  private boundMouseMove: any;

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private onDocumentMouseMove(event: MouseEvent): void {
    // Throttled: only update target, interpolation happens in animate loop
    this.targetMouseX = (event.clientX - window.innerWidth / 2) / 10;
    this.targetMouseY = (event.clientY - window.innerHeight / 2) / 10;
  }

  private animate = (timestamp: number): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Adaptive frame skipping for low-end devices
    if (this.isLowEnd) {
      const delta = timestamp - this.lastFrameTime;
      if (delta < 33) return; // Cap at ~30fps for low-end
      this.lastFrameTime = timestamp;
    }

    const baseTime = timestamp * 0.00005;
    const pulseTime = timestamp * 0.001;

    // Smooth mouse interpolation (GPU-friendly)
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Camera movement for parallax effect
    this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
    this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);

    if (this.particles) {
        this.particles.rotation.x = baseTime * 0.25 + this.mouseY * 0.001;
        this.particles.rotation.y = baseTime * 0.5 + this.mouseX * 0.001;
        
        // Pulsing size effect (use transform only — GPU accelerated)
        const material = this.particles.material as THREE.PointsMaterial;
        material.size = 2.5 + Math.sin(pulseTime) * 0.5;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
