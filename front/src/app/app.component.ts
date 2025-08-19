import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { HeaderComponent } from './components/header/header.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastContainerComponent } from './shared/toast/toast-container.component'; 

@Component({
  selector: 'app-root',
  standalone: true,  // make sure to add this for standalone component
  imports: [
    RouterOutlet,
    ToastContainerComponent,
    SideBarComponent,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en');
  }
  title = 'front';
}
