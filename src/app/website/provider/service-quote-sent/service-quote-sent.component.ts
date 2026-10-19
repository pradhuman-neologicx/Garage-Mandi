import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

export interface ServiceQuoteSentItem {
  id: string | number;
  requirementTitle: string; // e.g. 'requirement title', 'qwertyuiop', 'vevhile'
  description?: string; // e.g. 'test', 'testtest'
  quotedAmount: number; // e.g. 12345.00, 100.00, 235.00
  vehicleModel: string; // e.g. 'vehicle model', 'asfghjkl', 'vechile1'
  category: string; // e.g. 'Spare Part', 'Periodic Service'
  location: string; // e.g. '-', 'Jaipur, RJ'
  sentDate: string; // e.g. '20 Aug 2026'
  requestCode?: string;
  customerName?: string;
}

const INITIAL_QUOTES: ServiceQuoteSentItem[] = [
  {
    id: 1,
    requirementTitle: 'requirement title',
    quotedAmount: 12345.00,
    vehicleModel: 'vehicle model',
    category: 'Spare Part',
    location: '-',
    sentDate: '20 Aug 2026',
    requestCode: 'REQ-901',
    customerName: 'Rahul Sharma'
  },
  {
    id: 2,
    requirementTitle: 'qwertyuiop',
    description: 'test',
    quotedAmount: 100.00,
    vehicleModel: 'asfghjkl',
    category: 'Spare Part',
    location: '-',
    sentDate: '20 Aug 2026',
    requestCode: 'REQ-902',
    customerName: 'Amit Joshi'
  },
  {
    id: 3,
    requirementTitle: 'vevhile',
    description: 'testtest',
    quotedAmount: 235.00,
    vehicleModel: 'vechile1',
    category: 'Spare Part',
    location: '-',
    sentDate: '20 Aug 2026',
    requestCode: 'REQ-903',
    customerName: 'Vikram Rathore'
  },
  {
    id: 4,
    requirementTitle: 'Brake Pad Replacement & Rotor Skimming',
    description: 'Front ceramic disc brake pads replacement with high-precision rotor skimming and bleeding.',
    quotedAmount: 4250.00,
    vehicleModel: 'Maruti Suzuki Swift',
    category: 'Spare Part',
    location: 'Jaipur, RJ',
    sentDate: '19 Aug 2026',
    requestCode: 'REQ-904',
    customerName: 'Rakesh Meena'
  },
  {
    id: 5,
    requirementTitle: 'Full Engine Periodic Service & Diagnostics',
    description: 'Synthetic engine oil 5W-30 replacement, OEM oil filter, air filter, spark plug inspection and OBD-II scanner.',
    quotedAmount: 3850.00,
    vehicleModel: 'Hyundai Creta (2023)',
    category: 'Periodic Service',
    location: 'Jaipur, RJ',
    sentDate: '18 Aug 2026',
    requestCode: 'REQ-905',
    customerName: 'Pooja Jain'
  },
  {
    id: 6,
    requirementTitle: 'Front Suspension Overhaul & Strut Mounting',
    description: 'Gas-filled shock absorber strut replacement pair with lower ball joints and stabilizer bar links.',
    quotedAmount: 6400.00,
    vehicleModel: 'Honda City (5th Gen)',
    category: 'Spare Part',
    location: 'Udaipur, RJ',
    sentDate: '17 Aug 2026',
    requestCode: 'REQ-906',
    customerName: 'Deepak Sharma'
  },
  {
    id: 7,
    requirementTitle: 'Car AC Gas Refill & Compressor Servicing',
    description: 'Complete AC cooling loop evacuation, vacuum leak testing, 450g R134a refrigerant recharge and cabin filter replacement.',
    quotedAmount: 2150.00,
    vehicleModel: 'Tata Nexon',
    category: 'AC Service',
    location: 'Jodhpur, RJ',
    sentDate: '16 Aug 2026',
    requestCode: 'REQ-907',
    customerName: 'Manoj Tiwari'
  },
  {
    id: 8,
    requirementTitle: 'Clutch Assembly & Flywheel Facing',
    description: 'Clutch plate and diaphragm pressure plate overhaul with release bearing and synthetic transmission fluid.',
    quotedAmount: 5800.00,
    vehicleModel: 'Mahindra Scorpio',
    category: 'Spare Part',
    location: 'Kota, RJ',
    sentDate: '15 Aug 2026',
    requestCode: 'REQ-908',
    customerName: 'Suresh Patel'
  },
  {
    id: 9,
    requirementTitle: 'Laser Iridium Spark Plugs Set of 4',
    description: 'NGK laser iridium spark plugs for high fuel economy and smooth acceleration response.',
    quotedAmount: 1800.00,
    vehicleModel: 'Hyundai i20',
    category: 'Spare Part',
    location: 'Ajmer, RJ',
    sentDate: '14 Aug 2026',
    requestCode: 'REQ-909',
    customerName: 'Mohan Lal'
  }
];

