import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EcomService } from '../../core/services/ecom.service';
import { NotificationService } from '../../core/services/notificationnew.service';

export interface PlatformFeeItem {
  id: number;
  name: string;
  code?: string;
  description?: string;
  charged_to: 'customer' | 'seller';
  percent: number | string;
  flat: number | string;
  is_active: boolean;
  is_system?: boolean;
  created_at?: string;
  updated_at?: string;
  updated_by?: any;
  created_by?: any;
}

@Component({
  selector: 'app-commission',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './commission.component.html',
  styleUrl: './commission.component.scss'
})
export class CommissionComponent implements OnInit {
  isLoading: boolean = false;
  isSaving: boolean = false;
  togglingStatusId: number | null = null;

  // List of Platform Fees / Commissions
  items: PlatformFeeItem[] = [];

  // Pagination
  currentPage: number = 1;
  perPage: number = 20;
  totalItems: number = 0;
  lastPage: number = 1;

  // Filters & Search
  searchQuery: string = '';
  appliedSearchQuery: string = '';
  chargedToFilter: string = 'all'; // 'all' | 'customer' | 'seller'
  statusFilter: string = 'all';    // 'all' | '1' | '0'
  sortDirection: 'asc' | 'desc' = 'desc';

  // Modal State
  isModalOpen: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  editingItem: PlatformFeeItem | null = null;
  feeForm!: FormGroup;

  // Live calculator test amount inside modal & test tool
  sampleCalcAmount: number = 1000;

  constructor(
    private fb: FormBuilder,
    private ecomService: EcomService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadFees();
  }

