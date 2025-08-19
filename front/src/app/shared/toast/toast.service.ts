// shared/toast/toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'confirm';

export interface ToastAction {
  value: any;
  label?: string;
  labelKey?: string;
  primary?: boolean;
}

export interface ToastItem {
  id: number;
  type: ToastType;
  // plain text (no i18n)
  title?: string;
  message?: string;
  // i18n keys
  titleKey?: string;
  messageKey?: string;
  params?: Record<string, any>;
  actions?: ToastAction[];
  duration?: number; // ms; ignored for confirm
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 1;
  private _toasts = new BehaviorSubject<ToastItem[]>([]);
  public toasts$ = this._toasts.asObservable();

  /** ---------- Basic show (plain text) ---------- */
  show(toast: Omit<ToastItem, 'id'>) {
    const id = this.seq++;
    const item: ToastItem = { id, duration: 3000, ...toast };
    this._toasts.next([...this._toasts.value, item]);

    // auto-dismiss for non-confirm
    if (item.type !== 'confirm' && item.duration && item.duration > 0) {
      setTimeout(() => this.dismiss(id), item.duration);
    }
    return id;
  }

  /** ---------- Key helpers (i18n) ---------- */
  successKey(messageKey: string, params?: Record<string, any>) {
    this.show({ type: 'success', messageKey, params });
  }
  errorKey(messageKey: string, params?: Record<string, any>) {
    this.show({ type: 'error', messageKey, params, duration: 4000 });
  }
  infoKey(messageKey: string, params?: Record<string, any>) {
    this.show({ type: 'info', messageKey, params });
  }
  warningKey(messageKey: string, params?: Record<string, any>) {
    this.show({ type: 'warning', messageKey, params });
  }

  /** ---------- Confirm with i18n key ---------- */
  confirmKey(messageKey: string, params?: Record<string, any>): Promise<boolean> {
  const id = this.seq++;
  const item: ToastItem = {
    id,
    type: 'confirm',
    messageKey,
    params,
    actions: [
      { value: true,  labelKey: 'common.confirm', primary: true },
      { value: false, labelKey: 'common.cancel' }
    ]
  };

  this._toasts.next([...this._toasts.value, item]);

  return new Promise<boolean>((resolve) => {
    (this as any)[`__resolver_${id}`] = (v: boolean) => {
      resolve(!!v);
      this.dismiss(id);
      delete (this as any)[`__resolver_${id}`];
    };
  });
}

// Called by the container when a button is clicked:
resolveAction(id: number, value: any) {
  const r = (this as any)[`__resolver_${id}`];
  if (r) r(value);
}


  /** Remove a toast by id */
  dismiss(id: number) {
    this._toasts.next(this._toasts.value.filter(t => t.id !== id));
  }
}
