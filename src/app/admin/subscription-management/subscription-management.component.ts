import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AdminService } from '../../core/services/admin.service';
import { NotificationService } from '../../core/services/notificationnew.service';
import { JwtService } from '../../core/services/jwt.service';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-subscription-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
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
  filterStatus: string = '';

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
    if (this.filterStartDate && this.filterEndDate) {
      const start = new Date(this.filterStartDate);
      const end = new Date(this.filterEndDate);
      if (end < start) {
        this.notificationService.show('To Date must be greater than or equal to From Date', 'error');
        this.filterEndDate = ''; // Reset the invalid end date
        return; // Stop the API call
      }
    }

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
    this.filterStatus = '';
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

  platformPlans: any[] = [];

  providerSubscriptions: any[] = [];



  renewalAlerts: any[] = [];

  isEditPlanModalOpen: boolean = false;
  editPlanData: any = {};

  isPaymentModalOpen: boolean = false;
  selectedProvider: any = null;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService,
    private jwtService: JwtService
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
    this.adminService.getProviderSubscriptions(this.tableSize, this.page, this.searchText, this.filterStartDate, this.filterEndDate, this.filterStatus).subscribe({
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
              payments: [],
              rawData: item
            };
          });

          if (res.pagination && res.pagination.total !== undefined) {
            this.apiTotalRecords = res.pagination.total;
          } else if (res.data && res.data.total !== undefined) {
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

          if (res.pagination && res.pagination.total !== undefined) {
            this.apiTotalRecords = res.pagination.total;
          } else if (res.data && res.data.total !== undefined) {
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
          const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);

          this.platformPlans = data.map((plan: any) => {
            let featuresList: string[] = [];
            if (plan.features) {
              featuresList = typeof plan.features === 'string' ? plan.features.split(',').map((f: string) => f.trim()) : plan.features;
            }

            return {
              id: plan.id,
              name: plan.name || 'Plan',
              price: plan.amount !== undefined ? Number(plan.amount) : 0,
              features: featuresList,
              vehicle_category: plan.vehicle_category,
              type: plan.type,
              is_active: plan.is_active
            };
          });
        }
      },
      error: (err: any) => console.error('Failed to fetch subscription plans', err)
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

  openEditPlanModal(plan?: any) {
    if (plan) {
      // Deep copy to allow editing array without affecting original until save
      this.editPlanData = JSON.parse(JSON.stringify(plan));
    } else {
      this.editPlanData = JSON.parse(JSON.stringify(this.platformPlans[0]));
    }
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
      // Future: add features/name if backend supports updating them for multiple plans
    };

    // Send to API. Since API currently handles single plan, it will update it.
    this.adminService.updateSubscriptionPlan(this.editPlanData.id, payload).subscribe({
      next: (response: any) => {
        if (response && (response.status === 200 || response.status === 201 || response.status === true)) {
          this.notificationService.show(response.message || 'Subscription plan updated successfully', 'success');

          const index = this.platformPlans.findIndex(p => p.id === this.editPlanData.id);
          if (index !== -1) {
            this.platformPlans[index] = JSON.parse(JSON.stringify(this.editPlanData));
          }
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
    this.selectedProvider = { ...provider, isLoading: true, payments: [] };
    this.isPaymentModalOpen = true;

    const idToFetch = provider.rawData?.id || provider.providerId;

    if (idToFetch && idToFetch !== 'N/A') {
      this.adminService.getProviderSubscriptionsByID(idToFetch).subscribe({
        next: (res: any) => {
          if (res && (res.status === 200 || res.status === true)) {
            const data = res.data || {};
            this.selectedProvider.rawData = data;

            // Map previous history if they exist in the response
            if (data.previous && Array.isArray(data.previous)) {
              this.selectedProvider.history = data.previous.map((p: any) => ({
                planName: p.plan?.name || 'N/A',
                amount: p.plan?.amount || p.amount_at_purchase || 0,
                startDate: this.formatDate(p.subscription_starts_at || p.current_period_start),
                endDate: this.formatDate(p.current_period_end),
                status: p.status || 'N/A'
              }));
            } else {
              this.selectedProvider.history = [];
            }
          }
          this.selectedProvider.isLoading = false;
        },
        error: (err: any) => {
          console.error('Failed to fetch subscription details', err);
          this.selectedProvider.isLoading = false;
          this.notificationService.show('Failed to load subscription details', 'error');
        }
      });
    } else {
      this.selectedProvider.isLoading = false;
    }
  }

  closePaymentModal() {
    this.isPaymentModalOpen = false;
    this.selectedProvider = null;
  }
}
