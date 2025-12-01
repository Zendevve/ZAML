import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { AddonService } from '../../services/addon';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, HlmCardImports, HlmButton],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  addonService = inject(AddonService);

  stats = {
    lastCheck: new Date()
  };
}
