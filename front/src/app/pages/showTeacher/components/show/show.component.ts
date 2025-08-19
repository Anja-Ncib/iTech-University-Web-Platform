// teacher-details.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TeacherService, CombinedTeacherLocalized } from '../../../teachers/services/teacher.service';
import { DatePipe, CommonModule } from '@angular/common';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../../shared/toast/toast.service'; // i18n toasts

@Component({
  selector: 'app-teacher-details',
  templateUrl: './show.component.html',
  imports: [TranslatePipe, DatePipe, CommonModule],
})
export class TeacherDetailsComponent implements OnInit, OnDestroy {
  teacher: CombinedTeacherLocalized | undefined;
  private destroy$ = new Subject<void>();
  private currentLang = new BehaviorSubject<string>('fr'); // Default to French
  currentLang$ = this.currentLang.asObservable();

  constructor(
    private teacherService: TeacherService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private toast: ToastService
  ) {}

  getCurrentDepartmentValue(): string {
    const currentLang = this.translate.currentLang;
    const teacher = this.teacher;
    if (!teacher) return '';

    switch (currentLang) {
      case 'fr':
        return teacher.department_fr || '';
      case 'en':
        return teacher.department || '';
      default: // en or any other language
        return teacher.department_fr || '';
    }
  }

  getCurrentGradValue(): string {
    const currentLang = this.translate.currentLang;
    const teacher = this.teacher;
    if (!teacher) return '';

    switch (currentLang) {
      case 'fr':
        return teacher.grad_fr || '';
      case 'en':
        return teacher.grad || '';
      default: // en or any other language
        return teacher.grad_fr || '';
    }
  }

  ngOnInit(): void {
    this.loadTeacher();

    // Reload teacher when language changes
    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadTeacher();
      });
  }

  loadTeacher() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.teacherService
      .getTeacher(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (teacher) => {
          this.teacher = teacher;
        },
        error: () => {
          // Generic error (no details)
          this.toast.errorKey('toasts.generic_error');
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToEditTeacher(id: number): void {
    this.router.navigate(['/teachers', id, 'edit']);
  }

  // teacher-detail.component.ts
  downloadCv() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.teacherService
      .getTeacher(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (teacher) => {
          if (!teacher) return;
          this.teacherService.downloadTeacherCv(teacher.id).subscribe({
            next: (response: any) => {
              // Create a download link and trigger click
              const blob = new Blob([response], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);

              const a = document.createElement('a');
              a.href = url;
              a.download = `${teacher.first_name}_CV.pdf`; // Customize filename
              document.body.appendChild(a);
              a.click();

              // Clean up
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);

              // ✅ success toast
              this.toast.successKey('toasts.cv_downloaded');
            },
            error: () => {
              // Generic error (no details)
              this.toast.errorKey('toasts.generic_error');
            },
          });
        },
        error: () => {
          // Generic error (no details)
          this.toast.errorKey('toasts.generic_error');
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/teachers']);
  }

  downloadPDF(id: number): void {
  const currentLang = this.translate.currentLang || this.translate.defaultLang || 'fr';

  this.teacherService.downloadTeacherPdf(id, currentLang).subscribe({
    next: (pdfBlob) => {
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teacher-${id}-${currentLang}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      this.toast.successKey('toasts.pdf_downloaded');
    },
    error: async (err) => {
      // If an interceptor left a Blob inside the error, try to read it (optional)
      try {
        if (err?.error instanceof Blob) {
          const text = await err.error.text();
          // You could parse and use a server message here if you want:
          // const j = JSON.parse(text); this.toast.errorKey(j.messageKey || 'toasts.generic_error');
        }
      } catch {}
      this.toast.errorKey('toasts.generic_error');
    }
  });
}

}
