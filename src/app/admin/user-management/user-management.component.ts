import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxPaginationModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
  activeTab: string = 'service_providers';

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
      case 'service_providers': return this.serviceProviders.length;
      case 'customers': return this.customers.length;
      case 'field_executives': return this.fieldExecutives.length;
      case 'system_admins': return this.systemAdmins.length;
      default: return 0;
    }
  }

  // Mock Data
  systemAdmins = [
    { id: 1, name: 'Rahul Admin', phone: '+91 9876543210', email: 'rahul.admin@garagemandi.com', role: 'System Admin', status: 'Active' },
    { id: 2, name: 'Neha Manager', phone: '+91 8765432109', email: 'neha@garagemandi.com', role: 'System Admin', status: 'Active' }
  ];

  customers = [
    { id: 101, name: 'Amit Kumar', phone: '+91 9876543210', email: 'amit.k@gmail.com', lastActive: '2 Hours Ago', status: 'Active' },
    { id: 102, name: 'Priya Singh', phone: '+91 8765432109', email: 'priya.s@yahoo.com', lastActive: '1 Day Ago', status: 'Active' },
    { id: 103, name: 'Rajesh Verma', phone: '+91 7654321098', email: 'rajesh.verma@outlook.com', lastActive: '5 Days Ago', status: 'Inactive' }
  ];

  serviceProviders = [
    { id: 'SP001', name: 'AutoCare Garage', owner: 'Vikram Sharma', phone: '+91 9998887776', email: 'vikram@autocare.in', category: '4-Wheeler', rating: 4.8, approvalStatus: 'Approved', status: 'Active' },
    { id: 'SP002', name: 'Bike Masters', owner: 'Suresh Patil', phone: '+91 8887776665', email: 'suresh@bikemasters.com', category: '2-Wheeler', rating: 4.5, approvalStatus: 'Pending', status: 'Inactive' },
    { id: 'SP003', name: 'TruckFix Hub', owner: 'Gurpreet Singh', phone: '+91 7776665554', email: 'gurpreet@truckfix.com', category: 'Trucks', rating: 4.9, approvalStatus: 'Approved', status: 'Active' },
  ];

  fieldExecutives = [
    { id: 'EMP001', name: 'Rahul Jain', email: 'rahul.jain@garagemandi.com', region: 'Delhi NCR', rating: 4.7, status: 'Active' },
    { id: 'EMP045', name: 'Amit Sharma', email: 'amit.sharma@garagemandi.com', region: 'Mumbai', rating: 4.6, status: 'Active' },
    { id: 'EMP023', name: 'Sunil Kumar', email: 'sunil.k@garagemandi.com', region: 'Bangalore', rating: 4.8, status: 'Active' }
  ];

  isModalOpen: boolean = false;
  modalMode: 'add' | 'edit' | 'view' = 'view';
  selectedUser: any = null;
  objectKeys = Object.keys;

  isApprovalModalOpen: boolean = false;
  approvalAction: 'approve' | 'reject' = 'approve';
  approvalTarget: any = null;

  constructor() { }

  ngOnInit(): void {
  }

  switchTab(tabName: string) {
    this.activeTab = tabName;
    this.page = 1;
  }

  openModal(mode: 'add' | 'edit' | 'view', user?: any) {
    this.modalMode = mode;
    this.selectedUser = user ? { ...user } : {};
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedUser = null;
  }

  saveUser() {
    this.closeModal();
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (this.selectedUser) {
          this.selectedUser.imagePreview = e.target?.result as string;
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  openApprovalModal(action: 'approve' | 'reject', user: any) {
    this.approvalAction = action;
    this.approvalTarget = user;
    this.isApprovalModalOpen = true;
  }

  closeApprovalModal() {
    this.isApprovalModalOpen = false;
    this.approvalTarget = null;
  }

  confirmApproval() {
    if (this.approvalTarget) {
      this.approvalTarget.approvalStatus = this.approvalAction === 'approve' ? 'Approved' : 'Rejected';
    }
    this.closeApprovalModal();
  }
}
