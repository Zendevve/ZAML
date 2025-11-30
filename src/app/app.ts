import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar';
import { ToastComponent } from './components/toast/toast.component';
import { AddonService } from './services/addon';

import { LoadingOverlayComponent } from './components/shared/loading-overlay.component';
import { ConfirmDialogComponent } from './components/shared/confirm-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, ToastComponent, LoadingOverlayComponent, ConfirmDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  addonService = inject(AddonService);

  ngOnInit() {
    // Initialize addons from localStorage
    this.addonService.initializeFromStorage();
  }
}
