import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AdminService } from '../../core/services/admin.service';
import { NotificationService } from '../../core/services/notificationnew.service';

@Component({
  selector: 'app-subscription-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './subscription-management.component.html',
  styleUrl: './subscription-management.component.scss'
})
export class SubscriptionManagementComponent implements OnInit {
  activeTab: string = 'providers';

  tableSize: any = 10;
  tableSizes: any = [10, 20, 50, 100, 'all'];
  page: number = 1;
  apiTotalRecords: number = 0;

  searchText: string = '';
  filterStartDate: string = '';
  filterEndDate: string = '';

  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    if (this.activeTab === 'providers') {
      this.fetchProviderSubscriptions();
    } else if (this.activeTab === 'alerts') {
      this.fetchRenewalAlerts();
    }
  }

  onTableDataChange(event: any) {
    this.page = event;
    if (this.activeTab === 'providers') {
      this.fetchProviderSubscriptions();
    } else if (this.activeTab === 'alerts') {
      this.fetchRenewalAlerts();
    }
  }

  onFilterChange() {
    this.page = 1;
    if (this.activeTab === 'providers') {
      this.fetchProviderSubscriptions();
    } else if (this.activeTab === 'alerts') {
      this.fetchRenewalAlerts();
    }
  }

  resetFilters() {
    this.searchText = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.page = 1;
    if (this.activeTab === 'providers') {
      this.fetchProviderSubscriptions();
    } else if (this.activeTab === 'alerts') {
      this.fetchRenewalAlerts();
    }
  }

  get totalRecords(): number {
    switch (this.activeTab) {
      case 'providers': return this.apiTotalRecords || this.providerSubscriptions.length;
      case 'alerts': return this.apiTotalRecords || this.renewalAlerts.length;
      default: return 0;
    }
  }

  platformPlan: any = {
    id: null,
    name: 'Standard Plan',
    duration: 'First 2 Months Free',
    price: 999,
    features: 'Unlimited leads, Priority listing'
  };

  providerSubscriptions: any[] = [];

  paymentHistory = [
    { txnId: 'TXN892374', date: '01-Jan-2026', provider: 'AutoCare Garage', amount: 2499, method: 'UPI', status: 'Success' },
    { txnId: 'TXN892341', date: '15-Dec-2025', provider: 'Bike Masters', amount: 999, method: 'Credit Card', status: 'Success' },
    { txnId: 'TXN892300', date: '10-May-2026', provider: 'Speedy Tyres', amount: 2499, method: 'UPI', status: 'Failed' }
  ];

  renewalAlerts: any[] = [];

  isEditPlanModalOpen: boolean = false;
  editPlanData: any = {};

  isPaymentModalOpen: boolean = false;
  selectedProvider: any = null;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.fetchSubscriptionPlan();
    this.fetchProviderSubscriptions();
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  }

  fetchProviderSubscriptions() {
    this.adminService.getProviderSubscriptions(this.tableSize, this.page, this.searchText, this.filterStartDate, this.filterEndDate).subscribe({
      next: (res: any) => {
        if (res && (res.status === 200 || res.status === true)) {
          const apiData = res.data?.data || res.data || [];
          
          this.providerSubscriptions = apiData.map((item: any) => {
            const providerName = item.provider?.name || 'Unknown';
            return {
              providerId: item.provider?.id || item.provider_id || 'N/A',
              phoneNumber: item.provider?.phone_number || 'N/A',
              name: providerName,
              plan: item.plan?.name || 'Standard Plan',
              startDate: this.formatDate(item.current_period_start || item.subscription_starts_at),
              endDate: this.formatDate(item.current_period_end || item.trial_ends_at),
              trialEndsAt: item.trial_ends_at ? this.formatDate(item.trial_ends_at) : null,
              status: item.status || 'Active',
              payments: this.paymentHistory.filter(p => p.provider === providerName),
              rawData: item
            };
          });

          if (res.data && res.data.total !== undefined) {
            this.apiTotalRecords = res.data.total;
          }
        }
      },
      error: (err: any) => console.error('Failed to fetch provider subscriptions', err)
    });
  }

  fetchRenewalAlerts() {
    this.adminService.getProviderExpirySubscriptions(this.tableSize, this.page, this.searchText, this.filterStartDate, this.filterEndDate).subscribe({
      next: (res: any) => {
        if (res && (res.status === 200 || res.status === true)) {
          const apiData = res.data?.data || res.data || [];
          
          this.renewalAlerts = apiData.map((item: any) => {
            const providerName = item.provider?.name || 'Unknown';
            
            // Calculate days left if not provided by backend
            let daysLeft = item.days_left;
            if (daysLeft === undefined && item.current_period_end) {
              const endDate = new Date(item.current_period_end);
              const today = new Date();
              const diffTime = endDate.getTime() - today.getTime();
              daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            } else if (daysLeft === undefined && item.trial_ends_at) {
              const endDate = new Date(item.trial_ends_at);
              const today = new Date();
              const diffTime = endDate.getTime() - today.getTime();
              daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            return {
              providerId: item.provider?.id || item.provider_id || 'N/A',
              phoneNumber: item.provider?.phone_number || 'N/A',
              name: providerName,
              plan: item.plan?.name || 'Standard Plan',
              expiryDate: this.formatDate(item.current_period_end || item.trial_ends_at),
              daysLeft: daysLeft !== undefined ? daysLeft : 'N/A',
              rawData: item
            };
          });

          if (res.data && res.data.total !== undefined) {
            this.apiTotalRecords = res.data.total;
          }
        }
      },
      error: (err: any) => console.error('Failed to fetch renewal alerts', err)
    });
  }

  fetchSubscriptionPlan() {
    this.adminService.getSubscriptionPlan().subscribe({
      next: (res: any) => {
        if (res && (res.status === 200 || res.status === true)) {
          const data = res.data?.data || res.data || {};
          this.platformPlan = {
            id: data.id || null,
            name: data.name || this.platformPlan.name,
            duration: data.duration || this.platformPlan.duration,
            price: data.amount !== undefined ? data.amount : (data.price !== undefined ? data.price : this.platformPlan.price),
            features: data.features || this.platformPlan.features
          };
        }
      },
      error: (err: any) => console.error('Failed to fetch subscription plan', err)
    });
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.page = 1;
    this.apiTotalRecords = 0;
    if (tab === 'providers') {
      this.fetchProviderSubscriptions();
    } else if (tab === 'alerts') {
      this.fetchRenewalAlerts();
    }
  }

  openEditPlanModal() {
    this.editPlanData = { ...this.platformPlan };
    this.isEditPlanModalOpen = true;
  }

  closeEditPlanModal() {
    this.isEditPlanModalOpen = false;
  }

  savePlan() {
    if (this.editPlanData.price === null || this.editPlanData.price === undefined || this.editPlanData.price === '') {
      this.notificationService.show('Price is mandatory', 'error');
      return;
    }

    const payload = {
      amount: this.editPlanData.price
    };
    
    this.adminService.updateSubscriptionPlan(payload).subscribe({
      next: (response: any) => {
        if (response && (response.status === 200 || response.status === 201 || response.status === true)) {
          this.notificationService.show(response.message || 'Subscription plan updated successfully', 'success');
          this.platformPlan.price = this.editPlanData.price;
          this.closeEditPlanModal();
        } else {
          this.notificationService.show(response.message || 'Failed to update plan', 'error');
        }
      },
      error: (err: any) => {
        this.notificationService.show(err?.error?.message || err?.message || 'Error updating plan', 'error');
      }
    });
  }

  openPaymentModal(provider: any) {
    this.selectedProvider = provider;
    this.isPaymentModalOpen = true;
  }

  closePaymentModal() {
    this.isPaymentModalOpen = false;
    this.selectedProvider = null;
  }
}
