import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

export type SettlementStatus = 'eligible' | 'settled' | 'held' | 'disputed';

export interface SellerSettlement {
  id: number;
  settlementNumber: string;
  orderId: number;
  orderNumber: string;
  orderDate: string;
  deliveredAt?: string;
  sellerId: number;
  sellerName: string;
  workshopName: string;
  sellerPhone: string;
  sellerBank: {
    bankName: string;
    accountNumber: string;
    ifsc: string;
    upiId: string;
  };
  productName: string;
  productTotal: number;
  platformFeeDeducted: number;
  payoutAmount: number;
  status: SettlementStatus;
  holdReason?: string;
  eligibleAt?: string;
  settledAt?: string;
  payoutDetails?: {
    payoutMode: 'IMPS/NEFT' | 'UPI' | 'Razorpay Route' | 'Bank Transfer';
    utrNumber: string;
    processedBy: string;
    notes?: string;
    processedAt: string;
  };
}

// Settlements mock data (used until backend settlement endpoints are released)
const MOCK_SETTLEMENTS: SellerSettlement[] = [
  {
    id: 1,
    settlementNumber: 'SET-261102-001',
    orderId: 4,
    orderNumber: 'GMO-261102-T7KTA3',
    orderDate: '02 Nov 2026',
    deliveredAt: '02 Nov 2026',
    sellerId: 143,
    sellerName: 'testfour',
    workshopName: 'testfour Workshop',
    sellerPhone: '8465233555',
    sellerBank: {
      bankName: 'HDFC Bank',
      accountNumber: 'XXXXXX9821',
      ifsc: 'HDFC0000240',
      upiId: 'testfour@hdfcbank'
    },
    productName: 'Front Brake Pad',
    productTotal: 1180.0,
    platformFeeDeducted: 23.6,
    payoutAmount: 1180.0,
    status: 'eligible',
    eligibleAt: '02 Nov 2026, 09:47 am'
  },
  {
    id: 2,
    settlementNumber: 'SET-261031-002',
    orderId: 1,
    orderNumber: 'GMO-261031-HHBF1J',
    orderDate: '31 Oct 2026',
    deliveredAt: '01 Nov 2026',
    sellerId: 135,
    sellerName: 'Neeraj',
    workshopName: 'Neeraj Garage',
    sellerPhone: '9829012345',
    sellerBank: {
      bankName: 'State Bank of India',
      accountNumber: 'XXXXXX4512',
      ifsc: 'SBIN0001420',
      upiId: 'neerajgarage@sbi'
    },
    productName: 'MRF Tyre',
    productTotal: 472.0,
    platformFeeDeducted: 9.44,
    payoutAmount: 472.0,
    status: 'settled',
    settledAt: '01 Nov 2026, 05:00 pm',
    payoutDetails: {
      payoutMode: 'IMPS/NEFT',
      utrNumber: 'UTR9082319451',
      processedBy: 'Super Admin',
      notes: 'Cleared regular weekly payout batch #41',
      processedAt: '01 Nov 2026, 05:00 pm'
    }
  },
  {
    id: 3,
    settlementNumber: 'SET-261102-003',
    orderId: 5,
    orderNumber: 'GMO-261102-I8DCKE',
    orderDate: '02 Nov 2026',
    sellerId: 135,
    sellerName: 'Neeraj',
    workshopName: 'Neeraj Garage',
    sellerPhone: '9829012345',
    sellerBank: {
      bankName: 'State Bank of India',
      accountNumber: 'XXXXXX4512',
      ifsc: 'SBIN0001420',
      upiId: 'neerajgarage@sbi'
    },
    productName: 'Tail Light',
    productTotal: 11.8,
    platformFeeDeducted: 0.24,
    payoutAmount: 11.8,
    status: 'held',
    holdReason: 'Order in progress. Payout releases 24h after customer delivery confirmation.'
  },
  {
    id: 4,
    settlementNumber: 'SET-261028-004',
    orderId: 2,
    orderNumber: 'GMO-261028-PL3910',
    orderDate: '28 Oct 2026',
    deliveredAt: '30 Oct 2026',
    sellerId: 139,
    sellerName: 'Vikram Singh',
    workshopName: 'Singh Auto Workshop',
    sellerPhone: '9828811223',
    sellerBank: {
      bankName: 'ICICI Bank',
      accountNumber: 'XXXXXX7741',
      ifsc: 'ICIC0000854',
      upiId: 'singhauto@icici'
    },
    productName: 'Clutch Plate & Pressure Assembly',
    productTotal: 2450.0,
    platformFeeDeducted: 49.0,
    payoutAmount: 2450.0,
    status: 'eligible',
    eligibleAt: '30 Oct 2026, 06:15 pm'
  }
];

@Component({
  selector: 'app-settlements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './settlements.component.html',
  styleUrl: './settlements.component.scss'
})
export class SettlementsComponent implements OnInit {
  isLoading = false;
  isRefreshing = false;

  settlements: SellerSettlement[] = [];
  filteredSettlements: SellerSettlement[] = [];
  pagedSettlements: SellerSettlement[] = [];
  settlementSearchQuery = '';
  settlementStatusFilter = 'all';
  settlementCurrentPage = 1;
  settlementPageSize = 6;
  settlementTotalPages = 1;

  // Payout Release Modal
  isPayoutModalOpen = false;
  settlementToPayout: SellerSettlement | null = null;
  payoutModeInput: 'IMPS/NEFT' | 'UPI' | 'Razorpay Route' | 'Bank Transfer' = 'IMPS/NEFT';
  payoutUtrInput = '';
  payoutNotesInput = '';

