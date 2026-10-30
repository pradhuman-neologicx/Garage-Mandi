import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NotificationService } from 'src/app/core/services/notificationnew.service';
import { EcomService } from 'src/app/core/services/ecom.service';

export interface DeliveryLocation {
  city?: string;
  state?: string;
  pincode?: string;
}

export interface PurchaseQuotation {
  id?: number | string;
  unitPrice: number;
  gstPercent: number;
  deliveryFee: number;
  productAmount: number;
  gstTax: number;
  finalPayable: number;
  notes?: string;
  remarks?: string;
  submittedAt?: string;
}

export interface PurchaseRequestItem {
  id: string | number;
  requestCode: string;
  reference: string;
  product: string;
  quantity: number;
  requestDate: string;
  status: 'Quotation Required' | 'Quotation Submitted';
  rawStatus: string;
  customerRequirement: string;
  vehicleCategory?: string;
  deliveryLocation?: DeliveryLocation;
  myQuotation?: any;
  quotation?: PurchaseQuotation;
}

@Component({
  selector: 'app-purchase-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './purchase-requests.component.html',
  styleUrl: './purchase-requests.component.scss'
})
export class PurchaseRequestsComponent implements OnInit {
  isLoading = false;
  isRefreshing = false;

  // Requests Data from API
  requests: PurchaseRequestItem[] = [];
  filteredRequests: PurchaseRequestItem[] = [];
  pagedRequests: PurchaseRequestItem[] = [];

  // Pagination State
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;

  // Filtering & Search
  activeTab: 'all' | 'required' | 'submitted' = 'all';
  searchQuery = '';

  // KPIs
  kpis = {
    total: 0,
    required: 0,
    submitted: 0
  };

  // Quotation Modal State
  isQuoteModalOpen = false;
  selectedRequest: PurchaseRequestItem | null = null;
  isSubmittingQuote = false;

  // Quotation Form Inputs (aligned with API: unit_price, gst_percent, delivery_fee, notes)
  quoteUnitPrice: number | string = '';
  quoteGstPercent: number | string = 18;
  quoteDeliveryFee: number | string = 40;
  quoteNotes = '';