@Component({
  selector: 'app-service-quote-sent',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './service-quote-sent.component.html',
  styleUrl: './service-quote-sent.component.scss'
})
export class ServiceQuoteSentComponent implements OnInit {
  isLoading = false;
  isRefreshing = false;

  // Quotes dataset
  quotes: ServiceQuoteSentItem[] = [];
  filteredQuotes: ServiceQuoteSentItem[] = [];
  pagedQuotes: ServiceQuoteSentItem[] = [];

  // Filter & Search
  searchQuery = '';
  selectedCategory = 'all';

  // Pagination State
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;

  // KPIs
  kpis = {
    totalQuotes: 0,
    totalValue: 0,
    spareParts: 0,
    service: 0
  };

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadQuotes();
  }

  // ==========================================
  // DATA LOADING
  // ==========================================

  loadQuotes(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }

    setTimeout(() => {
      this.isLoading = false;
      this.isRefreshing = false;
      this.quotes = JSON.parse(JSON.stringify(INITIAL_QUOTES));
      this.computeKpis();
      this.applyFilter(true);
      if (isRefresh) {
        this.notificationService.show('Quotes list refreshed successfully.', 'success');
      }
    }, isRefresh ? 350 : 200);
  }

  computeKpis(): void {
    this.kpis.totalQuotes = this.quotes.length;
    this.kpis.totalValue = this.quotes.reduce((sum, q) => sum + (q.quotedAmount || 0), 0);
    this.kpis.spareParts = this.quotes.filter(q => q.category === 'Spare Part').length;
    this.kpis.service = this.quotes.filter(q => q.category !== 'Spare Part').length;
  }

  // ==========================================
  // FILTER & SEARCH
  // ==========================================

  setCategory(cat: string): void {
    this.selectedCategory = cat;
    this.applyFilter(true);
  }

  onSearchChange(): void {
    this.applyFilter(true);
  }

  applyFilter(resetPage = false): void {
    if (resetPage) {
      this.currentPage = 1;
    }

    let result = [...this.quotes];

    // Category Filter
    if (this.selectedCategory !== 'all') {
      if (this.selectedCategory === 'spare_part') {
        result = result.filter(q => q.category === 'Spare Part');
      } else if (this.selectedCategory === 'service') {
        result = result.filter(q => q.category !== 'Spare Part');
      }
    }

    // Search Query Filter
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(item =>
        item.requirementTitle.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.vehicleModel.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.requestCode && item.requestCode.toLowerCase().includes(q))
      );
    }

    this.filteredQuotes = result;
    this.updatePagination();
  }

  // ==========================================
  // PAGINATION
  // ==========================================

  get totalRecords(): number {
    return this.filteredQuotes.length;
  }

  get startIndex(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredQuotes.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedQuotes = this.filteredQuotes.slice(start, end);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.updatePagination();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 200, behavior: 'smooth' });
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

  copyText(text: string, label = 'Copied'): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.notificationService.show(`${label} to clipboard!`, 'success');
    }
  }
}
