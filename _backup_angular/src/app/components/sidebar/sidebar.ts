import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideLayoutDashboard, lucidePackage, lucideSearch, lucideSettings } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, HlmSidebarImports, HlmIconImports],
  providers: [provideIcons({ lucideLayoutDashboard, lucidePackage, lucideSearch, lucideSettings })],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'lucideLayoutDashboard' },
    { path: '/manage', label: 'Manage', icon: 'lucidePackage' },
    { path: '/browse', label: 'Browse', icon: 'lucideSearch' },
    { path: '/settings', label: 'Settings', icon: 'lucideSettings' }
  ];
}
