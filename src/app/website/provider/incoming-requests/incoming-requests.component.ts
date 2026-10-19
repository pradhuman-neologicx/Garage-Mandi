import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ProviderService } from 'src/app/core/services/provider.service';
import { JwtService } from 'src/app/core/services/jwt.service';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

export interface IncomingRequestItem {
  id: number | string;
  request_code?: string;
  type: 'service_request' | 'spare_part_inquiry' | string;
  title: string;
  category: string;
  vehicle_category?: string;
  vehicle_brand?: string | null;
  vehicle_model?: string | null;
  description: string;
  part_name?: string | null;
  part_condition?: number | null;
  status: 'new' | 'open' | 'closed' | string;
  created_at: string;
  location?: string | null;
  images?: string[];
  media?: any[];
  quotation_submitted?: boolean;
  my_quotation?: {
    id?: number | string;
    price: number | string;
    description?: string;
    notes?: string;
    submitted_at?: string;
    status?: string;
  };
}

@Component({
  selector: 'app-incoming-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './incoming-requests.component.html',
  styleUrl: './incoming-requests.component.scss'
})
export class IncomingRequestsComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('cameraInput') cameraInputRef!: ElementRef<HTMLInputElement>;

  // Data & Loading States
  isLoading = false;
  isRefreshing = false;
  requests: IncomingRequestItem[] = [];
  filteredRequests: IncomingRequestItem[] = [];

  // Filter & Search States
  activeStatusTab: 'all' | 'new' | 'open' | 'closed' = 'all';
  searchQuery = '';

  // KPIs
  kpis = {
    total: 0,
    new: 0,
    open: 0,
    closed: 0
  };

  // Pagination (Matching Backend API Response)
  currentPage = 1;
  pageSize = 12;
  totalRecords = 0;
  totalPages = 1;
  pagination: any = {
    total: 0,
    current_page: 1,
    per_page: 12,
    last_page: 1,
    from: 0,
    to: 0
  };

  // Quotation Modal State
  isQuoteModalOpen = false;
  selectedRequestForQuote: IncomingRequestItem | null = null;
  quotePrice: number | string = '';
  quoteNotes = '';
  quoteFiles: File[] = [];
  quoteImagePreviews: string[] = [];
  isSubmittingQuote = false;
  quoteErrorMessage: string | null = null;

  // View Details Modal State
  isDetailsModalOpen = false;
  selectedRequestDetails: IncomingRequestItem | null = null;

  // Image Lightbox
  lightboxImageUrl: string | null = null;

  // Provider Info
  providerId: string | number | null = null;
  providerName = '';

  constructor(
    private providerService: ProviderService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initProviderInfo();
    this.fetchRequests();
  }

  /**
   * Read stored provider data
   */
  initProviderInfo(): void {
    const sp = this.jwtService.getServiceProvider();
    this.providerId = sp?.id || this.jwtService.getCustomerId() || null;
    this.providerName = sp?.business_name || this.jwtService.getCustomerName() || 'Service Provider';
  }

  /**
   * Fetch incoming requests directly from real API (NO static mock fallback)
   */
  fetchRequests(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }

    const filters: any = {
      limit: this.pageSize,
      page: this.currentPage
    };

    if (this.activeStatusTab !== 'all') {
      filters.status = this.activeStatusTab;
    }
    if (this.searchQuery && this.searchQuery.trim()) {
      filters.search = this.searchQuery.trim();
    }

    this.providerService.getRequests(filters).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.isRefreshing = false;

        let items: any[] = [];
        if (res && res.data) {
          items = Array.isArray(res.data) ? res.data : (res.data.data || []);
        } else if (Array.isArray(res)) {
          items = res;
        }

        // Map real API items directly
        this.requests = this.mapApiRequests(items);

        // Update pagination from API
        if (res && res.pagination) {
          this.pagination = res.pagination;
          this.totalRecords = res.pagination.total !== undefined ? res.pagination.total : items.length;
          this.totalPages = res.pagination.last_page || Math.ceil(this.totalRecords / this.pageSize) || 1;
          this.currentPage = res.pagination.current_page || 1;
        } else {
          this.totalRecords = items.length;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize) || 1;
          this.pagination = {
            total: items.length,
            current_page: this.currentPage,
            per_page: this.pageSize,
            last_page: this.totalPages,
            from: items.length > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0,
            to: Math.min(this.currentPage * this.pageSize, items.length)
          };
        }

        this.computeKpis();
        this.applyLocalFilters();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.isRefreshing = false;
        console.error('Error fetching requests from API:', err);
        this.requests = [];
        this.filteredRequests = [];
        this.totalRecords = 0;
        this.totalPages = 1;
        this.pagination = {
          total: 0,
          current_page: 1,
          per_page: this.pageSize,
          last_page: 1,
          from: 0,
          to: 0
        };
        this.computeKpis();
      }
    });
  }

  /**
   * Transform backend API response into standardized IncomingRequestItem models
   * Handles both service_request and spare_part_inquiry shapes from the real API response
   */
  private mapApiRequests(items: any[]): IncomingRequestItem[] {
    return items.map((item: any) => {
      const mediaUrls: string[] = [];
      if (item.media && Array.isArray(item.media)) {
        item.media.forEach((m: any) => {
          if (m && m.file_url) mediaUrls.push(m.file_url);
          else if (m && m.url) mediaUrls.push(m.url);
          else if (typeof m === 'string') mediaUrls.push(m);
        });
      } else if (item.images && Array.isArray(item.images)) {
        item.images.forEach((img: any) => {
          if (typeof img === 'string') mediaUrls.push(img);
          else if (img && img.url) mediaUrls.push(img.url);
        });
      }

      // Only match quotation if explicitly marked as my_quotation or matching this provider's ID
      let myQuote: any = null;
      if (item.my_quotation) {
        myQuote = item.my_quotation;
      } else if (item.my_quote) {
        myQuote = item.my_quote;
      } else if (item.quotations && Array.isArray(item.quotations) && this.providerId) {
        const pIdStr = String(this.providerId);
        myQuote = item.quotations.find((q: any) => 
          String(q.provider_id || q.service_provider_id || q.provider?.id || '') === pIdStr
        ) || null;
      }

      const hasSubmittedQuote = !!myQuote || item.is_quoted === true || item.is_quoted === 1 || item.quotation_submitted === true;

      const isSpare = item.type === 'spare_part_inquiry';

      // Title logic
      let displayTitle = '';
      if (isSpare) {
        displayTitle = item.requirement_title || item.part_name || (item.vehicle_model ? `${item.vehicle_model} Part` : `Spare Part Inquiry #${item.id}`);
      } else {
        displayTitle = item.title || item.service_type?.name || `Service Request #${item.id}`;
      }

      // Description logic
      const displayDesc = isSpare
        ? (item.requirement_description || item.description || '')
        : (item.description || item.requirement_description || '');

      // Category / Type name
      const categoryName = isSpare ? 'Spare Part Inquiry' : (item.service_type?.name || 'Service Request');

      // Vehicle category name
      const vehicleCatName = item.vehicle_category?.name || item.category?.name || 'Vehicle';

      const rawStatus = (item.status || 'new').toLowerCase();
      // 'complete' translates to 'closed'
      const normalizedStatus = (rawStatus === 'complete' || rawStatus === 'completed') ? 'closed' : rawStatus;

      return {
        id: item.id,
        request_code: `REQ-${item.id}`,
        type: item.type || (isSpare ? 'spare_part_inquiry' : 'service_request'),
        title: displayTitle,
        category: categoryName,
        vehicle_category: vehicleCatName,
        vehicle_brand: item.vehicle_brand || null,
        vehicle_model: item.vehicle_model || null,
        description: displayDesc,
        part_name: item.part_name || null,
        part_condition: item.part_condition !== undefined ? item.part_condition : null,
        status: normalizedStatus,
        created_at: item.created_at || new Date().toISOString(),
        location: item.location || null,
        images: mediaUrls,
        media: item.media || [],
        quotation_submitted: hasSubmittedQuote,
        my_quotation: myQuote ? {
          id: myQuote.id,
          price: myQuote.price || myQuote.quotation_price,
          notes: myQuote.notes || myQuote.description || '',
          submitted_at: myQuote.created_at,
          status: 'Submitted'
        } : undefined
      };
    });
  }

  /**
   * Calculate counts for status KPI cards and pills
   */
  private computeKpis(): void {
    this.kpis.total = this.pagination.total !== undefined ? this.pagination.total : this.requests.length;
    this.kpis.new = this.requests.filter(r => r.status === 'new').length;
    this.kpis.open = this.requests.filter(r => r.status === 'open' || (r.status === 'new' && r.quotation_submitted)).length;
    this.kpis.closed = this.requests.filter(r => r.status === 'closed' || r.status === 'complete').length;
  }

  /**
   * Switch status tab filter: 'all' | 'new' | 'open' | 'closed'
   */
  setStatusTab(tab: 'all' | 'new' | 'open' | 'closed'): void {
    this.activeStatusTab = tab;
    this.currentPage = 1;
    this.fetchRequests();
  }

  /**
   * Filter and sort requests locally on the active page
   */
  applyLocalFilters(): void {
    let list = [...this.requests];

    // Status filter
    if (this.activeStatusTab !== 'all') {
      if (this.activeStatusTab === 'new') {
        list = list.filter(r => r.status === 'new');
      } else if (this.activeStatusTab === 'open') {
        list = list.filter(r => r.status === 'open' || (r.status === 'new' && r.quotation_submitted));
      } else if (this.activeStatusTab === 'closed') {
        list = list.filter(r => r.status === 'closed' || r.status === 'complete');
      }
    }

    // Search query filter
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(r => 
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.vehicle_model && r.vehicle_model.toLowerCase().includes(q)) ||
        (r.part_name && r.part_name.toLowerCase().includes(q)) ||
        (r.request_code && r.request_code.toLowerCase().includes(q)) ||
        (r.location && r.location.toLowerCase().includes(q))
      );
    }

    // Default newest first
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    this.filteredRequests = list;
  }

  /**
   * Clear all search & filters
   */
  clearFilters(): void {
    this.searchQuery = '';
    this.activeStatusTab = 'all';
    this.currentPage = 1;
    this.fetchRequests();
  }

  // ==========================================
  // PAGINATION CONTROLS
  // ==========================================

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.fetchRequests();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }

  onPageSizeChange(newSize: any): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.fetchRequests();
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
  // SUBMIT QUOTATION MODAL
  // ==========================================

  openQuoteModal(request?: IncomingRequestItem | null): void {
    const target = request || this.selectedRequestDetails;
    if (!target) return;
    if (target.status === 'closed') {
      this.notificationService.show('This request is closed and no longer accepting quotations.', 'error');
      return;
    }
    this.isDetailsModalOpen = false;
    this.selectedRequestForQuote = target;
    if (target.my_quotation) {
      this.quotePrice = target.my_quotation.price;
      this.quoteNotes = target.my_quotation.description || target.my_quotation.notes || '';
    } else {
      this.quotePrice = '';
      this.quoteNotes = '';
    }
    this.quoteFiles = [];
    this.quoteImagePreviews = [];
    this.quoteErrorMessage = null;
    this.isQuoteModalOpen = true;
  }

  openQuoteModalFromDetails(): void {
    if (!this.selectedRequestDetails) return;
    const request = this.selectedRequestDetails;
    this.closeDetailsModal();
    this.openQuoteModal(request);
  }

  closeQuoteModal(): void {
    this.isQuoteModalOpen = false;
    this.selectedRequestForQuote = null;
    this.quotePrice = '';
    this.quoteNotes = '';
    this.quoteFiles = [];
    this.quoteImagePreviews = [];
    this.quoteErrorMessage = null;
    this.isSubmittingQuote = false;
  }

  triggerGalleryUpload(): void {
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.click();
    }
  }



  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        this.notificationService.show('Only image files are supported.', 'error');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.show(`File ${file.name} exceeds 5MB size limit.`, 'error');
        continue;
      }

      this.quoteFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.quoteImagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    event.target.value = '';
  }

  removeSelectedImage(index: number): void {
    this.quoteImagePreviews.splice(index, 1);
    this.quoteFiles.splice(index, 1);
  }

  submitQuotation(): void {
    if (!this.selectedRequestForQuote) return;

    this.quoteErrorMessage = null;

    const numPrice = Number(this.quotePrice);
    if (!this.quotePrice || isNaN(numPrice) || numPrice <= 0) {
      this.quoteErrorMessage = 'Please enter a valid quotation price.';
      this.notificationService.show(this.quoteErrorMessage, 'error');
      return;
    }

    this.isSubmittingQuote = true;

    const formData = new FormData();
    const requestId = String(this.selectedRequestForQuote.id);

    // Exact payload matching Postman:
    // request_id, price, description, images[]
    formData.append('request_id', requestId);
    formData.append('price', String(numPrice));

    if (this.quoteNotes && this.quoteNotes.trim()) {
      formData.append('description', this.quoteNotes.trim());
    }

    // Append images with key 'images[]' exactly as in Postman
    if (this.quoteFiles && this.quoteFiles.length > 0) {
      for (let i = 0; i < this.quoteFiles.length; i++) {
        formData.append('images[]', this.quoteFiles[i]);
      }
    }

    this.providerService.createServiceQuotation(formData).subscribe({
      next: (res: any) => this.handleQuoteSuccess(res, numPrice),
      error: (err: any) => this.handleQuoteError(err, numPrice)
    });
  }

  private handleQuoteSuccess(res: any, price: number): void {
    this.isSubmittingQuote = false;
    this.notificationService.show(res?.message || 'Quotation submitted successfully!', 'success');

    if (this.selectedRequestForQuote) {
      this.selectedRequestForQuote.quotation_submitted = true;
      this.selectedRequestForQuote.status = 'open';
      this.selectedRequestForQuote.my_quotation = {
        id: res?.data?.id || Date.now(),
        price: price,
        description: this.quoteNotes.trim(),
        notes: this.quoteNotes.trim(),
        submitted_at: new Date().toISOString(),
        status: 'Submitted'
      };
    }

    this.computeKpis();
    this.applyLocalFilters();
    this.closeQuoteModal();
  }

  private handleQuoteError(err: any, price: number): void {
    console.error('Quotation submission error:', err);
    this.isSubmittingQuote = false;
    let errorMsg = 'Failed to submit quotation. Please try again.';
    if (err?.error?.message) {
      errorMsg = err.error.message;
    } else if (err?.message) {
      errorMsg = err.message;
    } else if (err?.error?.error) {
      errorMsg = err.error.error;
    } else if (typeof err?.error === 'string') {
      errorMsg = err.error;
    }
    this.quoteErrorMessage = errorMsg;
    this.notificationService.show(errorMsg, 'error');
  }

  // ==========================================
  // VIEW DETAILS MODAL
  // ==========================================

  openDetailsModal(request: IncomingRequestItem): void {
    this.selectedRequestDetails = request;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedRequestDetails = null;
  }

  // ==========================================
  // LIGHTBOX
  // ==========================================

  openLightbox(imageUrl: string): void {
    this.lightboxImageUrl = imageUrl;
  }

  closeLightbox(): void {
    this.lightboxImageUrl = null;
  }

  // ==========================================
  // UI HELPERS
  // ==========================================

  getStatusBadgeClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'new') {
      return 'bg-amber-50 text-amber-600 border border-amber-200';
    }
    if (s === 'open') {
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    }
    if (s === 'closed' || s === 'complete') {
      return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
    return 'bg-red-50 text-red-600 border border-red-200';
  }

  getVehicleIconClass(category?: string): string {
    const c = (category || '').toLowerCase();
    if (c.includes('two') || c.includes('bike') || c.includes('scooter') || c.includes('motorcycle')) {
      return 'fa-solid fa-motorcycle text-red-500';
    }
    if (c.includes('four') || c.includes('car')) {
      return 'fa-solid fa-car text-blue-500';
    }
    if (c.includes('commercial') || c.includes('truck')) {
      return 'fa-solid fa-truck text-emerald-500';
    }
    return 'fa-solid fa-car text-blue-500';
  }

  getCategoryIconClass(type: string): string {
    if (type === 'spare_part_inquiry') {
      return 'fa-solid fa-gears text-amber-600';
    }
    return 'fa-solid fa-wrench text-[#db3333]';
  }

  getCategoryBadgeBg(type: string): string {
    if (type === 'spare_part_inquiry') {
      return 'bg-amber-50 border-amber-100';
    }
    return 'bg-red-50 border-red-100';
  }
}
