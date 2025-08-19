import { Component } from '@angular/core';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ToastService, ToastItem } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgFor, NgIf, AsyncPipe, TranslatePipe],
  template: `
  <div class="fixed top-4 right-4 z-[9999] space-y-3 w-[min(92vw,360px)]">
    <div *ngFor="let t of toasts$ | async"
         class="group rounded-xl border shadow-lg bg-white px-4 py-3 flex gap-3 items-start transition
                animate-[slideIn_.25s_ease-out]"
         [ngClass]="borderClass(t.type)">

      <!-- Icon -->
      <div class="mt-0.5">
        <svg *ngIf="t.type==='success'" class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <svg *ngIf="t.type==='error'" class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14"/>
        </svg>
        <svg *ngIf="t.type==='info'" class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"/>
        </svg>
        <svg *ngIf="t.type==='warning'" class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
      </div>

      <!-- Text -->
      <div class="flex-1">
        <div *ngIf="t.titleKey; else plainTitle" class="text-sm font-semibold text-slate-900">
          {{ t.titleKey | translate : t.params }}
        </div>
        <ng-template #plainTitle>
          <div *ngIf="t.title" class="text-sm font-semibold text-slate-900">{{ t.title }}</div>
        </ng-template>

        <div *ngIf="t.messageKey; else plainMsg" class="text-sm text-slate-700">
          {{ t.messageKey | translate : t.params }}
        </div>
        <ng-template #plainMsg>
          <div class="text-sm text-slate-700">{{ t.message }}</div>
        </ng-template>

        <!-- Confirm buttons -->
        <div *ngIf="t.type === 'confirm'" class="mt-3 flex gap-2">
          <button
            *ngFor="let a of t.actions"
            class="px-3 py-1.5 rounded-lg text-white text-xs"
            [ngClass]="a.primary ? 'bg-[#00A099]' : 'bg-[#073D86]'"
            (click)="onAction(t.id, a.value)">
            {{ a.labelKey ? (a.labelKey | translate) : a.label }}
          </button>
        </div>
      </div>

      <!-- Close -->
      <button (click)="close(t.id)" class="opacity-60 hover:opacity-100 transition mt-0.5">
        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
  `,
  styles: [`
    @keyframes slideIn { from { transform: translateY(-6px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
  `]
})
export class ToastContainerComponent {
  toasts$!: Observable<ToastItem[]>;            // <-- use ToastItem, not Toast

  constructor(private toast: ToastService) {
    this.toasts$ = this.toast.toasts$;          // <-- set after DI is ready
  }

  close(id: number) { this.toast.dismiss(id); }
onAction(id: number, value: any) {
  this.toast.resolveAction(id, value);
}
  borderClass(type: ToastItem['type']) {
    switch (type) {
      case 'success': return 'border-emerald-200';
      case 'error':   return 'border-red-200';
      case 'info':    return 'border-sky-200';
      case 'warning':
      case 'confirm': return 'border-amber-200';
      default: return '';
    }
  }
}
