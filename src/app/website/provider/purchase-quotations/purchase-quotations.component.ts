import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

export type QuotationStatus =
  | 'Submitted'
  | 'Awaiting Acceptance'
  | 'Awaiting Payment'
  | 'Accepted'
  | 'Confirmed'
  | 'Expired';

export type QuotationFilterTab =
  | 'all'
  | 'submitted'
  | 'awaiting_acceptance'
  | 'awaiting_payment'
  | 'accepted'
  | 'confirmed'
  | 'expired';

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
  status: QuotationStatus;
  price: QuotationPriceBreakdown;
  validityNotice?: string;
  paymentStatus: 'Pending' | 'Successful' | 'Failed';
  fundsStatus: 'Not Held' | 'Held' | 'Released';
  vehicleCategory?: string;
  vehicleModel?: string;
  customerRequirement?: string;
  remarks?: string;
  providerActionNotice?: string;
}

const STORAGE_KEY = 'garage_mandi_mock_purchase_quotations_v2';

export const FLOW_STEPS = [
  'Quotation Submitted',
  'Awaiting Customer Acceptance',
  'Awaiting Customer Payment',
  'Order Confirmed',
  'Ready for Pickup',
  'Shipped'
];

const INITIAL_MOCK_QUOTATIONS: PurchaseQuotationItem[] = [
  {
    id: 1,
    quotationCode: 'QTN-1001',
    version: 'V1',
    requestCode: 'REQ-1001',
    product: 'Brake Pad Set',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98290 12345',
    customerCity: 'Jaipur, Rajasthan',
    quantity: 2,
    submittedDate: '21 Sep 2026',
    validUntil: '22 Sep 2026',
    acceptanceDate: '-',
    status: 'Submitted',
    validityNotice: 'Valid for 24 Hours',
    paymentStatus: 'Pending',
    fundsStatus: 'Not Held',
    price: {
      quantity: 2,
      unitPrice: 4250.00,
      productAmount: 8500.00,
      gstTax: 1651.50,
      deliveryFee: 250.00,
      platformFee: 425.00,
      finalPayable: 10826.50
    },
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Maruti Suzuki Swift',
    customerRequirement: 'Front brake pad set required for vehicle.',
    remarks: 'Original quality brake pads available.',
    providerActionNotice: 'Provider action: No action is required until the customer accepts the quotation.'
  },
  {
    id: 2,
    quotationCode: 'QTN-1002',
    version: 'V1',
    requestCode: 'REQ-1002',
    product: 'Car Battery',
    customerName: 'Amit Kumar',
    customerPhone: '+91 94140 54321',
    customerCity: 'Bikaner, Rajasthan',
    quantity: 1,
    submittedDate: '20 Sep 2026',
    validUntil: '21 Sep 2026',
    acceptanceDate: '-',
    status: 'Awaiting Acceptance',
    validityNotice: 'Valid for 24 Hours',
    paymentStatus: 'Pending',
    fundsStatus: 'Not Held',
    price: {
      quantity: 1,
      unitPrice: 5800.00,
      productAmount: 5800.00,
      gstTax: 975.00,
      deliveryFee: 250.00,
      platformFee: 425.00,
      finalPayable: 7450.00
    },
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Hyundai Creta',
    customerRequirement: 'Maintenance-free 65Ah battery with high cranking power.',
    remarks: 'Amaron Pro battery with 48 months pro-rata warranty.',
    providerActionNotice: 'Provider action: Awaiting customer review and acceptance.'
  },
  {
    id: 3,
    quotationCode: 'QTN-1003',
    version: 'V1',
    requestCode: 'REQ-1003',
    product: 'Clutch Plate Assembly',
    customerName: 'Sunil Verma',
    customerPhone: '+91 97840 98765',
    customerCity: 'Jodhpur, Rajasthan',
    quantity: 1,
    submittedDate: '19 Sep 2026',
    validUntil: '20 Sep 2026',
    acceptanceDate: '19 Sep 2026',
    status: 'Awaiting Payment',
    validityNotice: 'Awaiting customer escrow payment',
    paymentStatus: 'Pending',
    fundsStatus: 'Not Held',
    price: {
      quantity: 1,
      unitPrice: 2850.00,
      productAmount: 2850.00,
      gstTax: 513.00,
      deliveryFee: 250.00,
      platformFee: 425.00,
      finalPayable: 4038.00
    },
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Honda City',
    customerRequirement: 'Complete clutch friction disc with release bearing.',
    remarks: 'Customer accepted the quotation. Waiting for escrow payment authorization.',
    providerActionNotice: 'Provider action: Customer has accepted. Escrow payment deposit is pending.'
  },
  {
    id: 4,
    quotationCode: 'QTN-1004',
    version: 'V1',
    requestCode: 'REQ-1004',
    product: 'LED Headlight Assembly (Right)',
    customerName: 'Priya Singh',
    customerPhone: '+91 96100 23456',
    customerCity: 'Kota, Rajasthan',
    quantity: 1,
    submittedDate: '18 Sep 2026',
    validUntil: '19 Sep 2026',
    acceptanceDate: '18 Sep 2026',
    status: 'Accepted',
    validityNotice: 'Customer accepted quotation',
    paymentStatus: 'Pending',
    fundsStatus: 'Not Held',
    price: {
      quantity: 1,
      unitPrice: 3800.00,
      productAmount: 3800.00,
      gstTax: 684.00,
      deliveryFee: 250.00,
      platformFee: 425.00,
      finalPayable: 5159.00
    },
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Kia Seltos',
    customerRequirement: 'Original projector headlamp unit without scratch or damage.',
    remarks: 'Quotation accepted. Packing in progress for dispatch.',
    providerActionNotice: 'Provider action: Customer accepted quote. Order confirmation in progress.'
  },
  {
    id: 5,
    quotationCode: 'QTN-1005',
    version: 'V1',
    requestCode: 'REQ-1005',
    product: 'Front Shock Absorber Strut Pair',
    customerName: 'Vikram Rathore',
    customerPhone: '+91 95870 34567',
    customerCity: 'Udaipur, Rajasthan',
    quantity: 2,
    submittedDate: '16 Sep 2026',
    validUntil: '17 Sep 2026',
    acceptanceDate: '16 Sep 2026',
    status: 'Confirmed',
    paymentStatus: 'Successful',
    fundsStatus: 'Held',
    price: {
      quantity: 2,
      unitPrice: 3400.00,
      productAmount: 6800.00,
      gstTax: 1224.00,
      deliveryFee: 250.00,
      platformFee: 425.00,
      finalPayable: 8699.00
    },
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Tata Nexon',
    customerRequirement: 'Complete front gas-charged suspension strut pair with bush kit.',
    remarks: 'Payment confirmed in Escrow. Ready for pickup/dispatch.',
    providerActionNotice: 'Provider action: Payment is confirmed and funds are held in escrow. Please mark ready for pickup when packaged.'
  },
  {
    id: 6,
    quotationCode: 'QTN-1006',
    version: 'V2',
    requestCode: 'REQ-1006',
    product: 'Radiator',
    customerName: 'Rakesh Meena',
    customerPhone: '+91 98280 67890',
    customerCity: 'Ajmer, Rajasthan',
    quantity: 1,
    submittedDate: '14 Sep 2026',
    validUntil: '15 Sep 2026',
    acceptanceDate: '14 Sep 2026',
    status: 'Confirmed',
    paymentStatus: 'Successful',
    fundsStatus: 'Held',
    price: {
      quantity: 1,
      unitPrice: 6800.00,
      productAmount: 6800.00,
      gstTax: 1199.00,
      deliveryFee: 250.00,
      platformFee: 425.00,
      finalPayable: 8674.00
    },
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Mahindra Scorpio Classic',
    customerRequirement: 'Heavy-duty aluminum core radiator assembly.',
    remarks: 'Revised V2 accepted. Payment in Garage Mandi escrow.',
    providerActionNotice: 'Provider action: Order is confirmed! Please prepare the part for pickup or dispatch.'
  },
  {
    id: 7,
    quotationCode: 'QTN-1007',
    version: 'V1',
    requestCode: 'REQ-1007',
    product: 'Engine Oil Filter & O-Ring',
    customerName: 'Deepali Joshi',
    customerPhone: '+91 97720 45678',
    customerCity: 'Jaipur, Rajasthan',
    quantity: 4,
    submittedDate: '14 Sep 2026',
    validUntil: '15 Sep 2026',
    acceptanceDate: '-',
    status: 'Submitted',
    validityNotice: 'Valid for 24 Hours',
    paymentStatus: 'Pending',
    fundsStatus: 'Not Held',
    price: {
      quantity: 4,
      unitPrice: 350.00,
      productAmount: 1400.00,
      gstTax: 252.00,
      deliveryFee: 250.00,
      platformFee: 425.00,
      finalPayable: 2327.00
    },
    vehicleCategory: 'Commercial Vehicle',
    vehicleModel: 'Tata Ace Gold',
    customerRequirement: 'Pack of 4 heavy duty diesel oil filters.',
    remarks: 'Original spin-on oil filters with synthetic blend media.',
    providerActionNotice: 'Provider action: No action is required until the customer accepts the quotation.'
  },
  {
    id: 8,
    quotationCode: 'QTN-1008',
    version: 'V1',
    requestCode: 'REQ-1008',
    product: 'Gearbox Oil & Seal Kit',
    customerName: 'Mohan Lal',
    customerPhone: '+91 94600 78901',
    customerCity: 'Alwar, Rajasthan',
    quantity: 1,
    submittedDate: '13 Sep 2026',
    validUntil: '14 Sep 2026',
    acceptanceDate: '-',
    status: 'Awaiting Acceptance',
    validityNotice: 'Valid for 24 Hours',
    paymentStatus: 'Pending',
    fundsStatus: 'Not Held',
    price: {
      quantity: 1,
      unitPrice: 2200.00,
      productAmount: 2200.00,
      gstTax: 396.00,
      deliveryFee: 250.00,
      platformFee: 425.00,
      finalPayable: 3271.00
    },
    vehicleCategory: 'Commercial Vehicle',
    vehicleModel: 'Mahindra Bolero Maxi Truck',
    customerRequirement: 'High-viscosity manual transmission oil with OEM oil seal set.',
    remarks: 'Includes 3L 80W-90 gear fluid + input/output shaft seals.',
    providerActionNotice: 'Provider action: Awaiting customer review and acceptance.'
  },
  {
    id: 9,
    quotationCode: 'QTN-1009',
    version: 'V1',
    requestCode: 'REQ-1009',
    product: 'Rear Brake Shoe Set',
    customerName: 'Suresh Patel',
    customerPhone: '+91 96800 12389',
    customerCity: 'Bhilwara, Rajasthan',
    quantity: 2,
    submittedDate: '12 Sep 2026',
    validUntil: '13 Sep 2026',
    acceptanceDate: '12 Sep 2026',
    status: 'Awaiting Payment',
    validityNotice: 'Awaiting customer escrow payment',
    paymentStatus: 'Pending',
    fundsStatus: 'Not Held',
    price: {
      quantity: 2,
      unitPrice: 580.00,
      productAmount: 1160.00,
      gstTax: 208.00,
      deliveryFee: 250.00,
      platformFee: 425.00,
      finalPayable: 2043.00
    },
    vehicleCategory: 'Two Wheeler',
    vehicleModel: 'TVS Jupiter 125',
    customerRequirement: 'Original drum brake shoe set with tension spring fittings.',
    remarks: 'Customer accepted pricing. Payment link sent.',
    providerActionNotice: 'Provider action: Customer has accepted. Escrow payment deposit is pending.'
  },
  {
    id: 10,
    quotationCode: 'QTN-1010',
    version: 'V1',
    requestCode: 'REQ-1010',
    product: 'Laser Iridium Spark Plugs (Pack of 4)',
    customerName: 'Anil Sharma',
    customerPhone: '+91 98299 98712',
    customerCity: 'Jaipur, Rajasthan',
    quantity: 4,
    submittedDate: '11 Sep 2026',
    validUntil: '12 Sep 2026',
    acceptanceDate: '11 Sep 2026',
    status: 'Accepted',
    validityNotice: 'Customer accepted quotation',
    paymentStatus: 'Pending',
    fundsStatus: 'Not Held',
    price: {
      quantity: 4,
      unitPrice: 750.00,
      productAmount: 3000.00,
      gstTax: 540.00,
      deliveryFee: 250.00,
      platformFee: 425.00,
      finalPayable: 4215.00
    },
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Hyundai i20 N Line',
    customerRequirement: 'Laser iridium spark plugs for petrol turbo engine.',
    remarks: 'NGK laser iridium genuine spark plugs.',
    providerActionNotice: 'Provider action: Customer accepted quote. Order confirmation in progress.'
  },
  {
    id: 11,
    quotationCode: 'QTN-1011',
    version: 'V1',
    requestCode: 'REQ-1011',
    product: 'Alternator Pulley & V-Belt',
    customerName: 'Manoj Tiwari',
    customerPhone: '+91 94145 67812',
    customerCity: 'Sikar, Rajasthan',
    quantity: 1,
    submittedDate: '05 Sep 2026',
    validUntil: '06 Sep 2026',
    acceptanceDate: '-',
    status: 'Expired',
    validityNotice: 'Expired on 06 Sep 2026',
    paymentStatus: 'Pending',
    fundsStatus: 'Not Held',
    price: {
      quantity: 1,
      unitPrice: 2350.00,
      productAmount: 2350.00,
      gstTax: 423.00,
      deliveryFee: 250.00,
      platformFee: 425.00,
      finalPayable: 3448.00
    },
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Maruti Suzuki Dzire',
    customerRequirement: 'Overrunning alternator pulley with heavy-duty serpentine drive belt.',
    remarks: 'Quotation expired after 24 hours without customer acceptance.',
    providerActionNotice: 'Provider action: This quotation has expired. You may submit a new quotation if requested.'
  },
  {
    id: 12,
    quotationCode: 'QTN-1012',
    version: 'V1',
    requestCode: 'REQ-1012',
    product: 'Aerodynamic Wiper Blades (Pair)',
    customerName: 'Pooja Jain',
    customerPhone: '+91 95490 89012',
    customerCity: 'Jaipur, Rajasthan',
    quantity: 2,
    submittedDate: '03 Sep 2026',
    validUntil: '04 Sep 2026',
    acceptanceDate: '-',
    status: 'Expired',
    validityNotice: 'Expired on 04 Sep 2026',
    paymentStatus: 'Pending',
    fundsStatus: 'Not Held',
    price: {
      quantity: 2,
      unitPrice: 650.00,
      productAmount: 1300.00,
      gstTax: 234.00,
      deliveryFee: 250.00,
      platformFee: 425.00,
      finalPayable: 2209.00
    },
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Mahindra Thar',
    customerRequirement: 'Frameless silicone wiper blades (22 inch & 18 inch).',
    remarks: 'Validity period completed without response.',
    providerActionNotice: 'Provider action: This quotation has expired.'
  }
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

  // Filter & Search
  activeTab: QuotationFilterTab = 'all';
  searchQuery = '';

  // Pagination State
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;

  // Tab Counts / KPIs
  kpis = {
    all: 0,
    submitted: 0,
    awaiting_acceptance: 0,
    awaiting_payment: 0,
    accepted: 0,
    confirmed: 0,
    expired: 0
  };

  // Details Modal State
  isDetailsModalOpen = false;
  selectedQuotation: PurchaseQuotationItem | null = null;

  readonly flowSteps = FLOW_STEPS;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadQuotations();
  }

  // ==========================================
  // PAGINATION GETTERS & CONTROLS
  // ==========================================

  get totalRecords(): number {
    return this.filteredQuotations.length;
  }

  get paginationFrom(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  updatePagination(): void {
    const total = this.filteredQuotations.length;
    this.totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedQuotations = this.filteredQuotations.slice(startIndex, endIndex);
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

  loadQuotations(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }

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
        this.quotations = stored;
      } else {
        this.quotations = JSON.parse(JSON.stringify(INITIAL_MOCK_QUOTATIONS));
        this.persistQuotations();
      }

      this.computeKpis();
      this.applyFilter(true);
    }, isRefresh ? 400 : 250);
  }

  private persistQuotations(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.quotations));
      } catch (_) {}
    }
  }

  computeKpis(): void {
    this.kpis.all = this.quotations.length;
    this.kpis.submitted = this.quotations.filter(q => q.status === 'Submitted').length;
    this.kpis.awaiting_acceptance = this.quotations.filter(q => q.status === 'Awaiting Acceptance').length;
    this.kpis.awaiting_payment = this.quotations.filter(q => q.status === 'Awaiting Payment').length;
    this.kpis.accepted = this.quotations.filter(q => q.status === 'Accepted').length;
    this.kpis.confirmed = this.quotations.filter(q => q.status === 'Confirmed').length;
    this.kpis.expired = this.quotations.filter(q => q.status === 'Expired').length;
  }

  setTab(tab: QuotationFilterTab): void {
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

    let result = [...this.quotations];

    // Status tab filter
    if (this.activeTab === 'submitted') {
      result = result.filter(q => q.status === 'Submitted');
    } else if (this.activeTab === 'awaiting_acceptance') {
      result = result.filter(q => q.status === 'Awaiting Acceptance');
    } else if (this.activeTab === 'awaiting_payment') {
      result = result.filter(q => q.status === 'Awaiting Payment');
    } else if (this.activeTab === 'accepted') {
      result = result.filter(q => q.status === 'Accepted');
    } else if (this.activeTab === 'confirmed') {
      result = result.filter(q => q.status === 'Confirmed');
    } else if (this.activeTab === 'expired') {
      result = result.filter(q => q.status === 'Expired');
    }

    // Search query filter
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(item =>
        item.product.toLowerCase().includes(q) ||
        item.quotationCode.toLowerCase().includes(q) ||
        item.requestCode.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        (item.vehicleModel && item.vehicleModel.toLowerCase().includes(q))
      );
    }

    this.filteredQuotations = result;
    this.updatePagination();
  }

  // Status Badge CSS Classes
  getStatusBadgeClass(status: QuotationStatus): string {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Awaiting Acceptance':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Awaiting Payment':
        return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
      case 'Accepted':
        return 'bg-teal-100 text-teal-800 border border-teal-200';
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'Expired':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }

  // ==========================================
  // QUOTATION FLOW STEPPER LOGIC
  // ==========================================

  getFlowStepIndex(status: QuotationStatus): number {
    switch (status) {
      case 'Submitted':
        return 0; // Quotation Submitted
      case 'Awaiting Acceptance':
        return 1; // Awaiting Customer Acceptance
      case 'Awaiting Payment':
      case 'Accepted':
        return 2; // Awaiting Customer Payment
      case 'Confirmed':
        return 3; // Order Confirmed
      case 'Expired':
        return -1;
      default:
        return 0;
    }
  }

  isStepCompleted(stepIdx: number, status: QuotationStatus): boolean {
    if (status === 'Expired') return false;
    const current = this.getFlowStepIndex(status);
    return stepIdx <= current;
  }

  isStepCurrent(stepIdx: number, status: QuotationStatus): boolean {
    if (status === 'Expired') return false;
    const current = this.getFlowStepIndex(status);
    return stepIdx === current;
  }

  // ==========================================
  // DETAILS MODAL
  // ==========================================

  openDetailsModal(quotation: PurchaseQuotationItem): void {
    this.selectedQuotation = quotation;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedQuotation = null;
  }

  resetAllMockData(): void {
    this.quotations = JSON.parse(JSON.stringify(INITIAL_MOCK_QUOTATIONS));
    this.persistQuotations();
    this.computeKpis();
    this.applyFilter(true);
    this.notificationService.show('Quotations mock data reset to initial state.', 'info');
  }

  copyQuoteCode(code: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      this.notificationService.show(`Copied ${code} to clipboard!`, 'success');
    }
  }
}
