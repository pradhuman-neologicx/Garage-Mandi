import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EcomService } from 'src/app/core/services/ecom.service';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

export interface RefundGatewayData {
  amount?: number;
  batch_id?: string | null;
  created_at?: number;
  currency?: string;
  id?: string;
  notes?: Record<string, string>;
  payment_id?: string;
  receipt?: string;
  speed_processed?: string;
  speed_requested?: string;
  status?: string;
  acquirer_data?: {
    arn?: string;
  };
}

export interface RefundHistoryEvent {
  id: number;
  subject_type: string;
  subject_id: number;
  event: string;
  from_status?: string | null;
  to_status?: string | null;
  actor?: {
    id: number;
    name: string;
  } | null;
  actor_role: string;
  meta?: {
    refund_id?: number;
    amount?: string | number;
    refund_type?: string;
    remarks?: string;
    reference?: string;
    razorpay_refund_id?: string;
  };
  created_at: string;
}

export interface AdminRefundItem {
  id: number;
  order: {
    id: number;
    order_number: string;
  };
  payment: {
    id: number;
    razorpay_payment_id: string;
  };
  source: string;
  reason: string;
  reason_label: string;
  remarks: string;
  amount: number;
  status: 'processed' | 'pending' | 'failed' | string;
  razorpay_refund_id: string;
  receipt: string;
  reference: string;
  speed_requested: string;
  speed_processed: string;
  failure_type?: string | null;
  failure_reason?: string | null;
  attempts: number;
  can_retry: boolean;
  initiated_by: {
    id: number;
    name: string;
    phone_number: string;
    email: string;
  };
  processed_at?: string | null;
  attempted_at?: string | null;
  last_synced_at?: string | null;
  created_at: string;
  updated_at: string;
  gateway?: RefundGatewayData;
  history?: RefundHistoryEvent[];
}

@Component({
  selector: 'app-refunds',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './refunds.component.html',
  styleUrl: './refunds.component.scss'
})
export class RefundsComponent implements OnInit {
  isLoading = false;
  isRefreshing = false;
  syncingRefundId: number | null = null;

  // Refunds Data
  refunds: AdminRefundItem[] = [];
  filteredRefunds: AdminRefundItem[] = [];

  // Search & Filters
  searchQuery = '';
  appliedSearchQuery = '';
  isSearchApplied = false;
  statusFilter = 'all';

  // Pagination State
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;
  totalRecords = 0;

  // Detailed Modal
  isDetailsModalOpen = false;
  isLoadingDetails = false;
  selectedRefund: AdminRefundItem | null = null;

  constructor(
    private ecomService: EcomService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadRefunds();
  }

  // ==========================================================
  // DATA LOADING & LIVE API CALLS
  // ==========================================================
  loadRefunds(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }

    const params: any = {
      page: this.currentPage,
      per_page: this.pageSize
    };

    if (this.statusFilter && this.statusFilter !== 'all') {
      params.status = this.statusFilter;
    }

    if (this.appliedSearchQuery && this.appliedSearchQuery.trim()) {
      params.search = this.appliedSearchQuery.trim();
    }

    this.ecomService.getAdminRefunds(params).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.isRefreshing = false;

        const rawItems = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
        if (Array.isArray(rawItems)) {
          this.refunds = rawItems.map((item: any) => this.mapApiRefund(item));
        } else {
          this.refunds = [];
        }

        const pagination = res?.data?.pagination;
        if (pagination) {
          this.currentPage = Number(pagination.current_page || 1);
          this.totalPages = Math.max(1, Number(pagination.last_page || 1));
          this.totalRecords = Number(pagination.total || this.refunds.length);
        } else {
          this.totalRecords = this.refunds.length;
          this.totalPages = 1;
        }

