import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

export interface ResaleVehicleItem {
  id: string | number;
  vehicleBrand: string; // e.g. 'Hyundai'
  vehicleModel: string; // e.g. 'gdh56'
  manufacturingYear: string | number; // e.g. '2022'
  registrationNumber: string; // e.g. '344747'
  price: number; // e.g. 120.00
  fuelType: string; // e.g. 'Petrol'
  description?: string; // e.g. 'hxb'
  category?: string; // e.g. 'Two Wheeler', 'Four Wheeler', 'Commercial'
  images?: string[]; // Array of image URLs / base64 strings
  status?: 'Active' | 'Sold';
}

const STORAGE_KEY = 'garage_mandi_mock_resale_vehicles_v1';

const INITIAL_VEHICLES: ResaleVehicleItem[] = [
  {
    id: 1,
    vehicleBrand: 'Hyundai',
    vehicleModel: 'gdh56',
    manufacturingYear: 2022,
    registrationNumber: '344747',
    price: 120.00,
    fuelType: 'Petrol',
    description: 'Single owner, clean condition with regular authorized service record.',
    category: 'Two Wheeler',
    status: 'Active'
  },
  {
    id: 2,
    vehicleBrand: 'Honda',
    vehicleModel: 'Activa 6G DLX',
    manufacturingYear: 2023,
    registrationNumber: 'RJ-14-EA-8812',
    price: 68500.00,
    fuelType: 'Petrol',
    description: 'First owner, only 9,400 kms driven, scratchless condition with insurance.',
    category: 'Two Wheeler',
    status: 'Active'
  },
  {
    id: 3,
    vehicleBrand: 'Maruti Suzuki',
    vehicleModel: 'Swift ZXi+ Dual Tone',
    manufacturingYear: 2021,
    registrationNumber: 'RJ-14-CC-4091',
    price: 590000.00,
    fuelType: 'Petrol',
    description: 'Top end model, alloy wheels, touchscreen audio with Android Auto/Apple CarPlay.',
    category: 'Four Wheeler',
    status: 'Active'
  },
  {
    id: 4,
    vehicleBrand: 'Hyundai',
    vehicleModel: 'Creta SX (O) Diesel',
    manufacturingYear: 2022,
    registrationNumber: 'RJ-14-TB-5544',
    price: 1380000.00,
    fuelType: 'Diesel',
    description: 'Panoramic sunroof, ventilated leather seats, Bose premium audio system.',
    category: 'Four Wheeler',
    status: 'Active'
  },
  {
    id: 5,
    vehicleBrand: 'Royal Enfield',
    vehicleModel: 'Classic 350 Reborn',
    manufacturingYear: 2022,
    registrationNumber: 'RJ-07-SE-1982',
    price: 175000.00,
    fuelType: 'Petrol',
    description: 'Dual channel ABS, Halcyon Green, all original touring accessories installed.',
    category: 'Two Wheeler',
    status: 'Active'
  },
  {
    id: 6,
    vehicleBrand: 'Tata Motors',
    vehicleModel: 'Ace Gold Petrol Plus',
    manufacturingYear: 2023,
    registrationNumber: 'RJ-14-GA-1122',
    price: 360000.00,
    fuelType: 'Petrol',
    description: 'Commercial loading vehicle, high mileage, certified fitness certificate and state permit.',
    category: 'Commercial Vehicle',
    status: 'Active'
  }
];

@Component({
  selector: 'app-resale-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './resale-vehicles.component.html',
  styleUrl: './resale-vehicles.component.scss'
})
export class ResaleVehiclesComponent implements OnInit {
  isLoading = false;
  isRefreshing = false;

  // Vehicles Data
  vehicles: ResaleVehicleItem[] = [];
  filteredVehicles: ResaleVehicleItem[] = [];
  pagedVehicles: ResaleVehicleItem[] = [];

  // Filter & Search
  searchQuery = '';
  selectedCategory = 'all';

  // Pagination State
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;

  // KPIs
  kpis = {
    total: 0,
    petrol: 0,
    diesel: 0,
    totalValue: 0
  };

  // Open 3-Dots Dropdown menu tracker
  activeMenuId: string | number | null = null;

  // ==========================================
  // ADD / EDIT MODAL STATE
  // ==========================================
  isFormModalOpen = false;
  isEditing = false;
  editingId: string | number | null = null;

  formData: ResaleVehicleItem = {
    id: '',
    vehicleBrand: '',
    vehicleModel: '',
    manufacturingYear: new Date().getFullYear(),
    registrationNumber: '',
    price: 0,
    fuelType: 'Petrol',
    description: '',
    category: 'Four Wheeler',
    images: []
  };

  selectedImages: string[] = [];

  // ==========================================
  // DELETE CONFIRMATION MODAL STATE
  // ==========================================
  isDeleteModalOpen = false;
  vehicleToDelete: ResaleVehicleItem | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  // ==========================================
  // DATA MANAGEMENT
  // ==========================================

  loadVehicles(isRefresh = false): void {
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
        this.vehicles = stored;
      } else {
        this.vehicles = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
        this.persistVehicles();
      }

      this.computeKpis();
      this.applyFilter(true);

