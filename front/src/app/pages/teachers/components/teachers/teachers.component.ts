import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TeacherService, CombinedTeacherLocalized } from '../../services/teacher.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, TranslatePipe],
  templateUrl: './teachers.component.html',
})
export class TeachersComponent implements OnInit, OnDestroy {
  showExportDropdown = false;
  viewMode: 'table' | 'grid' = 'table';
  teachers: CombinedTeacherLocalized[] = [];
  allTeachers: CombinedTeacherLocalized[] = [];
  filteredTeachers: CombinedTeacherLocalized[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private teacherService: TeacherService,
    private router: Router,
    private translate: TranslateService,
    private toast: ToastService
  ) {}

  toggleExportDropdown(): void {
    this.showExportDropdown = !this.showExportDropdown;
  }

  getCurrentDepartmentValue(teacher: any): string {
    const currentLang = this.translate.currentLang;
    if (!teacher) return '';
    switch (currentLang) {
      case 'fr':
        return teacher.department_fr || teacher.department || '';
      case 'en':
        return teacher.department || teacher.department_fr || '';
      default:
        return teacher.department || teacher.department_fr || '';
    }
  }

  getCurrentGradValue(teacher: any): string {
    const currentLang = this.translate.currentLang;
    if (!teacher) return '';
    switch (currentLang) {
      case 'fr':
        return teacher.grad_fr || teacher.grad || '';
      case 'en':
        return teacher.grad || teacher.grad_fr || '';
      default:
        return teacher.grad || teacher.grad_fr || '';
    }
  }

  closeExportDropdown(): void {
    this.showExportDropdown = false;
  }

  exportData(format: 'csv' | 'excel' | 'pdf'): void {
    this.closeExportDropdown();
    switch (format) {
      case 'csv':
        this.exportToCSV().then(() => {});
        break;
      case 'excel':
        this.exportToExcel().then(() => {});
        break;
      case 'pdf':
        this.exportToPDF().then(() => {});
        break;
    }
  }

  private async exportToCSV(): Promise<void> {
    if (!this.teachers?.length) {
      this.toast.warningKey('toasts.export_no_data');
      return;
    }

    try {
      const [cinLabel, nameLabel, emailLabel, phoneLabel, departmentLabel, gradLabel] =
        await Promise.all([
          this.translate.get('teachers-table-cin').toPromise(),
          this.translate.get('teachers-table-name').toPromise(),
          this.translate.get('teachers-table-email').toPromise(),
          this.translate.get('teachers-table-phone').toPromise(),
          this.translate.get('teachers-table-department').toPromise(),
          this.translate.get('teachers-table-grad').toPromise(),
        ]);

      const headers = [cinLabel, nameLabel, emailLabel, phoneLabel, departmentLabel, gradLabel];

      const csvData = this.teachers.map((teacher) => [
        teacher.cin,
        `${teacher.first_name} ${teacher.last_name}`.trim(),
        teacher.email,
        teacher.phone_number,
        teacher.department,
        teacher.grad,
      ]);

      const csvContent = [headers, ...csvData]
        .map((row) => row.map((field) => `"${field || ''}"`).join(','))
        .join('\n');

      this.downloadFile(csvContent, 'teachers.csv', 'text/csv');
      this.toast.successKey('toasts.export_csv_done');
    } catch {
      this.toast.errorKey('toasts.generic_error');
    }
  }

