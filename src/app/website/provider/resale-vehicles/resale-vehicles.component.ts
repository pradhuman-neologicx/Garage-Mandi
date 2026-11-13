import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NotificationService } from 'src/app/core/services/notificationnew.service';
import { ProviderService } from 'src/app/core/services/provider.service';

export interface ResaleVehicleItem {
  id: string | number;
  vehicle_category_id?: number | string | null;
  brand_id?: number | string | null;
  vehicleBrand: string; // e.g. 'Hyundai'
  vehicleModel: string; // e.g. 'gdh56'
  vehicle_model?: string;
  manufacturingYear: string | number; // e.g. '2022'
  manufacturing_year?: string | number;
  registrationNumber: string; // e.g. '344747'
  registration_number?: string;
  price: number; // e.g. 120.00
  fuelType: string; // e.g. 'Petrol'
  fuel_type_id?: number | string | null;
  description?: string;
  category?: string; // e.g. 'Two Wheeler', 'Four Wheeler'
  images?: any[]; // Array of image objects or URLs
  thumbnail?: string;
  status?: 'Active' | 'Inactive' | 'Sold';
  raw?: any;
}

export interface VehicleFormData {
  id: string | number;
  vehicle_category_id: number | string | null;
  brand_id: number | string | null;
  vehicle_model: string;
  manufacturing_year: number | string;
  registration_number: string;
  price: number | null;
  fuel_type_id: number | string | null;
  description: string;
}

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
  isSaving = false;
  isDeleting = false;
  isDeletingImageId: number | string | null = null;

  // Vehicles Data
  vehicles: ResaleVehicleItem[] = [];
  filteredVehicles: ResaleVehicleItem[] = [];
  pagedVehicles: ResaleVehicleItem[] = [];

  // Filter & Search
  searchQuery = '';
  appliedSearch = '';
  selectedCategory: string | number = 'all';

  // Pagination State (default per_page: 10)
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 1;
  pagination: any = null;

  // Dropdown Master Data
  categories: any[] = [];
  availableBrands: any[] = [];
  fuelTypes: any[] = [];
  isLoadingBrands = false;

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
  // VIEW VEHICLE MODAL STATE
  // ==========================================
  isViewModalOpen = false;
  isLoadingDetails = false;
  selectedVehicle: ResaleVehicleItem | null = null;
  selectedPreviewImage = '';

  // ==========================================
  // ADD / EDIT MODAL STATE
  // ==========================================
  isFormModalOpen = false;
  isEditing = false;
  editingId: string | number | null = null;

  formData: VehicleFormData = {
    id: '',
    vehicle_category_id: null,
    brand_id: null,
    vehicle_model: '',
    manufacturing_year: new Date().getFullYear(),
    registration_number: '',
    price: null,
    fuel_type_id: null,
    description: ''
  };

  existingImages: any[] = [];
  pendingFiles: File[] = [];
  pendingPreviews: { file: File; previewUrl: string }[] = [];

  // ==========================================
  // DELETE CONFIRMATION MODAL STATE
  // ==========================================
  isDeleteModalOpen = false;
  vehicleToDelete: ResaleVehicleItem | null = null;

  constructor(
    private providerService: ProviderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadFuelTypes();
    this.loadVehicles();
  }

  // ==========================================
  // MASTER DATA LOADERS
  // ==========================================

  loadCategories(): void {
    this.providerService.getPublicVehicleCategories().subscribe({
      next: (res: any) => {
        let list: any[] = [];
        if (res && res.data) {
          list = Array.isArray(res.data) ? res.data : (res.data.items || res.data.data || []);
        } else if (Array.isArray(res)) {
          list = res;
        }
        this.categories = list;
      },
      error: (err: any) => {
        console.error('Failed to load vehicle categories from public API:', err);
        this.categories = [];
      }
    });
  }

  loadFuelTypes(): void {
    this.providerService.getFuelTypes().subscribe({
      next: (res: any) => {
        let list: any[] = [];
        if (res && res.data) {
          list = Array.isArray(res.data) ? res.data : (res.data.items || res.data.data || []);
        } else if (Array.isArray(res)) {
          list = res;
        }
        this.fuelTypes = list;
      },
      error: (err: any) => {
        console.error('Failed to load fuel types from public API:', err);
        this.fuelTypes = [];
      }
    });
  }

  onCategoryChange(categoryId: any): void {
    this.formData.brand_id = null;
    this.loadBrands(categoryId);
  }

  loadBrands(categoryId?: any): void {
    this.isLoadingBrands = true;
    this.providerService.getPublicVehicleMakers(categoryId).subscribe({
      next: (res: any) => {
        this.isLoadingBrands = false;
        let list: any[] = [];
        if (res && res.data) {
          list = Array.isArray(res.data) ? res.data : (res.data.items || res.data.data || []);
        } else if (Array.isArray(res)) {
          list = res;
        }
        this.availableBrands = list;
      },
      error: (err: any) => {
        this.isLoadingBrands = false;
        console.error('Failed to load vehicle makers/brands from public API:', err);
        this.availableBrands = [];
      }
    });
  }

  // ==========================================
  // RESALE VEHICLES DATA MANAGEMENT
  // ==========================================

  loadVehicles(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }

    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (this.appliedSearch && this.appliedSearch.trim()) {
      params.search = this.appliedSearch.trim();
    }

    if (this.selectedCategory !== 'all') {
      params.vehicle_category_id = this.selectedCategory;
    }

    this.providerService.getResaleVehicles(params).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.isRefreshing = false;

        let items: any[] = [];
        if (res && res.data) {
          items = Array.isArray(res.data) ? res.data : (res.data.data || []);
        } else if (Array.isArray(res)) {
          items = res;
        }

        this.vehicles = items.map(item => this.mapApiVehicle(item));

        // Update pagination if returned by backend
        if (res && res.pagination) {
          this.pagination = res.pagination;
          this.totalRecords = Number(res.pagination.total !== undefined ? res.pagination.total : this.vehicles.length);
          this.totalPages = Number(res.pagination.last_page || Math.max(1, Math.ceil(this.totalRecords / this.pageSize)));
          this.currentPage = Number(res.pagination.current_page || 1);
          this.filteredVehicles = [...this.vehicles];
          this.pagedVehicles = [...this.vehicles];
        } else {
          this.pagination = null;
          this.applyFilter(false);
        }

        this.computeKpis();

        if (isRefresh) {
          this.notificationService.show('Resale vehicles refreshed successfully.', 'success');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.isRefreshing = false;
        console.error('Error fetching resale vehicles:', err);
        const msg = err?.error?.message || err?.message || 'Failed to load resale vehicles.';
        this.notificationService.show(msg, 'error');
      }
    });
  }

  private mapApiVehicle(item: any): ResaleVehicleItem {
    const images: any[] = Array.isArray(item.images) ? item.images : [];
    const brandName = item.brand?.name || item.maker?.name || item.vehicle_brand || item.vehicleBrand || '';
    const fuelName = item.fuel_type?.name || item.fuelType || '';
    const categoryName = item.vehicle_category?.name || item.category || '';

    let thumbnail = '';
    if (images.length > 0) {
      thumbnail = images[0]?.file_url || images[0]?.url || (typeof images[0] === 'string' ? images[0] : '');
    }

    const categoryId = item.vehicle_category?.id != null
      ? Number(item.vehicle_category.id)
      : (item.vehicle_category_id != null ? Number(item.vehicle_category_id) : null);

    const brandId = item.brand?.id != null
      ? Number(item.brand.id)
      : (item.brand_id != null ? Number(item.brand_id) : null);

    const fuelTypeId = item.fuel_type?.id != null
      ? Number(item.fuel_type.id)
      : (item.fuel_type_id != null ? Number(item.fuel_type_id) : null);

    const isActive = item.is_active === 1 || item.is_active === '1' || item.is_active === true;

    return {
      id: item.id,
      vehicle_category_id: categoryId,
      category: categoryName,
      brand_id: brandId,
      vehicleBrand: brandName,
      vehicle_model: item.vehicle_model || item.vehicleModel || '',
      vehicleModel: item.vehicle_model || item.vehicleModel || '',
      manufacturing_year: item.manufacturing_year || item.manufacturingYear || '',
      manufacturingYear: item.manufacturing_year || item.manufacturingYear || '',
      registration_number: item.registration_number || item.registrationNumber || '',
      registrationNumber: item.registration_number || item.registrationNumber || '',
      price: Number(item.price) || 0,
      fuel_type_id: fuelTypeId,
      fuelType: fuelName,
      description: item.description || '',
      images: images,
      thumbnail: thumbnail,
      status: isActive ? 'Active' : 'Inactive',
      raw: item
    };
  }

  computeKpis(): void {
    this.kpis.total = this.vehicles.length;
    this.kpis.petrol = this.vehicles.filter(v => (v.fuelType || '').toLowerCase().includes('petrol')).length;
    this.kpis.diesel = this.vehicles.filter(v => (v.fuelType || '').toLowerCase().includes('diesel')).length;
    this.kpis.totalValue = this.vehicles.reduce((sum, v) => sum + (Number(v.price) || 0), 0);
  }

  // ==========================================
  // FILTER & SEARCH
  // ==========================================

  setCategory(cat: string | number): void {
    this.selectedCategory = cat;
    this.loadVehicles();
  }

  onSearch(): void {
    this.appliedSearch = (this.searchQuery || '').trim();
    this.currentPage = 1;
    this.loadVehicles();
  }

  onResetSearch(): void {
    this.searchQuery = '';
    this.appliedSearch = '';
    this.currentPage = 1;
    this.loadVehicles();
  }

  applyFilter(resetPage = false): void {
    if (resetPage) {
      this.currentPage = 1;
    }

    let result = [...this.vehicles];

    if (this.selectedCategory !== 'all') {
      const catStr = String(this.selectedCategory).toLowerCase();
      result = result.filter(v => {
        if (v.vehicle_category_id !== null && v.vehicle_category_id !== undefined) {
          return String(v.vehicle_category_id) === catStr;
        }
        return (v.category || '').toLowerCase().replace(/\s+/g, '_') === catStr;
      });
    }

    if (this.appliedSearch && this.appliedSearch.trim()) {
      const q = this.appliedSearch.trim().toLowerCase();
      result = result.filter(item =>
        item.vehicleModel.toLowerCase().includes(q) ||
        item.vehicleBrand.toLowerCase().includes(q) ||
        item.registrationNumber.toLowerCase().includes(q) ||
        (item.fuelType && item.fuelType.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    this.filteredVehicles = result;
    this.totalRecords = result.length;
    this.updatePagination();
  }

  // ==========================================
  // PAGINATION
  // ==========================================

  get startIndex(): number {
    if (this.totalRecords === 0) return 0;
    if (this.pagination && this.pagination.from != null) {
      return Number(this.pagination.from);
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    if (this.totalRecords === 0) return 0;
    if (this.pagination && this.pagination.to != null) {
      return Number(this.pagination.to);
    }
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
    this.loadVehicles();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  }

  onPageSizeChange(newSize: any): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.loadVehicles();
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

    const defaultCategory = this.categories.length > 0 ? this.categories[0].id : null;
    const defaultFuel = this.fuelTypes.length > 0 ? this.fuelTypes[0].id : null;

    this.formData = {
      id: '',
      vehicle_category_id: defaultCategory,
      brand_id: null,
      vehicle_model: '',
      manufacturing_year: new Date().getFullYear(),
      registration_number: '',
      price: null,
      fuel_type_id: defaultFuel,
      description: ''
    };

    if (defaultCategory) {
      this.loadBrands(defaultCategory);
    } else {
      this.availableBrands = [];
    }

    this.existingImages = [];
    this.clearPendingImages();
    this.isFormModalOpen = true;
  }

  openEditModal(vehicle: ResaleVehicleItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.closeMenu();
    this.isEditing = true;
    this.editingId = vehicle.id;

    this.formData = {
      id: vehicle.id,
      vehicle_category_id: vehicle.vehicle_category_id || null,
      brand_id: vehicle.brand_id || null,
      vehicle_model: vehicle.vehicle_model || vehicle.vehicleModel || '',
      manufacturing_year: vehicle.manufacturing_year || vehicle.manufacturingYear || new Date().getFullYear(),
      registration_number: vehicle.registration_number || vehicle.registrationNumber || '',
      price: vehicle.price || null,
      fuel_type_id: vehicle.fuel_type_id || null,
      description: vehicle.description || ''
    };

    // Pre-populate availableBrands with current vehicle brand so dropdown selects immediately
    if (vehicle.brand_id && vehicle.vehicleBrand) {
      this.availableBrands = [{ id: vehicle.brand_id, name: vehicle.vehicleBrand }];
    }

    // Load available brands for selected category
    if (this.formData.vehicle_category_id) {
      this.loadBrands(this.formData.vehicle_category_id);
    } else {
      this.loadBrands();
    }

    this.existingImages = Array.isArray(vehicle.images) ? [...vehicle.images] : [];
    this.clearPendingImages();
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.isEditing = false;
    this.editingId = null;
    this.clearPendingImages();
    this.existingImages = [];
  }

  clearPendingImages(): void {
    if (this.pendingPreviews && this.pendingPreviews.length > 0) {
      this.pendingPreviews.forEach(p => {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      });
    }
    this.pendingPreviews = [];
    this.pendingFiles = [];
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.pendingFiles.push(file);
        const previewUrl = URL.createObjectURL(file);
        this.pendingPreviews.push({ file, previewUrl });
      }
      this.notificationService.show(`${files.length} image(s) queued for upload.`, 'info');
    }
    event.target.value = '';
  }

  removePendingImage(index: number): void {
    if (index >= 0 && index < this.pendingPreviews.length) {
      const preview = this.pendingPreviews[index];
      if (preview && preview.previewUrl) {
        URL.revokeObjectURL(preview.previewUrl);
      }
      this.pendingPreviews.splice(index, 1);
      this.pendingFiles.splice(index, 1);
    }
  }

  deleteExistingImage(img: any, index: number): void {
    if (!img || !img.id) {
      this.existingImages.splice(index, 1);
      return;
    }

    this.isDeletingImageId = img.id;
    this.providerService.deleteResaleVehicleImage(img.id).subscribe({
      next: (res: any) => {
        this.isDeletingImageId = null;
        this.existingImages.splice(index, 1);
        if (this.editingId) {
          const v = this.vehicles.find(veh => veh.id === this.editingId);
          if (v && Array.isArray(v.images)) {
            v.images = v.images.filter((i: any) => i.id !== img.id);
            v.thumbnail = v.images.length > 0 ? (v.images[0]?.file_url || v.images[0]?.url || '') : '';
          }
        }
        this.notificationService.show(res?.message || 'Image removed from gallery.', 'success');
      },
      error: (err: any) => {
        this.isDeletingImageId = null;
        console.error('Error deleting vehicle image:', err);
        const msg = err?.error?.message || err?.message || 'Failed to delete image.';
        // this.notificationService.show(msg, 'error');
      }
    });
  }

  saveVehicle(): void {
    // Form Validation
    if (!this.formData.vehicle_category_id) {
      this.notificationService.show('Please select a vehicle category.', 'error');
      return;
    }
    if (!this.formData.brand_id) {
      this.notificationService.show('Please select a vehicle brand / maker.', 'error');
      return;
    }
    if (!this.formData.vehicle_model || !this.formData.vehicle_model.trim()) {
      this.notificationService.show('Please enter the vehicle model.', 'error');
      return;
    }
    if (!this.formData.manufacturing_year) {
      this.notificationService.show('Please enter the manufacturing year.', 'error');
      return;
    }
    if (!this.formData.fuel_type_id) {
      this.notificationService.show('Please select a fuel type.', 'error');
      return;
    }
    if (!this.formData.registration_number || !this.formData.registration_number.trim()) {
      this.notificationService.show('Please enter the registration number.', 'error');
      return;
    }
    if (!this.formData.price || Number(this.formData.price) <= 0) {
      this.notificationService.show('Please enter a valid price.', 'error');
      return;
    }

    this.isSaving = true;

    // Build multipart/form-data payload according to Postman contract
    const fd = new FormData();
    fd.append('vehicle_category_id', String(this.formData.vehicle_category_id));
    fd.append('brand_id', String(this.formData.brand_id));
    fd.append('vehicle_model', this.formData.vehicle_model.trim());
    fd.append('manufacturing_year', String(this.formData.manufacturing_year));
    fd.append('registration_number', this.formData.registration_number.trim().toUpperCase());
    fd.append('price', String(this.formData.price));
    fd.append('fuel_type_id', String(this.formData.fuel_type_id));

    if (this.formData.description) {
      fd.append('description', this.formData.description.trim());
    }

    // ID parameter (only sent when updating existing listing)
    if (this.isEditing && this.editingId) {
      fd.append('id', String(this.editingId));
    }

    // Images array
    if (this.pendingFiles && this.pendingFiles.length > 0) {
      this.pendingFiles.forEach(file => {
        fd.append('images[]', file, file.name);
      });
    }

    this.providerService.saveResaleVehicle(fd).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        const actionMsg = this.isEditing ? 'updated' : 'added';
        this.notificationService.show(res?.message || `Vehicle ${actionMsg} successfully!`, 'success');
        this.closeFormModal();
        this.loadVehicles();
      },
      error: (err: any) => {
        this.isSaving = false;
        console.error('Error saving vehicle:', err);
        const msg = err?.error?.message || err?.message || 'Failed to save vehicle. Please check required fields.';
        // this.notificationService.show(msg, 'error');
      }
    });
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
    this.isDeleting = true;

    this.providerService.deleteResaleVehicle(id).subscribe({
      next: (res: any) => {
        this.isDeleting = false;
        this.isDeleteModalOpen = false;
        this.vehicleToDelete = null;
        this.notificationService.show(res?.message || `Vehicle ${model} has been deleted.`, 'success');
        this.loadVehicles();
      },
      error: (err: any) => {
        this.isDeleting = false;
        console.error('Error deleting vehicle:', err);
        const msg = err?.error?.message || err?.message || 'Failed to delete vehicle.';
        this.notificationService.show(msg, 'error');
      }
    });
  }

  // ==========================================
  // VIEW VEHICLE DETAILS LOGIC (BY ID)
  // ==========================================

  openViewModal(vehicle: ResaleVehicleItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.closeMenu();
    this.selectedVehicle = vehicle;
    this.selectedPreviewImage = vehicle.thumbnail || (vehicle.images && vehicle.images.length > 0 ? (vehicle.images[0]?.file_url || vehicle.images[0]?.url || '') : '');
    this.isViewModalOpen = true;
    this.isLoadingDetails = true;

    // Call API by ID to fetch full vehicle details
    this.providerService.getResaleVehicleById(vehicle.id).subscribe({
      next: (res: any) => {
        this.isLoadingDetails = false;
        const data = res?.data || res;
        if (data) {
          const mapped = this.mapApiVehicle(data);
          this.selectedVehicle = mapped;
          if (mapped.images && mapped.images.length > 0) {
            this.selectedPreviewImage = mapped.images[0]?.file_url || mapped.images[0]?.url || this.selectedPreviewImage;
          }
        }
      },
      error: (err: any) => {
        this.isLoadingDetails = false;
        console.warn('Failed to fetch detailed vehicle info, displaying card data', err);
      }
    });
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.selectedVehicle = null;
    this.selectedPreviewImage = '';
  }

  selectPreviewImage(imgUrl: string): void {
    this.selectedPreviewImage = imgUrl;
  }

  openEditFromView(): void {
    if (!this.selectedVehicle) return;
    const v = this.selectedVehicle;
    this.closeViewModal();
    this.openEditModal(v);
  }
}
