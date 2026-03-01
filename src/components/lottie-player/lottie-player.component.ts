
import { Component, ChangeDetectionStrategy, input, viewChild, ElementRef, afterNextRender } from '@angular/core';

@Component({
  selector: 'app-lottie-player',
  template: `<div #lottieContainer [style.width]="width()" [style.height]="height()"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LottiePlayerComponent {
  path = input.required<string>();
  width = input<string>('100%');
  height = input<string>('100%');
  loop = input(true);

  lottieContainer = viewChild.required<ElementRef>('lottieContainer');

  constructor() {
    afterNextRender(() => {
      const lottiePlayer = (window as any).lottie;
      if (lottiePlayer) {
        lottiePlayer.loadAnimation({
          container: this.lottieContainer().nativeElement,
          renderer: 'svg',
          loop: this.loop(),
          autoplay: true,
          path: this.path()
        });
      }
    });
  }
}