      if (isRefresh) {
        this.notificationService.show('Resale vehicles refreshed successfully.', 'success');
      }
    }, isRefresh ? 350 : 200);
  }

  private persistVehicles(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.vehicles));
      } catch (_) {}
    }
  }

  computeKpis(): void {
    this.kpis.total = this.vehicles.length;
    this.kpis.petrol = this.vehicles.filter(v => (v.fuelType || '').toLowerCase() === 'petrol').length;
    this.kpis.diesel = this.vehicles.filter(v => (v.fuelType || '').toLowerCase() === 'diesel').length;
    this.kpis.totalValue = this.vehicles.reduce((sum, v) => sum + (Number(v.price) || 0), 0);
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

    let result = [...this.vehicles];

    if (this.selectedCategory !== 'all') {
      result = result.filter(v => (v.category || '').toLowerCase().replace(/\s+/g, '_') === this.selectedCategory.toLowerCase());
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(item =>
        item.vehicleModel.toLowerCase().includes(q) ||
        item.vehicleBrand.toLowerCase().includes(q) ||
        item.registrationNumber.toLowerCase().includes(q) ||
        (item.fuelType && item.fuelType.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    this.filteredVehicles = result;
    this.updatePagination();
  }

  // ==========================================
  // PAGINATION
  // ==========================================

  get totalRecords(): number {
    return this.filteredVehicles.length;
  }

  get startIndex(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredVehicles.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedVehicles = this.filteredVehicles.slice(start, end);
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
  // ACTION MENU (3-Dots Dropdown)
  // ==========================================

  toggleMenu(id: string | number, event: Event): void {
    event.stopPropagation();
    if (this.activeMenuId === id) {
      this.activeMenuId = null;
    } else {
      this.activeMenuId = id;
    }
  }

  closeMenu(): void {
    this.activeMenuId = null;
  }

  // ==========================================
  // ADD & EDIT VEHICLE LOGIC
  // ==========================================

  openAddModal(): void {
    this.closeMenu();
    this.isEditing = false;
    this.editingId = null;
    this.selectedImages = [];
    this.formData = {
      id: '',
      vehicleBrand: '',
      vehicleModel: '',
      manufacturingYear: new Date().getFullYear(),
      registrationNumber: '',
      price: null as any,
      fuelType: 'Petrol',
      description: '',
      category: 'Four Wheeler',
      images: []
    };
    this.isFormModalOpen = true;
  }

  openEditModal(vehicle: ResaleVehicleItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.closeMenu();
    this.isEditing = true;
    this.editingId = vehicle.id;
    this.formData = JSON.parse(JSON.stringify(vehicle));
    this.selectedImages = vehicle.images ? [...vehicle.images] : [];
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.isEditing = false;
    this.editingId = null;
    this.selectedImages = [];
  }

  onImageSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
      this.notificationService.show(`${files.length} image(s) selected.`, 'info');
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  saveVehicle(): void {
    // Basic Form Validation
    if (!this.formData.vehicleBrand || !this.formData.vehicleBrand.trim()) {
      this.notificationService.show('Please enter the vehicle brand.', 'error');
      return;
    }
    if (!this.formData.vehicleModel || !this.formData.vehicleModel.trim()) {
      this.notificationService.show('Please enter the vehicle model.', 'error');
      return;
    }
    if (!this.formData.registrationNumber || !this.formData.registrationNumber.trim()) {
      this.notificationService.show('Please enter the registration number.', 'error');
      return;
    }
    if (!this.formData.price || Number(this.formData.price) <= 0) {
      this.notificationService.show('Please enter a valid price.', 'error');
      return;
    }

    this.formData.images = [...this.selectedImages];

    if (this.isEditing && this.editingId !== null) {
      // UPDATE Existing
      const idx = this.vehicles.findIndex(v => v.id === this.editingId);
      if (idx !== -1) {
        this.vehicles[idx] = {
          ...this.formData,
          id: this.editingId,
          price: Number(this.formData.price)
        };
        this.notificationService.show(`Vehicle ${this.formData.vehicleModel} updated successfully!`, 'success');
      }
    } else {
      // CREATE New
      const newVehicle: ResaleVehicleItem = {
        ...this.formData,
        id: Date.now(),
        price: Number(this.formData.price),
        status: 'Active'
      };
      this.vehicles.unshift(newVehicle);
      this.notificationService.show(`Vehicle ${newVehicle.vehicleModel} added successfully!`, 'success');
    }

    this.persistVehicles();
    this.computeKpis();
    this.applyFilter(true);
    this.closeFormModal();
  }

  // ==========================================
  // DELETE VEHICLE LOGIC
  // ==========================================

  openDeleteModal(vehicle: ResaleVehicleItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.closeMenu();
    this.vehicleToDelete = vehicle;
    this.isDeleteModalOpen = true;
  }

  cancelDelete(): void {
    this.isDeleteModalOpen = false;
    this.vehicleToDelete = null;
  }

  confirmDelete(): void {
    if (!this.vehicleToDelete) return;

    const id = this.vehicleToDelete.id;
    const model = this.vehicleToDelete.vehicleModel;

    this.vehicles = this.vehicles.filter(v => v.id !== id);
    this.persistVehicles();
    this.computeKpis();
    this.applyFilter();

    this.notificationService.show(`Vehicle ${model} has been deleted.`, 'info');
    this.isDeleteModalOpen = false;
    this.vehicleToDelete = null;
  }

  resetMockData(): void {
    this.vehicles = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
    this.persistVehicles();
    this.computeKpis();
    this.applyFilter(true);
    this.notificationService.show('Resale vehicles reset to initial mock data.', 'info');
  }
}
