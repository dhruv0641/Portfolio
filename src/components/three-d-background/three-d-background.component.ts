
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
  private animationFrameId: number | null = null;

  constructor() {
    afterNextRender(() => {
      this.initThree();
      this.animate();
    });
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    if(this.renderer) {
        this.renderer.dispose();
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
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const particleCount = 5000;
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

    window.addEventListener('resize', this.onWindowResize.bind(this));
    document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this));
  }

  private onWindowResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private onDocumentMouseMove = (event: MouseEvent): void => {
    this.mouseX = (event.clientX - window.innerWidth / 2) / 10;
    this.mouseY = (event.clientY - window.innerHeight / 2) / 10;
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const baseTime = Date.now() * 0.00005;
    const pulseTime = Date.now() * 0.001;

    // Camera movement for parallax effect
    this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
    this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);

    if (this.particles) {
        // Combine base rotation with mouse influence for a more dynamic feel
        this.particles.rotation.x = baseTime * 0.25 + this.mouseY * 0.001;
        this.particles.rotation.y = baseTime * 0.5 + this.mouseX * 0.001;
        
        // Pulsing effect for size. Opacity is handled by texture and blending.
        const material = this.particles.material as THREE.PointsMaterial;
        material.size = 2.5 + Math.sin(pulseTime) * 0.5;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
