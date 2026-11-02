import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { EcomService } from 'src/app/core/services/ecom.service';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

export type QuotationFilterTab = 'all' | 'submitted' | 'accepted' | 'closed';

export interface QuotationPriceBreakdown {
  unitPrice: number;
  quantity: number;
  productAmount: number;
  gstTax: number;
  deliveryFee: number;
  platformFee: number;
  finalPayable: number;
}

export interface PurchaseQuotationItem {
  id: string | number;
  quotationCode: string;
  version: string;
  requestCode: string;
  product: string;
  customerName: string;
  customerPhone?: string;
  customerCity?: string;
  quantity: number;
  submittedDate: string;
  validUntil: string;
  acceptanceDate: string;
  status: string;
  notes: string;
  statusMessage: string;
  price: QuotationPriceBreakdown;
  validityNotice?: string;
  paymentStatus: string;
  fundsStatus: string;
  vehicleCategory?: string;
  vehicleModel?: string;
  customerRequirement?: string;
  providerActionNotice?: string;
  rawItem?: any;
}

export const FLOW_STEPS = [
  'Quotation Submitted',
  'Awaiting Customer Acceptance',
  'Awaiting Customer Payment',
  'Order Confirmed',
  'Ready for Pickup',
  'Shipped'
];

@Component({
  selector: 'app-purchase-quotations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './purchase-quotations.component.html',
  styleUrl: './purchase-quotations.component.scss'
})
export class PurchaseQuotationsComponent implements OnInit {
  isLoading = false;
  isRefreshing = false;

  // Quotations Data
  quotations: PurchaseQuotationItem[] = [];
  filteredQuotations: PurchaseQuotationItem[] = [];
  pagedQuotations: PurchaseQuotationItem[] = [];

  // Filter & Search: 'all' | 'submitted' | 'accepted' | 'closed'
  activeTab: QuotationFilterTab = 'all';
  searchQuery = '';

  // Server Pagination State
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;
  totalRecordsCount = 0;

  // Details Modal State
  isDetailsModalOpen = false;
  isLoadingDetails = false;
  selectedQuotation: PurchaseQuotationItem | null = null;

  readonly flowSteps = FLOW_STEPS;

  constructor(
    private ecomService: EcomService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const qParams = this.route.snapshot.queryParams;
    const statusParam = (qParams['status'] || 'all').toLowerCase();
    if (['all', 'submitted', 'accepted', 'closed'].includes(statusParam)) {
      this.activeTab = statusParam as QuotationFilterTab;
    } else {
      this.activeTab = 'all';
    }

    if (qParams['page']) {
      const p = Number(qParams['page']);
      if (!isNaN(p) && p > 0) {
        this.currentPage = p;
      }
    }

    if (qParams['limit']) {
      const l = Number(qParams['limit']);
      if (!isNaN(l) && l > 0) {
        this.pageSize = l;
      }
    }

    this.loadQuotations();
  }

  // ==========================================
  // PAGINATION GETTERS & CONTROLS
  // ==========================================

  get totalRecords(): number {
    return this.totalRecordsCount || this.filteredQuotations.length;
  }