        this.applyLocalSearchFallback();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.isRefreshing = false;
        const msg = err?.error?.message || err?.message || 'Failed to load refunds list.';
        this.notificationService.show(msg, 'error');
        this.refunds = [];
        this.filteredRefunds = [];
        this.totalRecords = 0;
      }
    });
  }

  private mapApiRefund(item: any): AdminRefundItem {
    return {
      id: item.id,
      order: {
        id: item.order?.id || 0,
        order_number: item.order?.order_number || '—'
      },
      payment: {
        id: item.payment?.id || 0,
        razorpay_payment_id: item.payment?.razorpay_payment_id || '—'
      },
      source: item.source || 'gateway',
      reason: item.reason || 'admin_initiated',
      reason_label: item.reason_label || 'Initiated by Admin',
      remarks: item.remarks || '—',
      amount: Number(item.amount || 0),
      status: (item.status || 'processed').toLowerCase(),
      razorpay_refund_id: item.razorpay_refund_id || '—',
      receipt: item.receipt || '—',
      reference: item.reference || '—',
      speed_requested: item.speed_requested || 'normal',
      speed_processed: item.speed_processed || 'normal',
      failure_type: item.failure_type || null,
      failure_reason: item.failure_reason || null,
      attempts: Number(item.attempts || 1),
      can_retry: Boolean(item.can_retry),
      initiated_by: {
        id: item.initiated_by?.id || 0,
        name: item.initiated_by?.name || 'Super Admin',
        phone_number: item.initiated_by?.phone_number || '—',
        email: item.initiated_by?.email || '—'
      },
      processed_at: item.processed_at || null,
      attempted_at: item.attempted_at || null,
      last_synced_at: item.last_synced_at || null,
      created_at: item.created_at || '',
      updated_at: item.updated_at || '',
      gateway: item.gateway || undefined,
      history: Array.isArray(item.history) ? item.history : []
    };
  }

  // ==========================================================
  // SYNC ACTION (POST /api/v1/ecom/admin/refunds/:id/sync)
  // ==========================================================
  syncRefund(refund: AdminRefundItem, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.syncingRefundId === refund.id) return;

    this.syncingRefundId = refund.id;

    this.ecomService.syncAdminRefund(refund.id).subscribe({
      next: (res: any) => {
        this.syncingRefundId = null;
        const successMsg = res?.message || `Refund #${refund.id} synced successfully with Razorpay!`;
        this.notificationService.show(successMsg, 'success');

        // If returned updated refund item, update locally
        if (res?.data) {
          const updated = this.mapApiRefund(res.data);
          const idx = this.refunds.findIndex(r => r.id === refund.id);
          if (idx !== -1) {
            this.refunds[idx] = updated;
          }
          if (this.selectedRefund && this.selectedRefund.id === refund.id) {
            this.selectedRefund = updated;
          }
          this.applyLocalSearchFallback();
        } else {
          // Re-load list
          this.loadRefunds(true);
        }
      },
      error: (err: any) => {
        this.syncingRefundId = null;
        const msg = err?.error?.message || err?.message || `Failed to sync refund #${refund.id}.`;
        this.notificationService.show(msg, 'error');
      }
    });
  }

  // ==========================================================
  // METRICS & KPIS
  // ==========================================================
  get totalRefundedAmount(): number {
    return this.refunds.reduce((acc, r) => acc + (r.amount || 0), 0);
  }

  get processedCount(): number {
    return this.refunds.filter(r => r.status === 'processed').length;
  }

  get pendingCount(): number {
    return this.refunds.filter(r => r.status === 'pending').length;
  }

  get failedCount(): number {
    return this.refunds.filter(r => r.status === 'failed').length;
  }

  // ==========================================================
  // FILTERING & PAGINATION
  // ==========================================================
  setStatusFilter(status: string): void {
    if (this.statusFilter === status) return;
    this.statusFilter = status;
    this.currentPage = 1;
    this.loadRefunds();
  }

  onSearch(): void {
    this.appliedSearchQuery = this.searchQuery ? this.searchQuery.trim() : '';
    this.isSearchApplied = !!this.appliedSearchQuery;
    this.currentPage = 1;
    this.loadRefunds();
  }

  onResetSearch(): void {
    this.searchQuery = '';
    this.appliedSearchQuery = '';
    this.isSearchApplied = false;
    this.currentPage = 1;
    this.loadRefunds();
  }

  private applyLocalSearchFallback(): void {
    if (!this.appliedSearchQuery || !this.appliedSearchQuery.trim()) {
      this.filteredRefunds = [...this.refunds];
      return;
    }
    const q = this.appliedSearchQuery.trim().toLowerCase();
    this.filteredRefunds = this.refunds.filter(r =>
      r.id.toString().includes(q) ||
      (r.order?.order_number && r.order.order_number.toLowerCase().includes(q)) ||
      (r.razorpay_refund_id && r.razorpay_refund_id.toLowerCase().includes(q)) ||
      (r.payment?.razorpay_payment_id && r.payment.razorpay_payment_id.toLowerCase().includes(q)) ||
      (r.reference && r.reference.toLowerCase().includes(q)) ||
      (r.receipt && r.receipt.toLowerCase().includes(q)) ||
      (r.initiated_by?.name && r.initiated_by.name.toLowerCase().includes(q)) ||
      (r.remarks && r.remarks.toLowerCase().includes(q))
    );
  }

  get paginationFrom(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  onPageSizeChange(newSize: any): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.loadRefunds();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadRefunds();
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  }

  // ==========================================================
  // DETAILS MODAL (FETCH BY ID: GET /api/v1/ecom/admin/refunds/:id)
  // ==========================================================
  openDetailsModal(refund: AdminRefundItem): void {
    this.selectedRefund = refund;
    this.isDetailsModalOpen = true;
    this.isLoadingDetails = true;

    this.ecomService.getAdminRefundDetails(refund.id).subscribe({
      next: (res: any) => {
        this.isLoadingDetails = false;
        const item = res?.data?.item || res?.data || res;
        if (item && typeof item === 'object') {
          const mapped = this.mapApiRefund(item);
          this.selectedRefund = mapped;
          const idx = this.refunds.findIndex(r => r.id === refund.id);
          if (idx !== -1) {
            this.refunds[idx] = mapped;
          }
          this.applyLocalSearchFallback();
        }
      },
      error: (err: any) => {
        this.isLoadingDetails = false;
        console.warn('Could not fetch latest details by ID, using listing data.', err);
      }
    });
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedRefund = null;
  }

  // ==========================================================
  // HELPERS & BADGE STYLING
  // ==========================================================
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'processed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'failed':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'processed':
        return 'fa-circle-check text-emerald-600';
      case 'pending':
        return 'fa-clock text-amber-600';
      case 'failed':
        return 'fa-circle-xmark text-rose-600';
      default:
        return 'fa-circle-info text-slate-500';
    }
  }

  copyText(text: string, label = 'Copied'): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.notificationService.show(`${label} to clipboard!`, 'success');
    }
  }

  formatEventName(event: string): string {
    switch (event) {
      case 'refund_initiated': return 'Refund Initiated';
      case 'refund_status_changed': return 'Status Changed';
      default: return event ? event.replace(/_/g, ' ') : 'Event';
    }
  }

  getEventBadgeClass(toStatus?: string | null): string {
    switch (toStatus) {
      case 'processed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'failed':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-purple-50 text-purple-700 border border-purple-200';
    }
  }

  formatDateTime(dateStr?: string | null): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  }
}
