import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from '../../../../shared/toast/toast.service'; // adjust path if needed

type Trio = { en: string; fr: string; ar: string };
type LangKey = 'en' | 'fr' | 'ar';

@Component({
  selector: 'app-add-teacher',
  standalone: true,
  templateUrl: './add.component.html',
  imports: [TranslatePipe, CommonModule, ReactiveFormsModule],
})
export class AddTeacherComponent {
  teacherForm: FormGroup;
  selectedFile: File | null = null;
  isDragOver = false;

  // Helpers to show labels in the current UI language
  get uiLang(): LangKey {
    const l = (this.translate.currentLang || this.translate.defaultLang || 'fr') as LangKey;
    return (['en', 'fr', 'ar'] as LangKey[]).includes(l) ? l : 'fr';
  }
  labelOf = (t: Trio) => t[this.uiLang];

  departmentValues: Trio[]  = [
    { en: 'AI',           fr: 'IA' ,             ar: 'الذكاء الاصطناعي' },
    { en: 'Mathematics',  fr: 'Mathématiques',   ar: 'الرياضيات' },
    { en: 'Physics',      fr: 'Physique',        ar: 'الفيزياء' },
    { en: 'Biology',      fr: 'Biologie',        ar: 'علم الأحياء' },
    { en: 'Geology',      fr: 'Géologie',        ar: 'علم الأرض' },
  ];

  gradValues: Trio[] = [
    { en: 'Professor',           fr: 'Professeur',          ar: 'أستاذ' },
    { en: 'Associate Professor', fr: 'Professeur Associé',  ar: 'أستاذ مشارك' },
    { en: 'Assistant',           fr: 'Assistant',           ar: 'مُعاون' },
    { en: 'Contractual Doctor',  fr: 'Docteur Contractuel', ar: 'طبيب متعاقد' },
    { en: 'Retired Expert',      fr: 'Expert Retraité',     ar: 'خبير متقاعد' },
  ];

  minDateString = '1945-01-01';
  maxDateString = '2002-12-31';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    private http: HttpClient,
    private toast: ToastService
  ) {
    this.teacherForm = this.fb.group({
      cin: ['', [Validators.required, this.cinValidator]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required, this.cinValidator]],
      birth_date: ['', [Validators.required, this.birthDateRangeValidator]],

      // English (required)
      first_name_en: ['', Validators.required],
      last_name_en: ['', Validators.required],
      address_en: ['', Validators.required],
      grad_en: ['', Validators.required],
      department_en: ['', Validators.required],

      // French (required)
      first_name_fr: ['', Validators.required],
      last_name_fr: ['', Validators.required],
      address_fr: ['', Validators.required],
      grad_fr: ['', Validators.required],
      department_fr: ['', Validators.required],

      // Arabic (optional)
      first_name_ar: [''],
      last_name_ar: [''],
      address_ar: [''],
      grad_ar: [''],
      department_ar: [''],

      // File upload (required via validator)
      cv_file: [null, [this.fileRequiredValidator]],
    });

    this.setupAutoTranslation();
  }

  // ---------- validators ----------
  birthDateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const inputDate = new Date(value);
    if (isNaN(inputDate.getTime())) return { invalidDateFormat: true };
    const minDate = new Date(1945, 0, 1);
    const maxDate = new Date(2002, 11, 31);
    inputDate.setHours(0, 0, 0, 0);
    if (inputDate < minDate || inputDate > maxDate) return { dateOutOfRange: true };
    return null;
  };

  cinValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    if (!/^\d*$/.test(value)) return { invalidCharacters: true };
    if (value.length !== 8) return { invalidLength: true };
    return null;
  };

  fileRequiredValidator(control: AbstractControl): ValidationErrors | null {
    return control.value ? null : { required: true };
  }

  // ---------- drag & drop / file ----------
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validateAndSetFile(input.files[0]);
      input.value = ''; // reset so the same file can be chosen again
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) this.validateAndSetFile(files[0]);
  }

  private validateAndSetFile(file: File): void {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const ctrl = this.teacherForm.get('cv_file');

    if (!allowed.includes(file.type)) {
      ctrl?.setErrors({ invalidFileType: true });
      this.toast.warningKey('toasts.file_type_invalid');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      ctrl?.setErrors({ fileSizeExceeded: true });
      this.toast.warningKey('toasts.file_too_big', { max: '5MB' });
      return;
    }

    this.selectedFile = file;
    ctrl?.setValue(file);
    ctrl?.setErrors(null);
    ctrl?.markAsDirty();
    ctrl?.markAsTouched();
    this.toast.successKey('toasts.file_selected', { file: file.name });
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    const ctrl = this.teacherForm.get('cv_file');
    ctrl?.reset();
    ctrl?.setErrors({ required: true });
    this.toast.infoKey('toasts.file_removed');
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ---------- auto-translation for grade/department ----------
  private setupAutoTranslation() {
    // When EN value changes, propagate to FR/AR (we store EN as source of truth)
    this.teacherForm.get('grad_en')?.valueChanges.subscribe((val: string) => {
      const item = this.gradValues.find(g => g.en === val || g.fr === val || g.ar === val);
      if (item) {
        this.teacherForm.patchValue({ grad_fr: item.fr, grad_ar: item.ar }, { emitEvent: false });
      }
    });

    this.teacherForm.get('department_en')?.valueChanges.subscribe((val: string) => {
      const item = this.departmentValues.find(d => d.en === val || d.fr === val || d.ar === val);
      if (item) {
        this.teacherForm.patchValue({ department_fr: item.fr, department_ar: item.ar }, { emitEvent: false });
      }
    });
  }

  // ---------- submit ----------
  onSubmit() {
    if (this.teacherForm.invalid) {
      this.teacherForm.markAllAsTouched();
      this.toast.warningKey('toasts.fix_validation');
      return;
    }

    const v = this.teacherForm.value;
    const formData = new FormData();
    formData.append('cin', v.cin);
    formData.append('email', v.email);
    formData.append('phone_number', v.phone_number);
    formData.append('birth_date', v.birth_date);

    if (this.selectedFile) {
      formData.append('cv', this.selectedFile); // backend expects 'cv'
    }

    formData.append('translations', JSON.stringify({
      en: { first_name: v.first_name_en, last_name: v.last_name_en, address: v.address_en, grad: v.grad_en, department: v.department_en },
      fr: { first_name: v.first_name_fr, last_name: v.last_name_fr, address: v.address_fr, grad: v.grad_fr, department: v.department_fr },
      ar: { first_name: v.first_name_ar, last_name: v.last_name_ar, address: v.address_ar, grad: v.grad_ar, department: v.department_ar },
    }));

    const authToken = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Accept: 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : '',
    });

    this.http.post('http://localhost:8000/api/teachers', formData, { headers, withCredentials: true })
      .subscribe({
        next: () => {
          this.toast.successKey('toasts.teacher_created');
          this.router.navigate(['/teachers']);
        },
        error: () => {
          this.toast.errorKey('toasts.generic_error'); // Generic message, no details
        }
      });
  }

  // ---------- debug ----------
  logFormValidation() {
    console.group('Form Validation State');
    console.log('Form valid:', this.teacherForm.valid);
    console.log('Form status:', this.teacherForm.status);
    console.group('Controls');
    Object.entries(this.teacherForm.controls).forEach(([key, c]) => {
      console.group(key);
      console.log('Value:', (c as any)?.value);
      console.log('Valid:', (c as any).valid, 'Errors:', (c as any).errors);
      console.groupEnd();
    });
    console.groupEnd();
  }

  onBack(): void {
    this.router.navigate(['/teachers']);
  }
}