  get paginationFrom(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;

    // Update query params in router URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.activeTab === 'all' ? null : this.activeTab,
        page: this.currentPage === 1 ? null : this.currentPage
      },
      queryParamsHandling: 'merge'
    });

    this.loadQuotations();

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 250, behavior: 'smooth' });
    }
  }

  onPageSizeChange(newSize: any): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.activeTab === 'all' ? null : this.activeTab,
        page: null
      },
      queryParamsHandling: 'merge'
    });

    this.loadQuotations();
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

  // ==========================================
  // DATA MANAGEMENT & LIVE API
  // ==========================================

  loadQuotations(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }

    // Pass page and limit along with status
    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };
    if (this.activeTab && this.activeTab !== 'all') {
      params.status = this.activeTab;
    }

    console.log('[PurchaseQuotations] Loading quotations with params:', params);

    this.ecomService.getSellerQuotations(params).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.isRefreshing = false;
        console.log('[PurchaseQuotations] Quotations response:', res);

        const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
        if (Array.isArray(items)) {
          this.quotations = items.map((item: any) => this.mapApiItem(item));
        } else {
          this.quotations = [];
        }

        // Handle server pagination metadata
        const pagination = res?.data?.pagination;
        if (pagination) {
          this.totalRecordsCount = Number(pagination.total !== undefined ? pagination.total : this.quotations.length);
          this.currentPage = Number(pagination.current_page || this.currentPage);
          this.totalPages = Number(pagination.last_page || Math.max(1, Math.ceil(this.totalRecordsCount / this.pageSize)));
        } else {
          this.totalRecordsCount = this.quotations.length;
          this.totalPages = Math.max(1, Math.ceil(this.totalRecordsCount / this.pageSize));
        }

        this.applyFilter();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.isRefreshing = false;
        console.error('[PurchaseQuotations] Error loading quotations:', err);
        const msg = err?.error?.message || err?.message || 'Failed to load quotations from server.';
        this.notificationService.show(msg, 'error');
      }
    });
  }

  private mapApiItem(item: any): PurchaseQuotationItem {
    const rawStatus = String(item.status || 'submitted').toLowerCase();
    const pr = item.purchase_request || {};
    const prStatus = String(pr.status || '').toLowerCase();
    const isExpired = !!item.is_expired;

    const loc = pr.delivery_location;
    const locationParts = loc ? [loc.city, loc.state].filter(Boolean) : [];
    const customerCity = locationParts.join(', ') + (loc?.pincode ? ` (${loc.pincode})` : '');

    const customerName = item.customer_name ||
      item.customer?.name ||
      pr.customer_name ||
      pr.customer?.name ||
      pr.user?.name ||
      (loc?.city ? `Customer (${loc.city})` : 'Customer');

    const customerPhone = item.customer_phone ||
      item.customer?.phone ||
      pr.customer_phone ||
      pr.customer?.phone ||
      '';

    const qty = Number(item.quantity || item.quoted_quantity || pr.quantity || 1);
    const uPrice = Number(item.unit_price || 0);
    const prodAmt = Number(item.product_amount !== undefined ? item.product_amount : (uPrice * qty));
    const gstTax = Number(item.gst_amount !== undefined ? item.gst_amount : 0);
    const delFee = Number(item.delivery_fee !== undefined ? item.delivery_fee : 0);
    const platFee = Number(item.platform_fee !== undefined ? item.platform_fee : 0);
    const finalPayable = Number(item.final_amount !== undefined ? item.final_amount : (prodAmt + gstTax + delFee));

    const notes = item.notes || '';

    // Dynamic status message and action notice
    let statusMessage = '';
    let providerActionNotice = '';
    let paymentStatus = 'Pending';
    let fundsStatus = 'Not Held';

    if (rawStatus === 'accepted') {
      if (prStatus === 'ordered') {
        statusMessage = 'Order Placed • Escrow Payment Held';
        paymentStatus = 'Successful';
        fundsStatus = 'Held';
        providerActionNotice = 'Provider action: Customer has placed the order and payment is held in escrow. Please prepare the order for dispatch/pickup.';
      } else {
        statusMessage = item.accepted_at
          ? `Accepted on ${this.formatDateTime(item.accepted_at)}`
          : 'Quotation Accepted by Customer';
        paymentStatus = 'Pending';
        fundsStatus = 'Not Held';
        providerActionNotice = 'Provider action: Customer has accepted the quotation. Waiting for payment completion.';
      }
    } else if (rawStatus === 'closed') {
      statusMessage = isExpired ? 'Quotation Closed (Validity Expired)' : 'Quotation Closed';
      paymentStatus = prStatus === 'ordered' ? 'Successful' : 'Closed';
      fundsStatus = 'Not Held';
      providerActionNotice = 'Provider action: This quotation request is closed.';
    } else {
      // rawStatus === 'submitted'
      if (isExpired) {
        statusMessage = `Quotation Expired (${this.formatDate(item.valid_until)})`;
        providerActionNotice = 'Provider action: This quotation has expired.';
      } else if (item.valid_until) {
        statusMessage = `Valid until ${this.formatDateTime(item.valid_until)}`;
        providerActionNotice = 'Provider action: No action is required until the customer accepts the quotation.';
      } else {
        statusMessage = 'Awaiting Customer Acceptance';
        providerActionNotice = 'Provider action: No action is required until the customer accepts the quotation.';
      }
    }

    return {
      id: item.id,
      quotationCode: item.reference || `GQT-${item.id}`,
      version: item.version ? `V${item.version}` : 'V1',
      requestCode: pr.reference || (item.purchase_request_id ? `GPR-${item.purchase_request_id}` : '—'),
      product: pr.product_name || 'Spare Part',
      customerName,
      customerPhone,
      customerCity: customerCity || 'N/A',
      quantity: qty,
      submittedDate: this.formatDateTime(item.submitted_at || item.created_at),
      validUntil: this.formatDateTime(item.valid_until),
      acceptanceDate: item.accepted_at ? this.formatDateTime(item.accepted_at) : '—',
      status: item.status || 'submitted',
      notes,
      statusMessage,
      price: {
        unitPrice: uPrice,
        quantity: qty,
        productAmount: prodAmt,
        gstTax,
        deliveryFee: delFee,
        platformFee: platFee,
        finalPayable
      },
      validityNotice: statusMessage,
      paymentStatus,
      fundsStatus,
      vehicleCategory: pr.vehicle_category?.name || '',
      vehicleModel: pr.vehicle_category?.name || '',
      customerRequirement: pr.description || (pr.vehicle_category?.name ? `Category: ${pr.vehicle_category.name}` : ''),
      providerActionNotice,
      rawItem: item
    };
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  setTab(tab: QuotationFilterTab): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.currentPage = 1; // Reset to page 1 on tab change

    // Update query parameter in router URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: tab === 'all' ? null : tab,
        page: null
      },
      queryParamsHandling: 'merge'
    });

    // Directly trigger API call on tab change
    this.loadQuotations();
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  applyFilter(resetPage: boolean = false): void {
    if (resetPage) {
      this.currentPage = 1;
    }
    let result = [...this.quotations];

    // Search query filter
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(item =>
        (item.product && item.product.toLowerCase().includes(q)) ||
        (item.quotationCode && item.quotationCode.toLowerCase().includes(q)) ||
        (item.requestCode && item.requestCode.toLowerCase().includes(q)) ||
        (item.customerName && item.customerName.toLowerCase().includes(q)) ||
        (item.vehicleModel && item.vehicleModel.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        (item.statusMessage && item.statusMessage.toLowerCase().includes(q))
      );
    }

    this.filteredQuotations = result;
    this.pagedQuotations = result;
  }

  // Status Badge CSS Classes
  getStatusBadgeClass(status: string): string {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'submitted':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'accepted':
        return 'bg-teal-100 text-teal-800 border border-teal-200';
      case 'closed':
        return 'bg-rose-100 text-rose-700 border border-rose-200';
      case 'ordered':
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'expired':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }

  // ==========================================
  // QUOTATION FLOW STEPPER LOGIC
  // ==========================================

  getFlowStepIndex(status: string): number {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'submitted':
        return 0; // Quotation Submitted
      case 'accepted':
        return 2; // Accepted / Payment
      case 'ordered':
      case 'confirmed':
        return 3; // Order Confirmed
      case 'closed':
      case 'expired':
        return -1;
      default:
        return 0;
    }
  }

  isStepCompleted(stepIdx: number, status: string): boolean {
    const s = String(status || '').toLowerCase();
    if (s === 'closed' || s === 'expired') return false;
    const current = this.getFlowStepIndex(status);
    return stepIdx <= current;
  }

  // ==========================================
  // DETAILS MODAL
  // ==========================================

  openDetailsModal(quotation: PurchaseQuotationItem): void {
    this.selectedQuotation = quotation;
    this.isDetailsModalOpen = true;
    this.isLoadingDetails = true;

    // Fetch full quotation details by ID: GET /api/v1/ecom/seller/quotations/:id
    this.ecomService.getSellerQuotationDetails(quotation.id).subscribe({
      next: (res: any) => {
        this.isLoadingDetails = false;
        console.log('[PurchaseQuotations] Details response for quotation', quotation.id, res);
        const data = res?.data || res;
        if (data && typeof data === 'object') {
          this.selectedQuotation = this.mapApiItem(data);
        }
      },
      error: (err: any) => {
        this.isLoadingDetails = false;
        console.error('[PurchaseQuotations] Error loading quotation details:', err);
      }
    });
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.isLoadingDetails = false;
    this.selectedQuotation = null;
  }

  copyQuoteCode(code: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      this.notificationService.show(`Copied ${code} to clipboard!`, 'success');
    }
  }
}
