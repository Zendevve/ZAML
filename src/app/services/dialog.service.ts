import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  isOpen = signal(false);
  data = signal<ConfirmDialogData>({ title: '', message: '' });

  private resolveRef: ((value: boolean) => void) | null = null;

  confirm(data: ConfirmDialogData): Promise<boolean> {
    this.data.set({
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type: 'warning',
      ...data
    });
    this.isOpen.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolveRef = resolve;
    });
  }

  close(result: boolean) {
    this.isOpen.set(false);
    if (this.resolveRef) {
      this.resolveRef(result);
      this.resolveRef = null;
    }
  }
}
