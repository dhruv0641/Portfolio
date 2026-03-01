
import { Component, ChangeDetectionStrategy, signal, afterNextRender } from '@angular/core';
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';
import { HeroComponent } from './components/hero/hero.component';
import { AboutComponent } from './components/about/about.component';
import { ServicesComponent } from './components/services/services.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { PartnersComponent } from './components/partners/partners.component';
import { ContactComponent } from './components/contact/contact.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LoadingScreenComponent,
    HeroComponent,
    AboutComponent,
    ServicesComponent,
    ProjectsComponent,
    PartnersComponent,
    ContactComponent
  ]
})
export class AppComponent {
  isLoading = signal(true);
  isContentLoaded = signal(false);

  constructor() {
    afterNextRender(() => {
      setTimeout(() => {
        this.isLoading.set(false);
        // Add a small delay for the fade-out transition of the loading screen
        setTimeout(() => this.isContentLoaded.set(true), 500);
      }, 3500); // Simulate loading time
    });
  }
}
