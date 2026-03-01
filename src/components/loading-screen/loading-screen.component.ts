
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LottiePlayerComponent]
})
export class LoadingScreenComponent {}
