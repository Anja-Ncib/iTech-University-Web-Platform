import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import {FormBuilder,FormGroup,FormControl,ReactiveFormsModule,AbstractControl,ValidatorFn,ValidationErrors} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime,distinctUntilChanged , merge } from 'rxjs';
import { TranslatePipe , TranslateService } from '@ngx-translate/core';
import { TeacherService  } from '../../services/teacher.service';




@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  providers: [TeacherService],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements  OnInit {
  departmentOptions: {value: string, display: string}[] = [];
  gradOptions: {value: string, display: string}[] = [];

  currentLang: string;
  @Output() searchChange = new EventEmitter<any>();
  dateBirth: FormControl;
  dateEmploy: FormControl;
  searchForm!: FormGroup;

   private departmentValues  = [
    { en: 'AI', fr: 'IA' },
    { en: 'Mathematics', fr: 'Mathématiques' },
    { en: 'Physics', fr: 'Physique' },
    { en: 'Biology', fr: 'Biologie' },
    { en: 'Geology', fr: 'Géologie' }
  ];

  private gradValues = [
  { en: 'Professor', fr: 'Professeur'},
  { en: 'Assistant Professor', fr: 'Professeur Assistant'},
  { en: 'Lecturer', fr: 'Maître de Conférences'},
  { en: 'Contractual Doctor', fr: 'Docteur Contractuel'},
  { en: 'Retired Expert', fr: 'Expert Retraité'}
];

  constructor(private fb: FormBuilder , private translate: TranslateService) {
    // Initialize the year controls separately
    this.dateBirth = new FormControl('', [this.maxYearValidator(new Date().getFullYear())]);
    this.dateEmploy = new FormControl('', [this.maxYearValidator(new Date().getFullYear())]);
    this.currentLang = this.translate.currentLang;
  }

  ngOnInit() {
    this.initForm();
    this.setupFormListeners();
    this.setupDepartmentOptions();
    this.setupGradOptions();
    this.updateDepartmentOptions();
    // Watch for language changes
    this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      this.updateDepartmentOptions();
      this.setupGradOptions();
    });
  }

  private updateDepartmentOptions() {
    this.departmentOptions = this.departmentValues.map(dept => ({
      value: this.currentLang === 'fr' ? dept.fr : dept.en,
      display: this.translate.instant(`teacher-department-${dept.en.toLowerCase()}`)
    }));
  }

  initForm() {
    this.searchForm = this.fb.group({
      name: [''],
      cin: ['', this.cinValidator()],
      email: [''],
      grad: [''],
      department: ['']
    });
  }

  private setupDepartmentOptions() {
    this.departmentOptions = this.departmentValues .map(item => ({
      value: this.currentLang === 'fr' ? item.fr : item.en,
      display: this.translate.instant(`teacher-department-${item.en.toLowerCase()}`)
    }));
  }
  private setupGradOptions() {
    this.gradOptions = this.gradValues.map(grad => ({
      value: this.currentLang === 'fr' ? grad.fr : grad.en,
      display: this.translate.instant(`teacher-grad-${grad.en.toLowerCase().replace(' ', '-')}`)
    }));
  }


  private setupFormListeners() {
    merge(
      this.searchForm.valueChanges,
      this.dateBirth.valueChanges,
      this.dateEmploy.valueChanges
    ).pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => {
        // Custom comparison for department values
        return JSON.stringify(prev) === JSON.stringify(curr);
      })
    ).subscribe(() => {
      this.emitSearchCriteria();
    });
  }

   private emitSearchCriteria() {
    const formValue = this.searchForm.value;
    
    this.searchChange.emit({
      ...formValue,
      birthYear: this.dateBirth.value ? Number(this.dateBirth.value) : null,
      employmentYear: this.dateEmploy.value ? Number(this.dateEmploy.value) : null
    });
  }


  clearAll() {
    this.searchForm.reset();
    this.dateBirth.reset();
    this.dateEmploy.reset();
    this.emitSearchCriteria(); // Emit after clearing
  }
  
  maxYearValidator(maxYear: number): ValidatorFn {
    return (control: AbstractControl) => {
      const year = Number(control.value);
      if (!control.value || isNaN(year)) {
        return null;
      }

      return year > maxYear
        ? { maxYear: { max: maxYear, actual: year } }
        : null;
    };
  }

  cinValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      // Vérifie que ce sont uniquement des chiffres
      if (!/^\d*$/.test(value)) {
        return { invalidCharacters: true };
      }

      // Vérifie que le nombre de chiffres ne dépasse pas 8
      if (value.length > 8) {
        return { tooLong: true };
      }

      return null;
    };
  }

}



