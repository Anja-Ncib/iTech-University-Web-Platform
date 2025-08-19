import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TeacherService, CombinedTeacherLocalized } from '../../../teachers/services/teacher.service';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../../shared/toast/toast.service'; // i18n toast service

type LangKey = 'fr' | 'en' | 'ar';

@Component({
  selector: 'app-edit-teacher',
  templateUrl: './edit.component.html',
  imports: [ReactiveFormsModule, TranslatePipe, CommonModule],
})
export class EditTeacherComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  selectedFile: File | null = null;
  isDragOver = false;
  currentCvFile: any = null;

  teacherForm!: FormGroup;
  teacherId!: number;
  teacher: CombinedTeacherLocalized | undefined;

  loading = false;
  currentLang: LangKey = 'fr'; // active language in the UI

  // Options: we store the *label* for the active language directly into the control
  gradOptions = [
    { id: 'prof',  labels: { en: 'Professor',           fr: 'Professeur',            ar: 'أستاذ' } },
    { id: 'assoc', labels: { en: 'Associate Professor', fr: 'Maître de conférences', ar: 'أستاذ محاضر' } },
    { id: 'asst',  labels: { en: 'Assistant',           fr: 'Assistant',             ar: 'مساعد' } },
    { id: 'contr', labels: { en: 'Contractual Doctor',  fr: 'Docteur contractuel',   ar: 'دكتور متعاقد' } },
    { id: 'ret',   labels: { en: 'Retired Expert',      fr: 'Expert retraité',       ar: 'خبير متقاعد' } },
  ];

  deptOptions = [
    { id: 'AI',          labels: { en: 'AI',           fr: 'IA',             ar: 'ذكاء اصطناعي' } },
    { id: 'Mathematics', labels: { en: 'Mathematics',  fr: 'Mathématiques',  ar: 'رياضيات' } },
    { id: 'Physics',     labels: { en: 'Physics',      fr: 'Physique',       ar: 'فيزياء' } },
    { id: 'Biology',     labels: { en: 'Biology',      fr: 'Biologie',       ar: 'أحياء' } },
    { id: 'Geology',     labels: { en: 'Geology',      fr: 'Géologie',       ar: 'جيولوجيا' } },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private teacherService: TeacherService,
    private translate: TranslateService,
    private toast: ToastService
  ) {}

  // ===== UI helpers for showing current values in selects =====
  getCurrentGradValue(): string {
    return this.teacherForm?.get(['translations', this.currentLang, 'grad'])?.value || '';
  }

  getCurrentDepartmentValue(): string {
    return this.teacherForm?.get(['translations', this.currentLang, 'department'])?.value || '';
  }

  private setGradAllLanguages(opt: { labels: Record<LangKey, string> } | undefined): void {
    if (!opt) return;
    (['fr','en','ar'] as LangKey[]).forEach(lang => {
      this.teacherForm.get(['translations', lang, 'grad'])?.setValue(opt.labels[lang]);
      this.teacherForm.get(['translations', lang, 'grad'])?.markAsDirty();
    });
  }

  private setDepartmentAllLanguages(opt: { labels: Record<LangKey, string> } | undefined): void {
    if (!opt) return;
    (['fr','en','ar'] as LangKey[]).forEach(lang => {
      this.teacherForm.get(['translations', lang, 'department'])?.setValue(opt.labels[lang]);
      this.teacherForm.get(['translations', lang, 'department'])?.markAsDirty();
    });
  }

  // ===== form build / load =====
  private buildForm(): void {
    this.teacherForm = this.fb.group({
      cin: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: [''],
      birth_date: [''],
      cv: [null], // File

      translations: this.fb.group({
        fr: this.fb.group({
          first_name: [''],
          last_name: [''],
          address: [''],
          grad: [''],
          department: [''],
        }),
        en: this.fb.group({
          first_name: [''],
          last_name: [''],
          address: [''],
          grad: [''],
          department: [''],
        }),
        ar: this.fb.group({
          first_name: [''],
          last_name: [''],
          address: [''],
          grad: [''],
          department: [''],
        }),
      }),
    });
  }

  switchLang(lang: LangKey) {
    this.currentLang = lang;
  }

  ngOnInit(): void {
    this.buildForm();
    this.loadTeacher();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTeacher(): void {
    this.teacherId = Number(this.route.snapshot.paramMap.get('id'));
    this.teacherService.getTeacher(this.teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (teacher) => {
          this.teacher = teacher;

          // Root fields
          this.teacherForm.patchValue({
            cin: teacher?.cin ?? '',
            email: teacher?.email ?? '',
            phone_number: teacher?.phone_number ?? '',
            birth_date: teacher?.birth_date ?? '',
          });

          // Map API fields into nested translation groups
          this.teacherForm.patchValue({
            translations: {
              fr: {
                first_name: teacher?.first_name ?? '', // fallback (no first_name_fr in interface)
                last_name:  teacher?.last_name  ?? '',
                address:    teacher?.address_fr ?? '',
                grad:       teacher?.grad_fr ?? '',
                department: teacher?.department_fr ?? '',
              },
              en: {
                first_name: teacher?.first_name ?? '',
                last_name:  teacher?.last_name ?? '',
                address:    teacher?.address ?? '',
                grad:       teacher?.grad ?? '',
                department: teacher?.department ?? '',
              },
              ar: {
                first_name: teacher?.first_name_ar ?? '',
                last_name:  teacher?.last_name_ar ?? '',
                address:    teacher?.address_ar ?? '',
                grad:       teacher?.grad_ar ?? '',
                department: teacher?.department_ar ?? '',
              },
            },
          });
        },
        error: () => {
          this.toast.errorKey('toasts.generic_error');
        },
      });
  }

  // ===== selects =====
  onGradSelected(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    const chosen = this.gradOptions.find(o => o.labels[this.currentLang] === val);
    this.setGradAllLanguages(chosen);
  }

  onDepartmentSelected(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    const chosen = this.deptOptions.find(o => o.labels[this.currentLang] === val);
    this.setDepartmentAllLanguages(chosen);
  }

  // ===== validation helpers =====
  PhoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    if (!/^\d*$/.test(value)) return { invalidCharacters: true };
    if (value.length !== 8) return { invalidLength: true };
    return null;
  };

  // ===== file choose / drag & drop =====
  onFileSelected(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const file = input?.files?.[0] ?? null;
    if (file) this.validateAndSetFile(file);
    // Allow selecting the same file again
    if (input) input.value = '';
  }

  validateAndSetFile(file: File): void {
    const ctrl = this.teacherForm.get('cv');
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      ctrl?.setErrors({ invalidFileType: true });
      this.selectedFile = null;
      this.toast.warningKey('toasts.file_type_invalid');
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      ctrl?.setErrors({ fileSizeExceeded: true });
      this.selectedFile = null;
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

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    const ctrl = this.teacherForm.get('cv');
    ctrl?.reset();
    ctrl?.setErrors(null);
    this.toast.infoKey('toasts.file_removed');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ===== payload =====
  private buildFormData(): FormData {
    const fd = new FormData();

    fd.append('cin', this.teacherForm.get('cin')?.value ?? '');
    fd.append('email', this.teacherForm.get('email')?.value ?? '');
    fd.append('phone_number', this.teacherForm.get('phone_number')?.value ?? '');

    // Normalize date to YYYY-MM-DD if present
    const bd = this.teacherForm.get('birth_date')?.value;
    if (bd) {
      const iso = bd instanceof Date ? bd.toISOString().slice(0, 10) : ('' + bd).slice(0, 10);
      fd.append('birth_date', iso);
    }

    // File
    const file = this.teacherForm.get('cv')?.value;
    if (file instanceof File) fd.append('cv', file);

    // Translations (send 3 languages; backend upserts each)
    (['fr','en','ar'] as const).forEach((lang) => {
      const grp = this.teacherForm.get(['translations', lang]);
      if (!grp) return;
      const pick = (key: string) => grp.get(key)?.value;

      const first_name = pick('first_name');
      const last_name  = pick('last_name');
      const address    = pick('address');
      const grad       = pick('grad');
      const department = pick('department');

      if (first_name) fd.append(`translations[${lang}][first_name]`, first_name);
      if (last_name)  fd.append(`translations[${lang}][last_name]`, last_name);
      if (address)    fd.append(`translations[${lang}][address]`, address);
      if (grad)       fd.append(`translations[${lang}][grad]`, grad);
      if (department) fd.append(`translations[${lang}][department]`, department);
    });

    // Method spoofing for multipart PUT
    fd.append('_method', 'PUT');
    return fd;
  }

  // ===== submit =====
  onSubmit(): void {
    if (this.teacherForm.invalid) {
      this.teacherForm.markAllAsTouched();
      this.toast.warningKey('toasts.fix_validation');
      return;
    }

    const fd = this.buildFormData();
    this.loading = true;

    this.teacherService.update(this.teacherId, fd)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.toast?.successKey('toasts.teacher_updated');
          this.router.navigate(['/teachers']);
        },
        error: () => {
          this.loading = false;
          this.toast.errorKey('toasts.generic_error');
        },
      });
  }

  // handy getter used by the template placeholder for selects
  get currentLangGroup(): FormGroup | null {
    return this.teacherForm.get(['translations', this.currentLang]) as FormGroup | null;
  }

  goBack(): void {
    this.router.navigate(['/teachers']);
  }
}
