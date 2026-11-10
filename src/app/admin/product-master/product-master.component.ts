import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EcomService } from '../../core/services/ecom.service';
import { NotificationService } from '../../core/services/notificationnew.service';

export interface DropdownOption {
  id: number;
  name?: string;
  title?: string;
  category_name?: string;
  maker_name?: string;
  brand_name?: string;
  spare_part_name?: string;
  sub_spare_part_name?: string;
  [key: string]: any;
}

export interface AdminProductItem {
  id: number;
  name: string;
  vehicle_category_id: number;
  vehicle_brand_id: number;
  spare_part_id: number;
  sub_spare_part_id: number;
  is_active: boolean;
  vehicle_category?: any;
  category?: any;
  vehicle_brand?: any;
  brand?: any;
  vehicle_maker?: any;
  maker?: any;
  spare_part?: any;
  spare_part_name?: string;
  sub_spare_part?: any;
  sub_spare_part_name?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-product-master',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './product-master.component.html',
  styleUrl: './product-master.component.scss'
})
export class ProductMasterComponent implements OnInit {
  isLoading: boolean = false;
  isSaving: boolean = false;
  togglingStatusId: number | null = null;

  // Products List
  products: AdminProductItem[] = [];

  // Pagination
  currentPage: number = 1;
  perPage: number = 20;
  totalItems: number = 0;
  lastPage: number = 1;

  // Filters
  searchQuery: string = '';
  appliedSearchQuery: string = '';
  filterCategoryId: string = 'all';
  filterBrandId: string = 'all';
  filterSparePartId: string = 'all';
  filterSubSparePartId: string = 'all';
  filterStatus: string = 'all'; // 'all' | '1' | '0'
  sortDirection: 'asc' | 'desc' = 'asc';

  // Dropdown options
  vehicleCategories: DropdownOption[] = [];
  isLoadingCategories: boolean = false;

  // Filter dropdown options (cascading)
  filterMakers: DropdownOption[] = [];
  filterSpareParts: DropdownOption[] = [];
  filterSubSpareParts: DropdownOption[] = [];
  isLoadingFilterMakers: boolean = false;
  isLoadingFilterSpareParts: boolean = false;
  isLoadingFilterSubSpareParts: boolean = false;

  // Modal dropdown options (cascading)
  modalMakers: DropdownOption[] = [];
  modalSpareParts: DropdownOption[] = [];
  modalSubSpareParts: DropdownOption[] = [];
  isLoadingModalMakers: boolean = false;
  isLoadingModalSpareParts: boolean = false;
  isLoadingModalSubSpareParts: boolean = false;

