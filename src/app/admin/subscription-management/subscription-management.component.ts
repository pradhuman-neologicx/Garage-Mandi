import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

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

  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
  }

  onTableDataChange(event: any) {
    this.page = event;
  }

  get totalRecords(): number {
    switch (this.activeTab) {
      case 'providers': return this.providerSubscriptions.length;
      case 'alerts': return this.renewalAlerts.length;
      default: return 0;
    }
  }

  platformPlan = {
    name: 'Standard Plan',
    duration: 'First 2 Months Free',
    price: 999,
    features: 'Unlimited leads, Priority listing'
  };

  providerSubscriptions: any[] = [
    { providerId: 'SP001', name: 'AutoCare Garage', plan: 'Standard Plan', startDate: '01-Jan-2026', endDate: '01-Apr-2026', status: 'Active' },
    { providerId: 'SP002', name: 'Bike Masters', plan: 'Standard Plan', startDate: '15-Dec-2025', endDate: '15-Jan-2026', status: 'Expired' },
    { providerId: 'SP005', name: 'Elite Motors', plan: 'Standard Plan', startDate: '20-May-2026', endDate: '20-Jun-2026', status: 'Promotional Phase' }
  ];

  paymentHistory = [
    { txnId: 'TXN892374', date: '01-Jan-2026', provider: 'AutoCare Garage', amount: 2499, method: 'UPI', status: 'Success' },
    { txnId: 'TXN892341', date: '15-Dec-2025', provider: 'Bike Masters', amount: 999, method: 'Credit Card', status: 'Success' },
    { txnId: 'TXN892300', date: '10-May-2026', provider: 'Speedy Tyres', amount: 2499, method: 'UPI', status: 'Failed' }
  ];

  renewalAlerts = [
    { providerId: 'SP010', name: 'City Garage', plan: 'Standard Plan', expiryDate: '25-May-2026', daysLeft: 3 },
    { providerId: 'SP014', name: 'Quick Fix Auto', plan: 'Standard Plan', expiryDate: '28-May-2026', daysLeft: 6 }
  ];

  isEditPlanModalOpen: boolean = false;
  editPlanData: any = {};

  isPaymentModalOpen: boolean = false;
  selectedProvider: any = null;

  constructor() { }

  ngOnInit(): void {
    this.providerSubscriptions.forEach(sub => {
      sub.payments = this.paymentHistory.filter(p => p.provider === sub.name);
    });
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.page = 1;
  }

  openEditPlanModal() {
    this.editPlanData = { ...this.platformPlan };
    this.isEditPlanModalOpen = true;
  }

  closeEditPlanModal() {
    this.isEditPlanModalOpen = false;
  }

  savePlan() {
    this.platformPlan = { ...this.editPlanData };
    this.closeEditPlanModal();
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
