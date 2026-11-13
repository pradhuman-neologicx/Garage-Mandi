import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NotificationService } from 'src/app/core/services/notificationnew.service';
import { ProviderService } from 'src/app/core/services/provider.service';

export type VehicleRequestStatus = 'CONTACTED' | 'PENDING';
export type FilterTab = 'all' | 'pending' | 'contacted';

export interface CustomerVehicleRequestItem {
  id: string | number;
  // Vehicle Info
  vehicleId?: string | number;
  vehicleName: string;
  brand: string;
  model: string;
  vehicleCategory: string;
  manufacturingYear: string | number;
  fuelType: string;
  registrationNumber: string;
  price: number;
  vehicleDescription?: string;
  vehicleImage?: string;

  // Customer Info
  customerId?: string | number;
  customerName: string;
  customerInitial: string;
  customerPhone: string;
  customerEmail: string;
  interestDate: string;

  // Status
  status: VehicleRequestStatus;
  raw?: any;
}

@Component({
  selector: 'app-custome-vehicle-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './custome-vehicle-requests.component.html',
  styleUrl: './custome-vehicle-requests.component.scss'
})
export class CustomeVehicleRequestsComponent implements OnInit {
  isLoading = false;
  isRefreshing = false;
  isMarkingContacted = false;

  // Requests Data
  requests: CustomerVehicleRequestItem[] = [];
  filteredRequests: CustomerVehicleRequestItem[] = [];
  pagedRequests: CustomerVehicleRequestItem[] = [];

  // Filter & Search
  activeTab: FilterTab = 'all';
  searchQuery = '';

  // Pagination State
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;

  // KPIs (matching top stats card: Total, Pending, Contacted)
  kpis = {
    total: 0,
    pending: 0,
    contacted: 0
  };

  // Details Modal State ("Interest Details")
  isDetailsModalOpen = false;
  isLoadingDetails = false;
  selectedRequest: CustomerVehicleRequestItem | null = null;

  constructor(
    private notificationService: NotificationService,
    private providerService: ProviderService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  // ==========================================
  // DATA MANAGEMENT (DYNAMIC API)
  // ==========================================

  loadRequests(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }

    this.providerService.getVehicleResellRequests().subscribe({
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

        this.requests = rawList.map(item => this.mapApiItemToRequest(item));

        // Update KPIs from API summary if provided, otherwise compute from list
        const summary = res?.summary || res?.data?.summary;
        if (summary) {
          this.kpis = {
            total: Number(summary.total) || this.requests.length,
            pending: Number(summary.pending) || this.requests.filter(r => r.status === 'PENDING').length,
            contacted: Number(summary.contacted) || this.requests.filter(r => r.status === 'CONTACTED').length
          };
        } else {
          this.computeKpis();
        }

        this.applyFilter(true);

        if (isRefresh) {
          this.notificationService.show('Customer vehicle requests refreshed.', 'success');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.isRefreshing = false;
        this.requests = [];
        this.filteredRequests = [];
        this.pagedRequests = [];
        this.computeKpis();
        const errMsg = err?.error?.message || err?.message || 'Failed to load customer vehicle requests.';
        this.notificationService.show(errMsg, 'error');
      }
    });
  }

