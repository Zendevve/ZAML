import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="dialogService.isOpen()"
         class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-scale-in">

        <!-- Header -->
        <div class="p-6 pb-4">
          <h3 class="text-lg font-semibold text-zinc-100 mb-2">
            {{ dialogService.data().title }}
          </h3>
          <p class="text-zinc-400 text-sm leading-relaxed">
            {{ dialogService.data().message }}
          </p>
        </div>

        <!-- Actions -->
        <div class="bg-zinc-950/50 p-4 flex justify-end gap-3 border-t border-zinc-800/50">
          <button (click)="dialogService.close(false)"
                  class="px-4 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
            {{ dialogService.data().cancelText }}
          </button>

          <button (click)="dialogService.close(true)"
                  [class]="getConfirmButtonClass()">
            {{ dialogService.data().confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scale-in {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-fade-in {
      animation: fade-in 0.15s ease-out;
    }
    .animate-scale-in {
      animation: scale-in 0.2s ease-out;
    }
  `]
})
export class ConfirmDialogComponent {
  dialogService = inject(DialogService);

  getConfirmButtonClass(): string {
    const type = this.dialogService.data().type;
    const base = "px-4 py-2 rounded-md text-sm font-medium text-white transition-colors shadow-sm";

    switch (type) {
      case 'danger':
        return `${base} bg-red-600 hover:bg-red-500`;
      case 'warning':
        return `${base} bg-amber-600 hover:bg-amber-500`;
      default:
        return `${base} bg-emerald-600 hover:bg-emerald-500`;
    }
  }
}