  private async exportToExcel(): Promise<void> {
    if (!this.teachers?.length) {
      this.toast.warningKey('toasts.export_no_data');
      return;
    }

    try {
      const [cinLabel, nameLabel, emailLabel, phoneLabel, departmentLabel, gradLabel] =
        await Promise.all([
          this.translate.get('teachers-table-cin').toPromise(),
          this.translate.get('teachers-table-name').toPromise(),
          this.translate.get('teachers-table-email').toPromise(),
          this.translate.get('teachers-table-phone').toPromise(),
          this.translate.get('teachers-table-department').toPromise(),
          this.translate.get('teachers-table-grad').toPromise(),
        ]);

      const worksheet = XLSX.utils.json_to_sheet(
        this.teachers.map((teacher) => ({
          [cinLabel]: teacher.cin,
          [nameLabel]: `${teacher.first_name} ${teacher.last_name}`.trim(),
          [emailLabel]: teacher.email,
          [phoneLabel]: teacher.phone_number,
          [departmentLabel]: teacher.department,
          [gradLabel]: teacher.grad,
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers');
      XLSX.writeFile(workbook, 'teachers.xlsx');

      this.toast.successKey('toasts.export_excel_done');
    } catch {
      this.toast.errorKey('toasts.generic_error');
    }
  }

  private async exportToPDF(): Promise<void> {
    if (!this.teachers?.length) {
      this.toast.warningKey('toasts.export_no_data');
      return;
    }

    try {
      const doc = new jsPDF();

      const [title, cinLabel, nameLabel, emailLabel, phoneLabel, departmentLabel, gradLabel] =
        await Promise.all([
          this.translate.get('teachers-title').toPromise(),
          this.translate.get('teachers-table-cin').toPromise(),
          this.translate.get('teachers-table-name').toPromise(),
          this.translate.get('teachers-table-email').toPromise(),
          this.translate.get('teachers-table-phone').toPromise(),
          this.translate.get('teachers-table-department').toPromise(),
          this.translate.get('teachers-table-grad').toPromise(),
        ]);

      doc.setFontSize(16);
      doc.text(title, 14, 15);

      const tableData = this.teachers.map((t) => [
        t.cin || '-',
        `${t.first_name} ${t.last_name}`.trim(),
        t.email || '-',
        t.phone_number || '-',
        t.department || '-',
        t.grad || '-',
      ]);

      autoTable(doc, {
        head: [[cinLabel, nameLabel, emailLabel, phoneLabel, departmentLabel, gradLabel]],
        body: tableData,
        startY: 25,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [7, 61, 134], textColor: 255 },
      });

      doc.save('teachers.pdf');
      this.toast.successKey('toasts.export_pdf_done');
    } catch {
      this.toast.errorKey('toasts.generic_error');
    }
  }

  private downloadFile(content: string, fileName: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  ngOnInit(): void {
    this.loadTeachers();
    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadTeachers());
  }

  loadTeachers(): void {
    this.teacherService
      .getTeachers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (teachers) => {
          this.teachers = teachers;
          this.allTeachers = teachers;
          this.filteredTeachers = [...teachers];
        },
        error: () => this.toast.errorKey('toasts.generic_error'),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Navigation
  goToAddTeacher(): void {
    this.router.navigate(['/teachers/addTeacher']);
  }
  goToShowTeacher(id: number): void {
    this.router.navigate(['/teachers', id, 'show']);
  }
  goToEditTeacher(id: number): void {
    this.router.navigate(['/teachers', id, 'edit']);
  }

  // Delete with native confirm (translated)
  deleteTeacher(id: number): void {
    const message = this.translate.instant('toasts.confirm_delete_teacher');
    if (!window.confirm(message)) return;

    this.teacherService
      .delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.successKey('toasts.teacher_deleted');
          this.loadTeachers();
        },
        error: () => this.toast.errorKey('toasts.generic_error'),
      });
  }

  onSearch(searchCriteria: any): void {
  if (!this.allTeachers.length) return;

  const qGrad = (searchCriteria.grad || '').toLowerCase();
  const qDept = (searchCriteria.department || '').toLowerCase();

  this.filteredTeachers = this.allTeachers.filter((teacher) => {
    const matchesName =
      !searchCriteria.name ||
      teacher.first_name.toLowerCase().includes(searchCriteria.name.toLowerCase()) ||
      teacher.last_name.toLowerCase().includes(searchCriteria.name.toLowerCase());

    const matchesCin = !searchCriteria.cin || teacher.cin.includes(searchCriteria.cin);

    const matchesEmail =
      !searchCriteria.email || teacher.email.toLowerCase().includes(searchCriteria.email.toLowerCase());

    // ✅ compare against all localized grad fields
    const matchesGrad =
      !qGrad ||
      [teacher.grad, teacher.grad_fr, teacher.grad_ar]
        .some(v => (v || '').toLowerCase().includes(qGrad));

    // ✅ compare against all localized department fields
    const matchesDepartment =
      !qDept ||
      [teacher.department, teacher.department_fr, teacher.department_ar]
        .some(v => (v || '').toLowerCase().includes(qDept));

    const teacherBirthYear = teacher.birth_date ? new Date(teacher.birth_date).getFullYear() : null;
    const matchesBirthYear = !searchCriteria.birthYear || teacherBirthYear === +searchCriteria.birthYear;

    const teacherEmploymentYear = teacher.created_at ? new Date(teacher.created_at).getFullYear() : null;
    const matchesEmploymentYear =
      !searchCriteria.employmentYear || teacherEmploymentYear === +searchCriteria.employmentYear;

    return (
      matchesName &&
      matchesCin &&
      matchesEmail &&
      matchesGrad &&
      matchesDepartment &&
      matchesBirthYear &&
      matchesEmploymentYear
    );
  });

  if (this.filteredTeachers.length === 0) {
    this.toast.infoKey('toasts.no_search_results');
  }
}

}