  private mapApiItemToRequest(item: any): CustomerVehicleRequestItem {
    const v = item?.vehicle || {};
    const brandName = (v.brand?.name || v.brand || '').trim();
    const modelName = (v.vehicle_model || v.model || '').trim();

    let vehicleName = '';
    if (brandName && modelName) {
      if (modelName.toLowerCase().startsWith(brandName.toLowerCase())) {
        vehicleName = modelName;
      } else {
        vehicleName = `${brandName} ${modelName}`;
      }
    } else {
      vehicleName = brandName || modelName || v.name || 'Resale Vehicle';
    }

    const categoryName = v.vehicle_category?.name || v.vehicle_category || v.category?.name || 'N/A';
    const regNumber = v.registration_number || v.registrationNo || 'N/A';
    const price = Number(v.price) || 0;
    const year = v.manufacturing_year || v.year || 'N/A';
    const fuel = v.fuel_type?.name || v.fuel_type || 'N/A';
    const desc = v.description || item?.description || '';

    let imageUrl = '';
    if (Array.isArray(v.images) && v.images.length > 0) {
      imageUrl = v.images[0].file_url || v.images[0].url || v.images[0].file_path || '';
    } else if (v.image) {
      imageUrl = typeof v.image === 'string' ? v.image : (v.image.file_url || '');
    }

    // Customer resolution (supports nested customer/user/buyer or top-level properties)
    const c = item?.customer || item?.user || item?.buyer || {};
    const customerName = (c.name || item?.customer_name || item?.user_name || item?.name || 'Interested Buyer').trim();
    const customerPhone = c.phone_number || c.phone || c.mobile || item?.customer_phone || item?.phone_number || item?.phone || item?.mobile || 'Not provided';
    const customerEmail = c.email || item?.customer_email || item?.email || 'Not provided';
    const initial = (customerName.charAt(0) || 'B').toUpperCase();

    const rawStatus = (item?.status || 'pending').toString().toLowerCase();
    const status: VehicleRequestStatus = rawStatus === 'contacted' ? 'CONTACTED' : 'PENDING';

    return {
      id: item?.id,
      vehicleId: v.id,
      vehicleName: vehicleName || 'Resale Vehicle',
      brand: brandName || 'N/A',
      model: modelName || 'N/A',
      vehicleCategory: categoryName,
      manufacturingYear: year,
      fuelType: fuel,
      registrationNumber: regNumber,
      price: price,
      vehicleDescription: desc,
      vehicleImage: imageUrl,
      customerId: c.id,
      customerName: customerName,
      customerInitial: initial,
      customerPhone: customerPhone,
      customerEmail: customerEmail,
      interestDate: this.formatDate(item?.created_at),
      status: status,
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

  computeKpis(): void {
    this.kpis.total = this.requests.length;
    this.kpis.pending = this.requests.filter(r => r.status === 'PENDING').length;
    this.kpis.contacted = this.requests.filter(r => r.status === 'CONTACTED').length;
  }

  // ==========================================
  // FILTER & SEARCH
  // ==========================================

  setTab(tab: FilterTab): void {
    this.activeTab = tab;
    this.applyFilter(true);
  }

  onSearchChange(): void {
    this.applyFilter(true);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilter(true);
  }

  applyFilter(resetPage = false): void {
    if (resetPage) {
      this.currentPage = 1;
    }

    let result = [...this.requests];

    if (this.activeTab === 'pending') {
      result = result.filter(r => r.status === 'PENDING');
    } else if (this.activeTab === 'contacted') {
      result = result.filter(r => r.status === 'CONTACTED');
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(item =>
        item.vehicleName.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.registrationNumber.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.customerPhone.toLowerCase().includes(q) ||
        item.customerEmail.toLowerCase().includes(q) ||
        item.vehicleCategory.toLowerCase().includes(q)
      );
    }

    this.filteredRequests = result;
    this.updatePagination();
  }

  // ==========================================
  // PAGINATION
  // ==========================================

  get totalRecords(): number {
    return this.filteredRequests.length;
  }

  get startIndex(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredRequests.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedRequests = this.filteredRequests.slice(start, end);
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

  // ==========================================
  // DETAILS MODAL ("Interest Details")
  // ==========================================

  openDetailsModal(req: CustomerVehicleRequestItem): void {
    this.selectedRequest = req;
    this.isDetailsModalOpen = true;
    this.isLoadingDetails = true;

    this.providerService.getVehicleResellRequestById(req.id).subscribe({
      next: (res: any) => {
        this.isLoadingDetails = false;
        const detailData = res?.data || res;
        if (detailData && typeof detailData === 'object') {
          const mapped = this.mapApiItemToRequest(detailData);
          // Preserve customer contact info if present in original request
          if ((!mapped.customerPhone || mapped.customerPhone === 'Not provided') && req.customerPhone !== 'Not provided') {
            mapped.customerPhone = req.customerPhone;
          }
          if ((!mapped.customerEmail || mapped.customerEmail === 'Not provided') && req.customerEmail !== 'Not provided') {
            mapped.customerEmail = req.customerEmail;
          }
          if (!mapped.vehicleImage && req.vehicleImage) {
            mapped.vehicleImage = req.vehicleImage;
          }
          this.selectedRequest = mapped;
        }
      },
      error: (_err: any) => {
        // Fallback: If request-specific view by ID fails or 404s, attempt fetching full vehicle details by vehicleId
        if (req.vehicleId) {
          this.providerService.getResaleVehicleById(req.vehicleId).subscribe({
            next: (vRes: any) => {
              this.isLoadingDetails = false;
              const vData = vRes?.data || vRes;
              if (vData && this.selectedRequest) {
                this.selectedRequest = {
                  ...this.selectedRequest,
                  ...this.mapApiItemToRequest({ ...(req.raw || {}), vehicle: vData })
                };
              }
            },
            error: () => {
              this.isLoadingDetails = false;
            }
          });
        } else {
          this.isLoadingDetails = false;
        }
      }
    });
    this.isLoadingDetails = true;

    this.providerService.getVehicleResellRequestById(req.id).subscribe({
      next: (res: any) => {
        this.isLoadingDetails = false;
        const detailData = res?.data || res;
        if (detailData && typeof detailData === 'object') {
          const mapped = this.mapApiItemToRequest(detailData);
          // Preserve customer contact info if present in original request
          if ((!mapped.customerPhone || mapped.customerPhone === 'Not provided') && req.customerPhone !== 'Not provided') {
            mapped.customerPhone = req.customerPhone;
          }
          if ((!mapped.customerEmail || mapped.customerEmail === 'Not provided') && req.customerEmail !== 'Not provided') {
            mapped.customerEmail = req.customerEmail;
          }
          this.selectedRequest = mapped;
        }
      },
      error: (_err: any) => {
        // Fallback: If request-specific view by ID fails or 404s, attempt fetching full vehicle details by vehicleId
        if (req.vehicleId) {
          this.providerService.getResaleVehicleById(req.vehicleId).subscribe({
            next: (vRes: any) => {
              this.isLoadingDetails = false;
              const vData = vRes?.data || vRes;
              if (vData && this.selectedRequest) {
                this.selectedRequest = {
                  ...this.selectedRequest,
                  ...this.mapApiItemToRequest({ ...(req.raw || {}), vehicle: vData })
                };
              }
            },
            error: () => {
              this.isLoadingDetails = false;
            }
          });
        } else {
          this.isLoadingDetails = false;
        }
      }
    });
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.isLoadingDetails = false;
    this.selectedRequest = null;
  }

  markAsContacted(req: CustomerVehicleRequestItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.isMarkingContacted) return;

    this.isMarkingContacted = true;
    this.providerService.markVehicleResellRequestContacted(req.id).subscribe({
      next: (res: any) => {
        this.isMarkingContacted = false;
        req.status = 'CONTACTED';
        const idx = this.requests.findIndex(r => r.id === req.id);
        if (idx !== -1) {
          this.requests[idx].status = 'CONTACTED';
        }

        if (this.selectedRequest && this.selectedRequest.id === req.id) {
          this.selectedRequest.status = 'CONTACTED';
        }

        // Adjust KPIs
        if (this.kpis.pending > 0) {
          this.kpis.pending--;
        }
        this.kpis.contacted++;

        this.applyFilter();
        const msg = res?.message || `Buyer interest for ${req.vehicleName} marked as Contacted.`;
        this.notificationService.show(msg, 'success');
      },
      error: (err: any) => {
        this.isMarkingContacted = false;
        const errMsg = err?.error?.message || err?.message || 'Failed to mark request as contacted.';
        this.notificationService.show(errMsg, 'error');
      }
    });
  }

  copyText(text: string, label = 'Copied'): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.notificationService.show(`${label} to clipboard!`, 'success');
    }
  }
}