  // Receipt Slip Modal
  isReceiptModalOpen = false;
  selectedReceipt: SellerSettlement | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadSettlements();
  }

  loadSettlements(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    }
    // Settlements tab uses mock data until backend settlement endpoints are released
    this.settlements = JSON.parse(JSON.stringify(MOCK_SETTLEMENTS));
    this.applySettlementFilters(true);

    if (isRefresh) {
      setTimeout(() => {
        this.isRefreshing = false;
        this.notificationService.show('Settlements data refreshed.', 'info');
      }, 400);
    }
  }

  // ==========================================================
  // METRICS & KPIS
  // ==========================================================
  get pendingSettlementsCount(): number {
    return this.settlements.filter(s => s.status === 'eligible').length;
  }

  get pendingSettlementsAmount(): number {
    return this.settlements
      .filter(s => s.status === 'eligible')
      .reduce((acc, s) => acc + (s.payoutAmount || 0), 0);
  }

  get totalSettledAmount(): number {
    return this.settlements
      .filter(s => s.status === 'settled')
      .reduce((acc, s) => acc + (s.payoutAmount || 0), 0);
  }

  get totalHeldAmount(): number {
    return this.settlements
      .filter(s => s.status === 'held')
      .reduce((acc, s) => acc + (s.payoutAmount || 0), 0);
  }

  // ==========================================================
  // FILTERING & PAGINATION
  // ==========================================================
  setSettlementStatusFilter(status: string): void {
    this.settlementStatusFilter = status;
    this.applySettlementFilters(true);
  }

  applySettlementFilters(resetPage = false): void {
    if (resetPage) {
      this.settlementCurrentPage = 1;
    }

    let result = [...this.settlements];

    if (this.settlementStatusFilter !== 'all') {
      result = result.filter(s => s.status === this.settlementStatusFilter);
    }

    if (this.settlementSearchQuery && this.settlementSearchQuery.trim()) {
      const q = this.settlementSearchQuery.trim().toLowerCase();
      result = result.filter(s =>
        s.settlementNumber.toLowerCase().includes(q) ||
        s.orderNumber.toLowerCase().includes(q) ||
        s.workshopName.toLowerCase().includes(q) ||
        s.sellerName.toLowerCase().includes(q) ||
        s.sellerPhone.toLowerCase().includes(q) ||
        s.sellerBank.bankName.toLowerCase().includes(q) ||
        s.sellerBank.accountNumber.toLowerCase().includes(q)
      );
    }

    this.filteredSettlements = result;
    this.settlementTotalPages = Math.max(1, Math.ceil(this.filteredSettlements.length / this.settlementPageSize));
    if (this.settlementCurrentPage > this.settlementTotalPages) {
      this.settlementCurrentPage = this.settlementTotalPages;
    }

    const start = (this.settlementCurrentPage - 1) * this.settlementPageSize;
    this.pagedSettlements = this.filteredSettlements.slice(start, start + this.settlementPageSize);
  }

  goToSettlementPage(page: number): void {
    if (page < 1 || page > this.settlementTotalPages || page === this.settlementCurrentPage) return;
    this.settlementCurrentPage = page;
    const start = (this.settlementCurrentPage - 1) * this.settlementPageSize;
    this.pagedSettlements = this.filteredSettlements.slice(start, start + this.settlementPageSize);
  }

  getSettlementPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.settlementTotalPages;
    const current = this.settlementCurrentPage;

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
  // MODAL ACTIONS: PAYOUT RELEASE
  // ==========================================================
  openPayoutModal(settlement: SellerSettlement, event?: Event): void {
    if (event) event.stopPropagation();
    this.settlementToPayout = settlement;
    this.payoutModeInput = 'IMPS/NEFT';
    this.payoutUtrInput = `UTR${Date.now().toString().slice(-8)}`;
    this.payoutNotesInput = 'Batch Payout via Banking API';
    this.isPayoutModalOpen = true;
  }

  closePayoutModal(): void {
    this.isPayoutModalOpen = false;
    this.settlementToPayout = null;
  }

  confirmPayoutRelease(): void {
    if (!this.settlementToPayout) return;

    if (!this.payoutUtrInput.trim()) {
      this.notificationService.show('Please provide a UTR or Transaction reference number.', 'error');
      return;
    }

    const settlement = this.settlementToPayout;
    const nowStr = this.formatCurrentDateTime();

    settlement.status = 'settled';
    settlement.settledAt = nowStr;
    settlement.payoutDetails = {
      payoutMode: this.payoutModeInput,
      utrNumber: this.payoutUtrInput.trim(),
      processedBy: 'Super Admin',
      notes: this.payoutNotesInput.trim() || 'Disbursed via Admin Portal',
      processedAt: nowStr
    };

    const idx = this.settlements.findIndex(s => s.id === settlement.id);
    if (idx !== -1) {
      this.settlements[idx] = settlement;
    }

    this.applySettlementFilters();

    this.notificationService.show(
      `Payout of ₹${settlement.payoutAmount.toFixed(2)} transferred to ${settlement.workshopName}! UTR: ${this.payoutUtrInput}`,
      'success'
    );

    this.closePayoutModal();
  }

  // ==========================================================
  // MODAL ACTIONS: SETTLEMENT RECEIPT
  // ==========================================================
  openReceiptModal(settlement: SellerSettlement, event?: Event): void {
    if (event) event.stopPropagation();
    this.selectedReceipt = settlement;
    this.isReceiptModalOpen = true;
  }

  closeReceiptModal(): void {
    this.isReceiptModalOpen = false;
    this.selectedReceipt = null;
  }

  printReceipt(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  getSettlementStatusBadgeClass(status: string): string {
    switch (status) {
      case 'eligible':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'settled':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'held':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'disputed':
        return 'bg-rose-100 text-rose-800 border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }

  private formatCurrentDateTime(): string {
    const d = new Date();
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}