  private initForm(): void {
    this.feeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      charged_to: ['customer', [Validators.required]],
      percent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      flat: [0, [Validators.required, Validators.min(0)]],
    });
  }

  loadFees(): void {
    this.isLoading = true;
    const params: any = {
      page: this.currentPage,
      per_page: this.perPage,
      direction: this.sortDirection
    };

    if (this.appliedSearchQuery) {
      params.search = this.appliedSearchQuery;
    }

    if (this.chargedToFilter !== 'all') {
      params.charged_to = this.chargedToFilter;
    }

    if (this.statusFilter !== 'all') {
      params.is_active = this.statusFilter;
    }

    this.ecomService.getAdminPlatformFees(params).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = res?.data || res;

        // Support various API response structures
        let list: any[] = [];
        if (Array.isArray(data?.items)) {
          list = data.items;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        } else if (Array.isArray(data)) {
          list = data;
        }

        this.items = list.map(item => ({
          id: item.id,
          name: item.name || 'Platform Fee',
          code: item.code || '',
          description: item.description || '',
          charged_to: (item.charged_to || 'customer') as 'customer' | 'seller',
          percent: item.percent !== undefined && item.percent !== null ? item.percent : 0,
          flat: item.flat !== undefined && item.flat !== null ? item.flat : 0,
          is_active: Boolean(item.is_active),
          is_system: Boolean(item.is_system),
          created_at: item.created_at,
          updated_at: item.updated_at,
          updated_by: typeof item.updated_by === 'object' && item.updated_by ? item.updated_by.name : item.updated_by,
          created_by: typeof item.created_by === 'object' && item.created_by ? item.created_by.name : item.created_by
        }));

        const pagination = data?.pagination || data?.meta;
        if (pagination) {
          this.totalItems = pagination.total ?? this.items.length;
          this.currentPage = pagination.current_page ?? this.currentPage;
          this.perPage = pagination.per_page ?? this.perPage;
          this.lastPage = pagination.last_page ?? (Math.ceil(this.totalItems / this.perPage) || 1);
        } else {
          this.totalItems = this.items.length;
          this.lastPage = 1;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.message || 'Failed to fetch platform fee configurations.';
        // this.notificationService.show(msg, 'error', 3000);
      }
    });
  }

  onSearch(): void {
    this.appliedSearchQuery = this.searchQuery ? this.searchQuery.trim() : '';
    this.currentPage = 1;
    this.loadFees();
  }

  onResetSearch(): void {
    this.searchQuery = '';
    this.appliedSearchQuery = '';
    this.chargedToFilter = 'all';
    this.statusFilter = 'all';
    this.currentPage = 1;
    this.loadFees();
  }

  setChargedToFilter(filter: string): void {
    if (this.chargedToFilter === filter) return;
    this.chargedToFilter = filter;
    this.currentPage = 1;
    this.loadFees();
  }

  setStatusFilter(filter: string): void {
    if (this.statusFilter === filter) return;
    this.statusFilter = filter;
    this.currentPage = 1;
    this.loadFees();
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.currentPage = 1;
    this.loadFees();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.lastPage || page === this.currentPage) return;
    this.currentPage = page;
    this.loadFees();
  }

  // ==========================================================
  // MODAL ACTIONS: ADD / EDIT
  // ==========================================================
  openAddModal(): void {
    this.modalMode = 'add';
    this.editingItem = null;
    this.feeForm.reset({
      name: '',
      description: '',
      charged_to: 'customer',
      percent: 0,
      flat: 0,
      is_active: true
    });
    this.isModalOpen = true;
  }

  openEditModal(item: PlatformFeeItem): void {
    this.modalMode = 'edit';
    this.editingItem = item;
    this.feeForm.patchValue({
      name: item.name,
      description: item.description || '',
      charged_to: item.charged_to || 'customer',
      percent: parseFloat(String(item.percent ?? 0)),
      flat: parseFloat(String(item.flat ?? 0)),
      is_active: item.is_active
    });
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingItem = null;
    this.isSaving = false;
  }

  saveFee(): void {
    if (this.feeForm.invalid) {
      this.feeForm.markAllAsTouched();
      this.notificationService.show('Please fill in all required fields with valid values.', 'error', 3000);
      return;
    }

    const val = this.feeForm.value;
    this.isSaving = true;

    if (this.modalMode === 'add') {
      const payload = {
        name: val.name.trim(),
        description: val.description?.trim() || '',
        charged_to: val.charged_to,
        percent: Number(val.percent),
        flat: Number(val.flat),
      };

      this.ecomService.createAdminPlatformFee(payload).subscribe({
        next: (res: any) => {
          this.isSaving = false;
          const msg = res?.message || 'Commission fee created successfully!';
          this.notificationService.show(msg, 'success', 3000);
          this.closeModal();
          this.loadFees();
        },
        error: (err: any) => {
          this.isSaving = false;
          const errMsg = err?.error?.message || err?.message || 'Failed to create commission fee.';
          // this.notificationService.show(errMsg, 'error', 3000);
        }
      });

    } else if (this.modalMode === 'edit' && this.editingItem) {
      const payload = {
        name: val.name.trim(),
        description: val.description?.trim() || '',
        charged_to: val.charged_to,
        percent: Number(val.percent),
        flat: Number(val.flat)
      };

      this.ecomService.updateAdminPlatformFee(this.editingItem.id, payload).subscribe({
        next: (res: any) => {
          this.isSaving = false;
          const msg = res?.message || 'Commission fee updated successfully!';
          this.notificationService.show(msg, 'success', 3000);
          this.closeModal();
          this.loadFees();
        },
        error: (err: any) => {
          this.isSaving = false;
          const errMsg = err?.error?.message || err?.message || 'Failed to update commission fee.';
          // this.notificationService.show(errMsg, 'error', 3000);
        }
      });
    }
  }

  // ==========================================================
  // STATUS TOGGLE (PATCH API)
  // ==========================================================
  toggleStatus(item: PlatformFeeItem, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.togglingStatusId === item.id) return;

    const newStatus = !item.is_active;
    this.togglingStatusId = item.id;

    this.ecomService.changeAdminPlatformFeeStatus(item.id, { is_active: newStatus }).subscribe({
      next: (res: any) => {
        this.togglingStatusId = null;
        item.is_active = newStatus;
        const msg = res?.message || `Commission fee status updated to ${newStatus ? 'Active' : 'Inactive'}.`;
        this.notificationService.show(msg, 'success', 2500);
      },
      error: (err: any) => {
        this.togglingStatusId = null;
        const errMsg = err?.error?.message || err?.message || 'Failed to update status.';
        // this.notificationService.show(errMsg, 'error', 3000);
      }
    });
  }

  // ==========================================================
  // METRICS & HELPERS
  // ==========================================================
  get totalActiveCount(): number {
    return this.items.filter(i => i.is_active).length;
  }

  get totalCustomerChargedCount(): number {
    return this.items.filter(i => i.charged_to === 'customer').length;
  }

  get totalSellerChargedCount(): number {
    return this.items.filter(i => i.charged_to === 'seller').length;
  }

  get isFilterApplied(): boolean {
    return !!this.appliedSearchQuery || this.chargedToFilter !== 'all' || this.statusFilter !== 'all';
  }

  // Live calculator for modal preview
  get formPercentFee(): number {
    const p = Number(this.feeForm?.get('percent')?.value || 0);
    return Math.round(((this.sampleCalcAmount * p) / 100) * 100) / 100;
  }

  get formFlatFee(): number {
    return Number(this.feeForm?.get('flat')?.value || 0);
  }

  get formTotalFee(): number {
    return Math.round((this.formPercentFee + this.formFlatFee) * 100) / 100;
  }

  calcFee(percent: number | string, flat: number | string, amount: number): number {
    const p = Number(percent || 0);
    const f = Number(flat || 0);
    return Math.round((((amount * p) / 100) + f) * 100) / 100;
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return dateStr;
    }
  }
}
