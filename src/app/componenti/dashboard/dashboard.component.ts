import {Component,} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet, MatSidenavModule, MatToolbarModule, MatButtonModule, MatIconModule, MatListModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  isSidebarOpen = true; // Sidebar inizialmente aperta

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

}
