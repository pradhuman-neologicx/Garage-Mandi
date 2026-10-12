import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { CustomerService } from 'src/app/core/services/customer.service';
import { JwtService } from 'src/app/core/services/jwt.service';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './recent-activity.component.html',
  styleUrl: './recent-activity.component.scss'
})
export class RecentActivityComponent implements OnInit {
  allActivities: any[] = [];  // Full data from API
  activities: any[] = [];     // Filtered data shown on screen
  isLoading = false;

  filterFromDate = '';
  filterToDate = '';

  constructor(
    private customerService: CustomerService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.jwtService.getCustomerIsLoggedIn()) {
      this.router.navigate(['/customer-login']);
      return;
    }
    this.fetchActivities();
  }

  fetchActivities() {
    this.isLoading = true;
    this.customerService.getRecentActivities().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.allActivities = res.data || [];
        this.activities = [...this.allActivities];
      },
      error: (err: any) => {
        this.isLoading = false;
        this.notificationService.show('Failed to load activities', 'error');
      }
    });
  }

  applyFilter() {
    if (!this.filterFromDate && !this.filterToDate) {
      this.activities = [...this.allActivities];
      return;
    }

    this.activities = this.allActivities.filter(activity => {
      const activityDate = new Date(activity.created_at).setHours(0, 0, 0, 0);

      if (this.filterFromDate && this.filterToDate) {
        const from = new Date(this.filterFromDate).setHours(0, 0, 0, 0);
        const to = new Date(this.filterToDate).setHours(23, 59, 59, 999);
        return activityDate >= from && activityDate <= to;
      } else if (this.filterFromDate) {
        const from = new Date(this.filterFromDate).setHours(0, 0, 0, 0);
        return activityDate >= from;
      } else if (this.filterToDate) {
        const to = new Date(this.filterToDate).setHours(23, 59, 59, 999);
        return activityDate <= to;
      }
      return true;
    });
  }

  clearFilter() {
    this.filterFromDate = '';
    this.filterToDate = '';
    this.activities = [...this.allActivities];
  }

  getActivityIcon(activity: any): string {
    const iconMap: any = {
      'wrench': 'fa-solid fa-wrench',
      'user': 'fa-solid fa-user-pen',
      'gear': 'fa-solid fa-gear',
      'document-dollar': 'fa-solid fa-file-invoice-dollar',
      'car': 'fa-solid fa-car',
      'star': 'fa-solid fa-star',
    };
    return iconMap[activity.icon] || 'fa-solid fa-circle-info';
  }

  getActivityColor(type: string): string {
    const colors: any = {
      'service_request': 'bg-blue-100 text-blue-600',
      'quotation_received': 'bg-emerald-100 text-emerald-600',
      'spare_part_inquiry': 'bg-purple-100 text-purple-600',
      'profile_updated': 'bg-amber-100 text-amber-600',
      'vehicle_added': 'bg-indigo-100 text-indigo-600',
      'feedback': 'bg-yellow-100 text-yellow-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-500';
  }
}
