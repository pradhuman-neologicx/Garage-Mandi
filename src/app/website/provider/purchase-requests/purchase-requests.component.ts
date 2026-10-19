import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

export interface PurchaseQuotation {
  unitPrice: number;
  requestedQuantity: number;
  productAmount: number;
  gstTax: number;
  deliveryFee: number;
  convenienceFee: number;
  finalPayable: number;
  remarks?: string;
  submittedAt?: string;
}

export interface PurchaseRequestItem {
  id: string | number;
  requestCode: string;
  product: string;
  quantity: number;
  requestDate: string;
  status: 'Quotation Required' | 'Quotation Submitted';
  customerRequirement: string;
  vehicleCategory?: string;
  vehicleModel?: string;
  quotation?: PurchaseQuotation;
}

const STORAGE_KEY = 'garage_mandi_mock_purchase_requests_v2';

const INITIAL_MOCK_DATA: PurchaseRequestItem[] = [
  {
    id: 1001,
    requestCode: 'REQ-1001',
    product: 'Brake Pad Set',
    quantity: 2,
    requestDate: '18 Sep 2026',
    status: 'Quotation Required',
    customerRequirement: 'Front brake pad set required for vehicle.',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Maruti Suzuki Swift'
  },
  {
    id: 1002,
    requestCode: 'REQ-1002',
    product: 'Clutch Plate',
    quantity: 1,
    requestDate: '17 Sep 2026',
    status: 'Quotation Submitted',
    customerRequirement: 'Original OEM clutch assembly plate with smooth friction lining.',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Hyundai Creta',
    quotation: {
      unitPrice: 2850,
      requestedQuantity: 1,
      productAmount: 2850,
      gstTax: 513,
      deliveryFee: 250,
      convenienceFee: 425,
      finalPayable: 4038,
      remarks: 'Genuine OEM clutch plate with 6 months warranty.',
      submittedAt: '17 Sep 2026, 04:30 PM'
    }
  },
  {
    id: 1003,
    requestCode: 'REQ-1003',
    product: 'LED Headlight Assembly (Right)',
    quantity: 1,
    requestDate: '16 Sep 2026',
    status: 'Quotation Required',
    customerRequirement: 'Right side LED projector headlamp unit without scratch or damage.',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Kia Seltos'
  },
  {
    id: 1004,
    requestCode: 'REQ-1004',
    product: 'Engine Oil Filter & O-Ring',
    quantity: 4,
    requestDate: '15 Sep 2026',
    status: 'Quotation Required',
    customerRequirement: 'Pack of 4 heavy-duty diesel engine oil filter elements.',
    vehicleCategory: 'Commercial Vehicle',
    vehicleModel: 'Tata Ace Gold'
  },
  {
    id: 1005,
    requestCode: 'REQ-1005',
    product: 'Front Shock Absorber Strut Pair',
    quantity: 2,
    requestDate: '14 Sep 2026',
    status: 'Quotation Submitted',
    customerRequirement: 'Complete front gas-charged suspension strut pair with bush kit.',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Honda City',
    quotation: {
      unitPrice: 3400,
      requestedQuantity: 2,
      productAmount: 6800,
      gstTax: 1224,
      deliveryFee: 250,
      convenienceFee: 425,
      finalPayable: 8699,
      remarks: 'Heavy duty twin-tube gas struts with 1 year warranty.',
      submittedAt: '15 Sep 2026, 11:15 AM'
    }
  },
  {
    id: 1006,
    requestCode: 'REQ-1006',
    product: 'Gearbox Oil & Seal Kit',
    quantity: 1,
    requestDate: '14 Sep 2026',
    status: 'Quotation Required',
    customerRequirement: 'High-viscosity manual transmission oil with OEM oil seal set.',
    vehicleCategory: 'Commercial Vehicle',
    vehicleModel: 'Mahindra Bolero Maxi Truck'
  },
  {
    id: 1007,
    requestCode: 'REQ-1007',
    product: 'Rear Brake Shoe Set',
    quantity: 2,
    requestDate: '13 Sep 2026',
    status: 'Quotation Submitted',
    customerRequirement: 'Original drum brake shoe set with tension spring fittings.',
    vehicleCategory: 'Two Wheeler',
    vehicleModel: 'TVS Jupiter 125',
    quotation: {
      unitPrice: 580,
      requestedQuantity: 2,
      productAmount: 1160,
      gstTax: 208,
      deliveryFee: 250,
      convenienceFee: 425,
      finalPayable: 2043,
      remarks: 'Genuine TVS OEM rear brake shoes.',
      submittedAt: '13 Sep 2026, 03:45 PM'
    }
  },
  {
    id: 1008,
    requestCode: 'REQ-1008',
    product: 'Alternator Pulley & V-Belt',
    quantity: 1,
    requestDate: '12 Sep 2026',
    status: 'Quotation Required',
    customerRequirement: 'Overrunning alternator pulley with heavy-duty serpentine drive belt.',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Maruti Suzuki Dzire'
  },
  {
    id: 1009,
    requestCode: 'REQ-1009',
    product: 'Laser Iridium Spark Plugs (Pack of 4)',
    quantity: 4,
    requestDate: '11 Sep 2026',
    status: 'Quotation Submitted',
    customerRequirement: 'Laser iridium spark plugs for petrol turbo engine.',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Hyundai i20 N Line',
    quotation: {
      unitPrice: 750,
      requestedQuantity: 4,
      productAmount: 3000,
      gstTax: 540,
      deliveryFee: 250,
      convenienceFee: 425,
      finalPayable: 4215,
      remarks: 'NGK Laser Iridium plugs with pre-calibrated gap.',
      submittedAt: '12 Sep 2026, 10:00 AM'
    }
  },
  {
    id: 1010,
    requestCode: 'REQ-1010',
    product: 'Radiator Cooling Fan Motor Assembly',
    quantity: 1,
    requestDate: '10 Sep 2026',
    status: 'Quotation Required',
    customerRequirement: 'High CFM brushless radiator cooling fan with shroud.',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Tata Nexon'
  },
  {
    id: 1011,
    requestCode: 'REQ-1011',
    product: 'All-Weather Aerodynamic Wiper Blades',
    quantity: 2,
    requestDate: '09 Sep 2026',
    status: 'Quotation Required',
    customerRequirement: 'Frameless silicone wiper blades (22 inch & 18 inch).',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Mahindra Thar'
  },
  {
    id: 1012,
    requestCode: 'REQ-1012',
    product: 'Timing Belt & Tensioner Roller Kit',
    quantity: 1,
    requestDate: '08 Sep 2026',
    status: 'Quotation Submitted',
    customerRequirement: 'Complete timing belt overhaul kit with hydraulic damper.',
    vehicleCategory: 'Commercial Vehicle',
    vehicleModel: 'Force Traveller 3350',
    quotation: {
      unitPrice: 4200,
      requestedQuantity: 1,
      productAmount: 4200,
      gstTax: 756,
      deliveryFee: 250,
      convenienceFee: 425,
      finalPayable: 5631,
      remarks: 'Gates heavy-duty timing kit with 80,000 km warranty.',
      submittedAt: '09 Sep 2026, 05:20 PM'
    }
  }
];

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

  // Requests Data
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

  // Quotation Form Inputs
  quoteUnitPrice: number | string = '';
  quoteGstTax: number | string = 0;
  quoteDeliveryFee: number | string = 250;
  quoteConvenienceFee: number | string = 425;
  quoteRemarks = '';

  constructor(private notificationService: NotificationService) {}

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
  // DATA MANAGEMENT & MOCK API
  // ==========================================

  loadRequests(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }

    // Mock API latency
    setTimeout(() => {
      this.isLoading = false;
      this.isRefreshing = false;

      let stored = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) stored = JSON.parse(raw);
        } catch (_) {}
      }

      if (stored && Array.isArray(stored) && stored.length > 0) {
        this.requests = stored;
      } else {
        this.requests = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
        this.persistRequests();
      }

      this.computeKpis();
      this.applyFilter(true);
    }, isRefresh ? 400 : 250);
  }

  private persistRequests(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.requests));
      } catch (_) {}
    }
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
        (r.vehicleModel && r.vehicleModel.toLowerCase().includes(q))
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

  get finalPayable(): number {
    const prodAmt = this.productAmount;
    const tax = Number(this.quoteGstTax) || 0;
    const delivery = Number(this.quoteDeliveryFee) || 0;
    const convenience = Number(this.quoteConvenienceFee) || 0;
    return prodAmt + tax + delivery + convenience;
  }

  openQuoteModal(request: PurchaseRequestItem): void {
    this.selectedRequest = request;

    if (request.quotation) {
      // Existing quotation review
      this.quoteUnitPrice = request.quotation.unitPrice;
      this.quoteGstTax = request.quotation.gstTax;
      this.quoteDeliveryFee = request.quotation.deliveryFee;
      this.quoteConvenienceFee = request.quotation.convenienceFee;
      this.quoteRemarks = request.quotation.remarks || '';
    } else {
      // New quotation form
      this.quoteUnitPrice = '';
      this.quoteGstTax = 0;
      this.quoteDeliveryFee = 250;
      this.quoteConvenienceFee = 425;
      this.quoteRemarks = '';
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

    this.isSubmittingQuote = true;

    // Simulate mock submission delay
    setTimeout(() => {
      this.isSubmittingQuote = false;

      const newQuotation: PurchaseQuotation = {
        unitPrice: unitPriceNum,
        requestedQuantity: this.selectedRequest!.quantity,
        productAmount: this.productAmount,
        gstTax: Number(this.quoteGstTax) || 0,
        deliveryFee: Number(this.quoteDeliveryFee) || 0,
        convenienceFee: Number(this.quoteConvenienceFee) || 0,
        finalPayable: this.finalPayable,
        remarks: this.quoteRemarks.trim(),
        submittedAt: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      // Update in-memory and storage
      this.selectedRequest!.status = 'Quotation Submitted';
      this.selectedRequest!.quotation = newQuotation;

      const idx = this.requests.findIndex(r => r.id === this.selectedRequest!.id);
      if (idx !== -1) {
        this.requests[idx].status = 'Quotation Submitted';
        this.requests[idx].quotation = newQuotation;
      }

      this.persistRequests();
      this.computeKpis();
      this.applyFilter();

      this.notificationService.show('Quotation submitted successfully!', 'success');
      this.closeQuoteModal();
    }, 600);
  }

  resetAllMockData(): void {
    this.requests = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
    this.persistRequests();
    this.computeKpis();
    this.applyFilter(true);
    this.notificationService.show('Mock data reset to initial state.', 'info');
  }
}