  // Modal State
  isModalOpen: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  editingProduct: AdminProductItem | null = null;
  productForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ecomService: EcomService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadProducts();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      vehicle_category_id: ['', [Validators.required]],
      vehicle_brand_id: ['', [Validators.required]],
      spare_part_id: ['', [Validators.required]],
      sub_spare_part_id: ['', [Validators.required]]
    });
  }

  // ==========================================================
  // 1. DROPDOWN OPTIONS LOADER
  // ==========================================================
  loadCategories(): void {
    this.isLoadingCategories = true;
    this.ecomService.getPublicVehicleCategories().subscribe({
      next: (res: any) => {
        this.isLoadingCategories = false;
        const list = res?.data || res || [];
        this.vehicleCategories = Array.isArray(list) ? list : (list?.items || []);
      },
      error: () => {
        this.isLoadingCategories = false;
      }
    });
  }

  // ==========================================================
  // 2. PRODUCT MASTER LISTING & FILTERS
  // ==========================================================
  loadProducts(): void {
    this.isLoading = true;
    const params: any = {
      page: this.currentPage,
      per_page: this.perPage,
      direction: this.sortDirection
    };

    if (this.appliedSearchQuery) {
      params.search = this.appliedSearchQuery;
    }

    if (this.filterCategoryId !== 'all') {
      params.vehicle_category_id = this.filterCategoryId;
    }

    if (this.filterBrandId !== 'all') {
      params.vehicle_brand_id = this.filterBrandId;
    }

    if (this.filterSparePartId !== 'all') {
      params.spare_part_id = this.filterSparePartId;
    }

    if (this.filterSubSparePartId !== 'all') {
      params.sub_spare_part_id = this.filterSubSparePartId;
    }

    if (this.filterStatus !== 'all') {
      params.is_active = this.filterStatus;
    }

    this.ecomService.getAdminProducts(params).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = res?.data || res;

        let list: any[] = [];
        if (Array.isArray(data?.items)) {
          list = data.items;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        } else if (Array.isArray(data)) {
          list = data;
        }

        this.products = list.map(item => ({
          id: item.id,
          name: item.name || '',
          vehicle_category_id: Number(item.vehicle_category_id || 0),
          vehicle_brand_id: Number(item.vehicle_brand_id || 0),
          spare_part_id: Number(item.spare_part_id || 0),
          sub_spare_part_id: Number(item.sub_spare_part_id || 0),
          is_active: Boolean(item.is_active),
          vehicle_category: item.vehicle_category || item.category,
          vehicle_brand: item.vehicle_brand || item.brand || item.vehicle_maker || item.maker,
          spare_part: item.spare_part,
          sub_spare_part: item.sub_spare_part,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));

        const pagination = data?.pagination || data?.meta;
        if (pagination) {
          this.totalItems = pagination.total ?? this.products.length;
          this.currentPage = pagination.current_page ?? this.currentPage;
          this.perPage = pagination.per_page ?? this.perPage;
          this.lastPage = pagination.last_page ?? (Math.ceil(this.totalItems / this.perPage) || 1);
        } else {
          this.totalItems = this.products.length;
          this.lastPage = 1;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.message || 'Failed to fetch products.';
        this.notificationService.show(msg, 'error', 3000);
      }
    });
  }

  onSearch(): void {
    this.appliedSearchQuery = this.searchQuery ? this.searchQuery.trim() : '';
    this.currentPage = 1;
    this.loadProducts();
  }

  onResetSearch(): void {
    this.searchQuery = '';
    this.appliedSearchQuery = '';
    this.filterCategoryId = 'all';
    this.filterBrandId = 'all';
    this.filterSparePartId = 'all';
    this.filterSubSparePartId = 'all';
    this.filterStatus = 'all';
    this.filterMakers = [];
    this.filterSpareParts = [];
    this.filterSubSpareParts = [];
    this.currentPage = 1;
    this.loadProducts();
  }

  onFilterCategoryChange(): void {
    this.filterBrandId = 'all';
    this.filterSparePartId = 'all';
    this.filterSubSparePartId = 'all';
    this.filterMakers = [];
    this.filterSpareParts = [];
    this.filterSubSpareParts = [];

    if (this.filterCategoryId !== 'all') {
      const catId = Number(this.filterCategoryId);
      // Fetch Makers
      this.isLoadingFilterMakers = true;
      this.ecomService.getPublicVehicleMakers(catId).subscribe({
        next: (res: any) => {
          this.isLoadingFilterMakers = false;
          const list = res?.data || res || [];
          this.filterMakers = Array.isArray(list) ? list : (list?.items || []);
        },
        error: () => { this.isLoadingFilterMakers = false; }
      });

      // Fetch Spare Parts
      this.isLoadingFilterSpareParts = true;
      this.ecomService.getPublicVehicleSpareParts(catId).subscribe({
        next: (res: any) => {
          this.isLoadingFilterSpareParts = false;
          const list = res?.data || res || [];
          this.filterSpareParts = Array.isArray(list) ? list : (list?.items || []);
        },
        error: () => { this.isLoadingFilterSpareParts = false; }
      });
    }

    this.currentPage = 1;
    this.loadProducts();
  }

  onFilterSparePartChange(): void {
    this.filterSubSparePartId = 'all';
    this.filterSubSpareParts = [];

    if (this.filterSparePartId !== 'all') {
      const partId = Number(this.filterSparePartId);
      this.isLoadingFilterSubSpareParts = true;
      this.ecomService.getPublicSubSpareParts(partId).subscribe({
        next: (res: any) => {
          this.isLoadingFilterSubSpareParts = false;
          const list = res?.data || res || [];
          this.filterSubSpareParts = Array.isArray(list) ? list : (list?.items || []);
        },
        error: () => { this.isLoadingFilterSubSpareParts = false; }
      });
    }

    this.currentPage = 1;
    this.loadProducts();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.currentPage = 1;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.lastPage || page === this.currentPage) return;
    this.currentPage = page;
    this.loadProducts();
  }

  get isFilterApplied(): boolean {
    return !!this.appliedSearchQuery ||
           this.filterCategoryId !== 'all' ||
           this.filterBrandId !== 'all' ||
           this.filterSparePartId !== 'all' ||
           this.filterSubSparePartId !== 'all' ||
           this.filterStatus !== 'all';
  }

  // ==========================================================
  // 3. MODAL ACTIONS: ADD / EDIT CASCADING
  // ==========================================================
  openAddModal(): void {
    this.modalMode = 'add';
    this.editingProduct = null;
    this.modalMakers = [];
    this.modalSpareParts = [];
    this.modalSubSpareParts = [];
    this.productForm.reset({
      name: '',
      vehicle_category_id: '',
      vehicle_brand_id: '',
      spare_part_id: '',
      sub_spare_part_id: ''
    });
    this.isModalOpen = true;
  }

  openEditModal(product: AdminProductItem): void {
    this.modalMode = 'edit';
    this.editingProduct = product;
    this.modalMakers = [];
    this.modalSpareParts = [];
    this.modalSubSpareParts = [];

    this.productForm.patchValue({
      name: product.name,
      vehicle_category_id: product.vehicle_category_id
    });

    const catId = product.vehicle_category_id;
    const partId = product.spare_part_id;

    if (catId) {
      this.isLoadingModalMakers = true;
      this.ecomService.getPublicVehicleMakers(catId).subscribe({
        next: (res: any) => {
          this.isLoadingModalMakers = false;
          const list = res?.data || res || [];
          this.modalMakers = Array.isArray(list) ? list : (list?.items || []);
          this.productForm.patchValue({ vehicle_brand_id: product.vehicle_brand_id });
        },
        error: () => { this.isLoadingModalMakers = false; }
      });

      this.isLoadingModalSpareParts = true;
      this.ecomService.getPublicVehicleSpareParts(catId).subscribe({
        next: (res: any) => {
          this.isLoadingModalSpareParts = false;
          const list = res?.data || res || [];
          this.modalSpareParts = Array.isArray(list) ? list : (list?.items || []);
          this.productForm.patchValue({ spare_part_id: product.spare_part_id });
        },
        error: () => { this.isLoadingModalSpareParts = false; }
      });
    }

    if (partId) {
      this.isLoadingModalSubSpareParts = true;
      this.ecomService.getPublicSubSpareParts(partId).subscribe({
        next: (res: any) => {
          this.isLoadingModalSubSpareParts = false;
          const list = res?.data || res || [];
          this.modalSubSpareParts = Array.isArray(list) ? list : (list?.items || []);
          this.productForm.patchValue({ sub_spare_part_id: product.sub_spare_part_id });
        },
        error: () => { this.isLoadingModalSubSpareParts = false; }
      });
    }

    this.isModalOpen = true;
  }

  onModalCategoryChange(): void {
    const catId = this.productForm.get('vehicle_category_id')?.value;
    this.productForm.patchValue({
      vehicle_brand_id: '',
      spare_part_id: '',
      sub_spare_part_id: ''
    });
    this.modalMakers = [];
    this.modalSpareParts = [];
    this.modalSubSpareParts = [];

    if (catId) {
      this.isLoadingModalMakers = true;
      this.ecomService.getPublicVehicleMakers(catId).subscribe({
        next: (res: any) => {
          this.isLoadingModalMakers = false;
          const list = res?.data || res || [];
          this.modalMakers = Array.isArray(list) ? list : (list?.items || []);
        },
        error: () => { this.isLoadingModalMakers = false; }
      });

      this.isLoadingModalSpareParts = true;
      this.ecomService.getPublicVehicleSpareParts(catId).subscribe({
        next: (res: any) => {
          this.isLoadingModalSpareParts = false;
          const list = res?.data || res || [];
          this.modalSpareParts = Array.isArray(list) ? list : (list?.items || []);
        },
        error: () => { this.isLoadingModalSpareParts = false; }
      });
    }
  }

  onModalSparePartChange(): void {
    const partId = this.productForm.get('spare_part_id')?.value;
    this.productForm.patchValue({
      sub_spare_part_id: ''
    });
    this.modalSubSpareParts = [];

    if (partId) {
      this.isLoadingModalSubSpareParts = true;
      this.ecomService.getPublicSubSpareParts(partId).subscribe({
        next: (res: any) => {
          this.isLoadingModalSubSpareParts = false;
          const list = res?.data || res || [];
          this.modalSubSpareParts = Array.isArray(list) ? list : (list?.items || []);
        },
        error: () => { this.isLoadingModalSubSpareParts = false; }
      });
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingProduct = null;
    this.isSaving = false;
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.notificationService.show('Please fill in all required fields.', 'error', 3000);
      return;
    }

    const val = this.productForm.value;
    const payload = {
      vehicle_category_id: Number(val.vehicle_category_id),
      vehicle_brand_id: Number(val.vehicle_brand_id),
      spare_part_id: Number(val.spare_part_id),
      sub_spare_part_id: Number(val.sub_spare_part_id),
      name: val.name.trim()
    };

    this.isSaving = true;

    if (this.modalMode === 'add') {
      this.ecomService.createAdminProduct(payload).subscribe({
        next: (res: any) => {
          this.isSaving = false;
          const msg = res?.message || 'Product created successfully!';
          this.notificationService.show(msg, 'success', 3000);
          this.closeModal();
          this.loadProducts();
        },
        error: (err: any) => {
          this.isSaving = false;
          const errMsg = err?.error?.message || err?.message || 'Failed to create product.';
          this.notificationService.show(errMsg, 'error', 3000);
        }
      });
    } else if (this.modalMode === 'edit' && this.editingProduct) {
      this.ecomService.updateAdminProduct(this.editingProduct.id, payload).subscribe({
        next: (res: any) => {
          this.isSaving = false;
          const msg = res?.message || 'Product updated successfully!';
          this.notificationService.show(msg, 'success', 3000);
          this.closeModal();
          this.loadProducts();
        },
        error: (err: any) => {
          this.isSaving = false;
          const errMsg = err?.error?.message || err?.message || 'Failed to update product.';
          this.notificationService.show(errMsg, 'error', 3000);
        }
      });
    }
  }

  // ==========================================================
  // 4. STATUS TOGGLE (PATCH API)
  // ==========================================================
  toggleStatus(product: AdminProductItem, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.togglingStatusId === product.id) return;

    const newStatus = !product.is_active;
    this.togglingStatusId = product.id;

    this.ecomService.changeAdminProductStatus(product.id, { is_active: newStatus }).subscribe({
      next: (res: any) => {
        this.togglingStatusId = null;
        product.is_active = newStatus;
        const msg = res?.message || `Product status updated to ${newStatus ? 'Active' : 'Inactive'}.`;
        this.notificationService.show(msg, 'success', 2500);
      },
      error: (err: any) => {
        this.togglingStatusId = null;
        const errMsg = err?.error?.message || err?.message || 'Failed to update status.';
        this.notificationService.show(errMsg, 'error', 3000);
      }
    });
  }

  // ==========================================================
  // 5. HELPER FORMATTERS
  // ==========================================================
  getOptionName(item: any): string {
    if (!item) return '';
    return item.name || item.title || item.category_name || item.maker_name || item.brand_name || item.spare_part_name || item.sub_spare_part_name || item.label || `Item #${item.id}`;
  }

  getCategoryName(product: AdminProductItem): string {
    const cat = product.vehicle_category || product.category;
    if (cat) return this.getOptionName(cat);
    const found = this.vehicleCategories.find(c => c.id === product.vehicle_category_id);
    if (found) return this.getOptionName(found);
    return `#${product.vehicle_category_id}`;
  }

  getBrandName(product: AdminProductItem): string {
    const brand = product.vehicle_brand || product.brand || product.vehicle_maker || product.maker;
    if (brand) return this.getOptionName(brand);
    return `#${product.vehicle_brand_id}`;
  }

  getSparePartName(product: AdminProductItem): string {
    const part = product.spare_part;
    if (part) return this.getOptionName(part);
    if (product.spare_part_name) return product.spare_part_name;
    return `#${product.spare_part_id}`;
  }

  getSubSparePartName(product: AdminProductItem): string {
    const subPart = product.sub_spare_part;
    if (subPart) return this.getOptionName(subPart);
    if (product.sub_spare_part_name) return product.sub_spare_part_name;
    return `#${product.sub_spare_part_id}`;
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return dateStr;
    }
  }

  get totalActiveCount(): number {
    return this.products.filter(p => p.is_active).length;
  }
}
