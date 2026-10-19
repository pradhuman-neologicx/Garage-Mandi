import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

export type VehicleRequestStatus = 'CONTACTED' | 'PENDING';
export type FilterTab = 'all' | 'pending' | 'contacted';

export interface CustomerVehicleRequestItem {
  id: string | number;
  // Vehicle Info
  vehicleName: string; // e.g. 'Hyundai gdh56'
  brand: string; // e.g. 'Hyundai'
  model: string; // e.g. 'gdh56'
  vehicleCategory: string; // e.g. 'Two Wheeler', 'Four Wheeler'
  manufacturingYear: string | number; // e.g. '2022'
  fuelType: string; // e.g. 'Petrol'
  registrationNumber: string; // e.g. '344747'
  price: number; // e.g. 120.00
  vehicleDescription?: string; // e.g. 'hxb'

  // Customer Info
  customerName: string; // e.g. 'ashi'
  customerInitial: string; // e.g. 'A'
  customerPhone: string; // e.g. '9632589653'
  customerEmail: string; // e.g. 'yashu1@yopmail.com'
  interestDate: string; // e.g. '02 Sep 2026'

  // Status
  status: VehicleRequestStatus; // 'CONTACTED' or 'PENDING'
}

const STORAGE_KEY = 'garage_mandi_mock_custome_vehicle_requests_v1';

const INITIAL_REQUESTS: CustomerVehicleRequestItem[] = [
  {
    id: 1,
    vehicleName: 'Hyundai gdh56',
    brand: 'Hyundai',
    model: 'gdh56',
    vehicleCategory: 'Two Wheeler',
    manufacturingYear: 2022,
    fuelType: 'Petrol',
    registrationNumber: '344747',
    price: 120.00,
    vehicleDescription: 'hxb',
    customerName: 'ashi',
    customerInitial: 'A',
    customerPhone: '9632589653',
    customerEmail: 'yashu1@yopmail.com',
    interestDate: '02 Sep 2026',
    status: 'CONTACTED'
  },
  {
    id: 2,
    vehicleName: 'Honda Activa 6G DLX',
    brand: 'Honda',
    model: 'Activa 6G',
    vehicleCategory: 'Two Wheeler',
    manufacturingYear: 2023,
    fuelType: 'Petrol',
    registrationNumber: 'RJ-14-EA-8812',
    price: 68500.00,
    vehicleDescription: 'Single owner, pristine showroom condition, only 9,400 kms driven, comprehensive insurance valid till Nov 2027.',
    customerName: 'Vikram Sharma',
    customerInitial: 'V',
    customerPhone: '9829012345',
    customerEmail: 'vikram.sharma@gmail.com',
    interestDate: '01 Sep 2026',
    status: 'PENDING'
  },
  {
    id: 3,
    vehicleName: 'Maruti Suzuki Swift ZXi+',
    brand: 'Maruti Suzuki',
    model: 'Swift ZXi+',
    vehicleCategory: 'Four Wheeler',
    manufacturingYear: 2021,
    fuelType: 'Petrol',
    registrationNumber: 'RJ-14-CC-4091',
    price: 590000.00,
    vehicleDescription: 'Top model with push button start, touchscreen infotainment, reverse camera, non-accidental certified vehicle.',
    customerName: 'Priya Meena',
    customerInitial: 'P',
    customerPhone: '9784098765',
    customerEmail: 'priya.meena@outlook.com',
    interestDate: '31 Aug 2026',
    status: 'CONTACTED'
  },
  {
    id: 4,
    vehicleName: 'Royal Enfield Classic 350 Reborn',
    brand: 'Royal Enfield',
    model: 'Classic 350',
    vehicleCategory: 'Two Wheeler',
    manufacturingYear: 2022,
    fuelType: 'Petrol',
    registrationNumber: 'RJ-07-SE-1982',
    price: 175000.00,
    vehicleDescription: 'Halcyon green color, dual channel ABS, original alloy wheels and backrest installed, complete service records available.',
    customerName: 'Manoj Rathore',
    customerInitial: 'M',
    customerPhone: '9414567812',
    customerEmail: 'rathore.manoj@yahoo.com',
    interestDate: '30 Aug 2026',
    status: 'PENDING'
  },
  {
    id: 5,
    vehicleName: 'Hyundai Creta SX (O) Turbo',
    brand: 'Hyundai',
    model: 'Creta SX (O)',
    vehicleCategory: 'Four Wheeler',
    manufacturingYear: 2022,
    fuelType: 'Diesel',
    registrationNumber: 'RJ-14-TB-5544',
    price: 1380000.00,
    vehicleDescription: 'Panoramic sunroof, ventilated front seats, Bose 8-speaker audio, brand new Michelin tyres.',
    customerName: 'Anil Agarwal',
    customerInitial: 'A',
    customerPhone: '9829988776',
    customerEmail: 'anil.agarwal@gmail.com',
    interestDate: '28 Aug 2026',
    status: 'CONTACTED'
  },
  {
    id: 6,
    vehicleName: 'Tata Ace Gold Petrol Plus',
    brand: 'Tata Motors',
    model: 'Ace Gold',
    vehicleCategory: 'Commercial Vehicle',
    manufacturingYear: 2023,
    fuelType: 'Petrol',
    registrationNumber: 'RJ-14-GA-1122',
    price: 360000.00,
    vehicleDescription: 'Commercial loading vehicle, high mileage, certified fitness certificate and valid state permit.',
    customerName: 'Deepak Verma',
    customerInitial: 'D',
    customerPhone: '9587034567',
    customerEmail: 'deepak.v@yopmail.com',
    interestDate: '26 Aug 2026',
    status: 'CONTACTED'
  }
];

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
  selectedRequest: CustomerVehicleRequestItem | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  // ==========================================
  // DATA MANAGEMENT
  // ==========================================

  loadRequests(isRefresh = false): void {
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
        this.requests = stored;
      } else {
        this.requests = JSON.parse(JSON.stringify(INITIAL_REQUESTS));
        this.persistRequests();
      }

      this.computeKpis();
      this.applyFilter(true);

      if (isRefresh) {
        this.notificationService.show('Customer vehicle requests refreshed.', 'success');
      }
    }, isRefresh ? 350 : 200);
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
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedRequest = null;
  }

  markAsContacted(req: CustomerVehicleRequestItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    req.status = 'CONTACTED';
    const idx = this.requests.findIndex(r => r.id === req.id);
    if (idx !== -1) {
      this.requests[idx].status = 'CONTACTED';
    }

    if (this.selectedRequest && this.selectedRequest.id === req.id) {
      this.selectedRequest.status = 'CONTACTED';
    }

    this.persistRequests();
    this.computeKpis();
    this.applyFilter();
    this.notificationService.show(`Buyer interest for ${req.vehicleName} marked as Contacted.`, 'success');
  }

  resetMockData(): void {
    this.requests = JSON.parse(JSON.stringify(INITIAL_REQUESTS));
    this.persistRequests();
    this.computeKpis();
    this.applyFilter(true);
    this.notificationService.show('Customer vehicle requests reset to initial mock data.', 'info');
  }

  copyText(text: string, label = 'Copied'): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.notificationService.show(`${label} to clipboard!`, 'success');
    }
  }
}
