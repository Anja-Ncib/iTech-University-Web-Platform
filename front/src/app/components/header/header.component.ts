import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  languages = [
    { label: 'FR', value: 'fr' },
    { label: 'ENG', value: 'en' },
  ];

  selectedLanguage = 'fr';

  constructor(private translate: TranslateService) {
    this.translate.use(this.selectedLanguage);
  }

  changeLanguage(event: Event): void {
  const selectElement = event.target as HTMLSelectElement | null;
  if (selectElement) {
    const lang = selectElement.value;
    this.selectedLanguage = lang;
    this.translate.use(lang);
  }
}}