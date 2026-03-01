
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ThreeDBackgroundComponent } from '../three-d-background/three-d-background.component';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ThreeDBackgroundComponent],
})
export class HeroComponent {}
