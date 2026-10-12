import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { CustomerService } from 'src/app/core/services/customer.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, RouterModule],
  templateUrl: './my-requests.component.html',
  styleUrl: './my-requests.component.scss'
})
export class MyRequestsComponent implements OnInit {
  activeTab: 'service' | 'spare' = 'service';
  isLoading = false;
  
  serviceRequests: any[] = [];
  spareRequests: any[] = [];
  
  servicePagination: any = null;
  sparePagination: any = null;
  
  serviceKpis = { total: 0, active: 0, completed: 0 };
  spareKpis = { total: 0, active: 0, completed: 0 };
  
  constructor(private customerService: CustomerService) {}
  
  ngOnInit() {
    this.switchTab('service');
  }
  
  switchTab(tab: 'service' | 'spare') {
    this.activeTab = tab;
    if (tab === 'service') {
      this.fetchServiceRequests(1, 10);
    } else {
      this.fetchSpareRequests(1, 10);
    }
  }

  changePage(page: number) {
    if (this.activeTab === 'service') {
      this.fetchServiceRequests(page, 10);
    } else {
      this.fetchSpareRequests(page, 10);
    }
  }
  
  fetchServiceRequests(page: number = 1, limit: number = 10) {
    this.isLoading = true;
    this.customerService.getServiceRequests(page, limit).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.serviceRequests = res.data || [];
        this.servicePagination = res.pagination || null;
        if (res.summary) {
          this.serviceKpis = res.summary;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  
  fetchSpareRequests(page: number = 1, limit: number = 10) {
    this.isLoading = true;
    this.customerService.getSparePartRequests(page, limit).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.spareRequests = res.data || [];
        this.sparePagination = res.pagination || null;
        if (res.summary) {
          this.spareKpis = res.summary;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  
  getStatusClass(status: string): string {
    const s = status?.toLowerCase() || '';
    if (s === 'completed' || s === 'delivered' || s === 'closed') return 'bg-green-100 text-green-800';
    if (s === 'pending' || s === 'processing' || s === 'open') return 'bg-yellow-100 text-yellow-800';
    if (s === 'cancelled' || s === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  }
}
