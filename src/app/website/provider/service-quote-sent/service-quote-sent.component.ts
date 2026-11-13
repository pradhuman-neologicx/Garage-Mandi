import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NotificationService } from 'src/app/core/services/notificationnew.service';
import { ProviderService } from 'src/app/core/services/provider.service';

export interface ServiceQuoteSentItem {
  id: string | number;
  requestId?: string | number;
  requestCode?: string;
  requirementTitle: string;
  description?: string;
  requestDescription?: string;
  quotedAmount: number;
  vehicleModel: string;
  category: string;
  quotationType?: string;
  location: string;
  sentDate: string;
  status?: string;
  requestStatus?: string;
  customerName?: string;
  mediaUrls?: string[];
  media?: any[];
  feedbackGiven?: boolean;
  rating?: number;
  feedbackText?: string;
  fulfilled?: boolean;
  raw?: any;
}

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

  // Server-side Pagination State (matching API response)
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalRecords = 0;
  startIndex = 0;
  endIndex = 0;

  // KPIs
  kpis = {
    totalQuotes: 0,
    totalValue: 0,
    spareParts: 0,
    service: 0
  };

  // View Modal State
  isViewModalOpen = false;
  isLoadingDetail = false;
  selectedQuote: ServiceQuoteSentItem | null = null;

  constructor(
    private notificationService: NotificationService,
    private providerService: ProviderService
  ) {}

  ngOnInit(): void {
    this.loadQuotes();
  }

  // ==========================================
  // DATA LOADING (SERVER-SIDE PAGINATION)
  // ==========================================

  loadQuotes(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }

    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (this.selectedCategory !== 'all') {
      params.category = this.selectedCategory;
      params.quotation_type = this.selectedCategory === 'spare_part' ? 'spare_part' : 'service_request';
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      params.search = this.searchQuery.trim();
    }

    this.providerService.getProviderQuotations(params).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.isRefreshing = false;

        let rawList: any[] = [];
        if (Array.isArray(res?.data)) {
          rawList = res.data;
        } else if (Array.isArray(res)) {
          rawList = res;
        } else if (res?.data && Array.isArray(res.data.data)) {
          rawList = res.data.data;
        }

        this.quotes = rawList.map(item => this.mapApiItemToQuote(item));
        this.filteredQuotes = [...this.quotes];
        this.pagedQuotes = [...this.quotes];

        // SERVER-SIDE PAGINATION FROM API
        if (res?.pagination) {
          const p = res.pagination;
          this.totalRecords = Number(p.total) || this.quotes.length;
          this.currentPage = Number(p.current_page) || 1;
          this.pageSize = Number(p.per_page) || this.pageSize;
          this.totalPages = Number(p.last_page) || Math.max(1, Math.ceil(this.totalRecords / this.pageSize));

          if (p.from !== undefined && p.from !== null) {
            this.startIndex = Number(p.from);
          } else {
            this.startIndex = this.totalRecords === 0 ? 0 : ((this.currentPage - 1) * this.pageSize + 1);
          }

          if (p.to !== undefined && p.to !== null) {
            this.endIndex = Number(p.to);
          } else {
            this.endIndex = Math.min(this.currentPage * this.pageSize, this.totalRecords);
          }
        } else {
          // Client-side fallback if pagination object not provided
          this.totalRecords = this.quotes.length;
          this.totalPages = Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
          this.startIndex = this.totalRecords === 0 ? 0 : ((this.currentPage - 1) * this.pageSize + 1);
          this.endIndex = Math.min(this.currentPage * this.pageSize, this.totalRecords);
        }

        this.computeKpis(res);

        if (isRefresh) {
          this.notificationService.show('Quotes list refreshed successfully.', 'success');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.isRefreshing = false;
        this.quotes = [];
        this.filteredQuotes = [];
        this.pagedQuotes = [];
        this.totalRecords = 0;
        this.startIndex = 0;
        this.endIndex = 0;
        this.totalPages = 1;
        this.computeKpis();
        const msg = err?.error?.message || err?.message || 'Failed to load submitted quotations.';
        this.notificationService.show(msg, 'error');
      }
    });
  }

  private mapApiItemToQuote(item: any): ServiceQuoteSentItem {
    const req = item?.request || {};
    const reqId = item?.request_id || req?.id || '';
    const qType = item?.quotation_type || '';

    // Category resolution
    let category = 'Service';
    if (qType.includes('spare') || req?.spare_parts_id || req?.category_id) {
      category = 'Spare Part';
    } else if (qType.includes('service') || req?.service_type_id) {
      category = 'Service';
    } else if (req?.vehicle_category?.name) {
      category = req.vehicle_category.name;
    }

    // Vehicle model resolution
    let vehicleModel = req?.vehicle_model || req?.vehicle_brand?.name || req?.vehicle_brand || '';
    if (!vehicleModel) {
      if (req?.vehicle_category?.name) {
        vehicleModel = req.vehicle_category.name;
      } else if (req?.vehicle_category_id === 1) {
        vehicleModel = 'Two Wheeler';
      } else if (req?.vehicle_category_id === 2) {
        vehicleModel = 'Four Wheeler';
      } else {
        vehicleModel = 'General Vehicle';
      }
    }

    const title = req?.title || req?.requirement_title || item?.title || 'Quotation';
    const desc = item?.description || req?.description || '';
    const location = req?.location || item?.location || '-';
    const amount = Number(item?.price) || 0;

    let mediaList: string[] = [];
    if (Array.isArray(item?.media_urls)) {
      mediaList = item.media_urls;
    } else if (Array.isArray(item?.media)) {
      mediaList = item.media.map((m: any) => m.file_url || m.url || m.file_path || m);
    }

    return {
      id: item?.id,
      requestId: reqId,
      requestCode: reqId ? `REQ-${reqId}` : `Q-${item?.id}`,
      requirementTitle: title,
      description: desc,
      requestDescription: req?.description || '',
      quotedAmount: amount,
      vehicleModel: vehicleModel,
      category: category,
      quotationType: qType,
      location: location,
      sentDate: this.formatDate(item?.created_at),
      status: item?.status || 'sent',
      requestStatus: req?.status || '',
      customerName: req?.customer_name || req?.creator?.name || '',
      mediaUrls: mediaList,
      media: item?.media || [],
      feedbackGiven: Boolean(req?.feedback_given),
      rating: req?.rating || 0,
      feedbackText: req?.feedback_text || '',
      fulfilled: Boolean(req?.fulfilled),
      raw: item
    };
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (_) {
      return dateStr;
    }
  }

  computeKpis(res?: any): void {
    const summary = res?.summary || res?.data?.summary;
    if (summary) {
      this.kpis.totalQuotes = Number(summary.total) || this.totalRecords;
      this.kpis.totalValue = Number(summary.total_value) || 0;
      this.kpis.spareParts = Number(summary.spare_parts) || 0;
      this.kpis.service = Number(summary.service) || 0;
    } else {
      this.kpis.totalQuotes = this.totalRecords;
      this.kpis.totalValue = this.quotes.reduce((sum, q) => sum + (q.quotedAmount || 0), 0);
      if (this.selectedCategory === 'all') {
        this.kpis.spareParts = this.quotes.filter(q => q.category.toLowerCase().includes('spare')).length;
        this.kpis.service = this.quotes.filter(q => !q.category.toLowerCase().includes('spare')).length;
      }
    }
  }

  // ==========================================
  // FILTER & SEARCH (TRIGGERS API)
  // ==========================================

  setCategory(cat: string): void {
    if (this.selectedCategory === cat) return;
    this.selectedCategory = cat;
    this.currentPage = 1;
    this.loadQuotes();
  }

  onSearchSubmit(): void {
    this.currentPage = 1;
    this.loadQuotes();
  }

  clearSearch(): void {
    if (!this.searchQuery) return;
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadQuotes();
  }

  // ==========================================
  // PAGINATION CONTROLS
  // ==========================================

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadQuotes();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  }

  onPageSizeChange(newSize: any): void {
    const size = Number(newSize);
    if (!size || size === this.pageSize) return;
    this.pageSize = size;
    this.currentPage = 1;
    this.loadQuotes();
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
  // VIEW DETAILS MODAL (BY ID API)
  // ==========================================

  openViewModal(quote: ServiceQuoteSentItem): void {
    this.selectedQuote = quote;
    this.isViewModalOpen = true;
    this.isLoadingDetail = true;

    this.providerService.getProviderQuotationById(quote.id).subscribe({
      next: (res: any) => {
        this.isLoadingDetail = false;
        const detailData = res?.data || res;
        if (detailData && typeof detailData === 'object') {
          this.selectedQuote = this.mapApiItemToQuote(detailData);
        }
      },
      error: (_err: any) => {
        this.isLoadingDetail = false;
      }
    });
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.isLoadingDetail = false;
    this.selectedQuote = null;
  }

  getStatusClass(status: string | undefined): string {
    const s = (status || '').toLowerCase();
    if (s === 'accepted' || s === 'completed' || s === 'complete') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'viewed') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'pending' || s === 'sent') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'rejected' || s === 'cancelled') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  }

  copyText(text: string, label = 'Copied'): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.notificationService.show(`${label} to clipboard!`, 'success');
    }
  }
}