  constructor(
    private notificationService: NotificationService,
    private ecomService: EcomService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  // ==========================================
  // PAGINATION GETTERS & CONTROLS
  // ==========================================

  get totalRecords(): number {
    return this.filteredRequests.length;
  }

  get paginationFrom(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  updatePagination(): void {
    const total = this.filteredRequests.length;
    this.totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedRequests = this.filteredRequests.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.updatePagination();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 250, behavior: 'smooth' });
    }
  }

  onPageSizeChange(newSize: any): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.updatePagination();
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

  loadRequests(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }

    this.ecomService.getSellerPurchaseRequests().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.isRefreshing = false;

        const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
        if (Array.isArray(items)) {
          this.requests = items.map((item: any) => this.mapApiItem(item));
        } else {
          this.requests = [];
        }

        this.computeKpis();
        this.applyFilter(true);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.isRefreshing = false;
        const msg = err?.error?.message || err?.message || 'Failed to load purchase requests from server.';
        this.notificationService.show(msg, 'error');
      }
    });
  }

  private mapApiItem(item: any): PurchaseRequestItem {
    let dateStr = 'Recent';
    if (item.created_at) {
      try {
        dateStr = new Date(item.created_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch (_) {
        dateStr = item.created_at;
      }
    }

    const myQ = item.my_quotation;
    let quotation: PurchaseQuotation | undefined = undefined;

    if (myQ) {
      const uPrice = Number(myQ.unit_price || 0);
      const qty = Number(item.quantity || 1);
      const prodAmt = uPrice * qty;
      const gstPct = Number(myQ.gst_percent || 0);
      const gstAmt = Math.round(((prodAmt * gstPct) / 100) * 100) / 100;
      const delFee = Number(myQ.delivery_fee || 0);
      quotation = {
        id: myQ.id,
        unitPrice: uPrice,
        gstPercent: gstPct,
        deliveryFee: delFee,
        productAmount: prodAmt,
        gstTax: gstAmt,
        finalPayable: prodAmt + gstAmt + delFee,
        notes: myQ.notes || '',
        remarks: myQ.notes || '',
        submittedAt: myQ.created_at ? new Date(myQ.created_at).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Submitted'
      };
    }

    const hasSubmitted = !!myQ;

    return {
      id: item.id,
      requestCode: item.reference || `GPR-${item.id}`,
      reference: item.reference || `GPR-${item.id}`,
      product: item.product_name || 'Spare Part',
      quantity: Number(item.quantity || 1),
      requestDate: dateStr,
      status: hasSubmitted ? 'Quotation Submitted' : 'Quotation Required',
      rawStatus: item.status || 'quote_received',
      customerRequirement: item.description || (item.vehicle_category?.name ? `Category: ${item.vehicle_category.name}` : 'Spare part quotation requested.'),
      vehicleCategory: item.vehicle_category?.name || '',
      deliveryLocation: item.delivery_location || undefined,
      myQuotation: myQ,
      quotation: quotation
    };
  }

  computeKpis(): void {
    this.kpis.total = this.requests.length;
    this.kpis.required = this.requests.filter(r => r.status === 'Quotation Required').length;
    this.kpis.submitted = this.requests.filter(r => r.status === 'Quotation Submitted').length;
  }

  setTab(tab: 'all' | 'required' | 'submitted'): void {
    this.activeTab = tab;
    this.applyFilter(true);
  }

  onSearchChange(): void {
    this.applyFilter(true);
  }

  applyFilter(resetPage = false): void {
    if (resetPage) {
      this.currentPage = 1;
    }

    let result = [...this.requests];

    if (this.activeTab === 'required') {
      result = result.filter(r => r.status === 'Quotation Required');
    } else if (this.activeTab === 'submitted') {
      result = result.filter(r => r.status === 'Quotation Submitted');
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(r =>
        r.product.toLowerCase().includes(q) ||
        r.requestCode.toLowerCase().includes(q) ||
        r.customerRequirement.toLowerCase().includes(q) ||
        (r.vehicleCategory && r.vehicleCategory.toLowerCase().includes(q)) ||
        (r.deliveryLocation?.city && r.deliveryLocation.city.toLowerCase().includes(q))
      );
    }

    this.filteredRequests = result;
    this.updatePagination();
  }

  // ==========================================
  // QUOTATION MODAL & CALCULATIONS
  // ==========================================

  get isQuoteValid(): boolean {
    const num = Number(this.quoteUnitPrice);
    return !isNaN(num) && num > 0;
  }

  get productAmount(): number {
    const unitPrice = Number(this.quoteUnitPrice) || 0;
    const qty = this.selectedRequest?.quantity || 1;
    return unitPrice * qty;
  }

  get quoteGstTax(): number {
    const pct = Number(this.quoteGstPercent) || 0;
    return Math.round(((this.productAmount * pct) / 100) * 100) / 100;
  }

  get finalPayable(): number {
    const prodAmt = this.productAmount;
    const tax = this.quoteGstTax;
    const delivery = Number(this.quoteDeliveryFee) || 0;
    return prodAmt + tax + delivery;
  }

  openQuoteModal(request: PurchaseRequestItem): void {
    this.selectedRequest = request;

    if (request.quotation) {
      // Existing quotation review
      this.quoteUnitPrice = request.quotation.unitPrice;
      this.quoteGstPercent = request.quotation.gstPercent;
      this.quoteDeliveryFee = request.quotation.deliveryFee;
      this.quoteNotes = request.quotation.notes || request.quotation.remarks || '';
    } else {
      // New quotation form defaults
      this.quoteUnitPrice = '';
      this.quoteGstPercent = 18;
      this.quoteDeliveryFee = 40;
      this.quoteNotes = '';
    }

    this.isQuoteModalOpen = true;
  }

  closeQuoteModal(): void {
    this.isQuoteModalOpen = false;
    this.selectedRequest = null;
    this.isSubmittingQuote = false;
  }

  submitQuotation(): void {
    if (!this.selectedRequest) return;

    const unitPriceNum = Number(this.quoteUnitPrice);
    if (!this.quoteUnitPrice || isNaN(unitPriceNum) || unitPriceNum <= 0) {
      this.notificationService.show('Please enter a valid unit price.', 'error');
      return;
    }

    const gstPct = Number(this.quoteGstPercent);
    if (isNaN(gstPct) || gstPct < 0 || gstPct > 100) {
      this.notificationService.show('Please enter a valid GST percentage (0 - 100%).', 'error');
      return;
    }

    const delFee = Number(this.quoteDeliveryFee);
    if (isNaN(delFee) || delFee < 0) {
      this.notificationService.show('Please enter a valid delivery fee (0 or greater).', 'error');
      return;
    }

    this.isSubmittingQuote = true;

    const payload = {
      unit_price: unitPriceNum,
      gst_percent: gstPct,
      delivery_fee: delFee,
      notes: (this.quoteNotes || '').trim()
    };

    const requestId = this.selectedRequest.id;

    this.ecomService.createSellerQuotation(requestId, payload).subscribe({
      next: (res: any) => {
        this.isSubmittingQuote = false;
        const msg = res?.message || 'Quotation submitted successfully!';
        this.notificationService.show(msg, 'success');
        this.closeQuoteModal();
        this.loadRequests(true);
      },
      error: (err: any) => {
        this.isSubmittingQuote = false;
        const errorMsg = err?.error?.message || err?.message || 'Failed to submit quotation. Please try again.';
        this.notificationService.show(errorMsg, 'error');
      }
    });
  }
}
