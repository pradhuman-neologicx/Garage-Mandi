import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { NotificationService } from '../../core/services/notificationnew.service';

export interface CategoryItem {
  id: number;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  icon?: string;
  itemCount: number;
  vehicleCategory?: any;
  vehicleCategoryName?: string;
  sparePart?: string;
  sparePartName?: string;
}

import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.scss'
})
export class CategoryManagementComponent implements OnInit {
  activeTab = signal<'vehicle' | 'spare' | 'service' | 'sub_category'>('vehicle');

  vehicleCategories = signal<CategoryItem[]>([]);
  publicVehicleCategories = signal<any[]>([]);

  sparePartCategories = signal<CategoryItem[]>([]);
  publicSpareParts = signal<any[]>([]);

  // Services State
  services = signal<any[]>([]);
  serviceTableSizes: any = [10, 20, 50, 100, 'all'];
  serviceTableSize: any = 10;
  servicePage: number = 1;
  serviceSearchText: string = '';
  serviceCategoryId: string = '';
  serviceTotalRecords: number = 0;

  // Sub Categories State
  subCategories = signal<any[]>([]);
  subCategoryTableSizes: any = [10, 20, 50, 100, 'all'];
  subCategoryTableSize: any = 10;
  subCategoryPage: number = 1;
  subCategorySearchText: string = '';
  subCategorySparePartId: string = '';
  subCategoryTotalRecords: number = 0;

  // Spare Parts Pagination & Filters
  sparePartsTableSize: any = 10;
  sparePartsTableSizes: any = [10, 20, 50, 100, 'all'];
  sparePartsPage: number = 1;
  sparePartsSearchText: string = '';
  sparePartsCategoryId: string = '';
  sparePartsTotalRecords: number = 0;

  onSparePartsTableSizeChange(event: any): void {
    this.sparePartsTableSize = event.target.value;
    this.sparePartsPage = 1;
    this.getSparePartsCategories();
  }

  onSparePartsTableDataChange(event: any) {
    this.sparePartsPage = event;
    this.getSparePartsCategories();
  }

  onSparePartsFilterChange() {
    this.sparePartsPage = 1;
    this.getSparePartsCategories();
  }

  resetSparePartsFilters() {
    this.sparePartsSearchText = '';
    this.sparePartsCategoryId = '';
    this.sparePartsPage = 1;
    this.getSparePartsCategories();
  }

  resetServiceFilters() {
    this.serviceSearchText = '';
    this.serviceCategoryId = '';
    this.servicePage = 1;
    this.getServices();
  }

  resetSubCategoryFilters() {
    this.subCategorySearchText = '';
    this.subCategorySparePartId = '';
    this.subCategoryPage = 1;
    this.getSubCategories();
  }

  showModal = signal(false);
  editingCategory = signal<CategoryItem | null>(null);

  newCategory: Partial<CategoryItem> = {
    name: '',
    description: '',
    status: 'Active',
    itemCount: 0,
    vehicleCategory: []
  };

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.getVehicleCategories();
    this.fetchPublicVehicleCategories();
    this.fetchPublicSpareParts();
  }

  fetchPublicVehicleCategories() {
    this.adminService.getPublicVehicleCategories().subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          this.publicVehicleCategories.set(res.data || []);
        }
      },
      error: (err) => console.error(err)
    });
  }

  fetchPublicSpareParts() {
    this.adminService.getPublicSpareParts().subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          this.publicSpareParts.set(res.data || []);
        }
      },
      error: (err) => console.error(err)
    });
  }

  getVehicleCategories() {
    this.adminService.getCategory('all', 1, '').subscribe({
      next: (res: any) => {
        if (res && (res.status === 200 || res.status === true)) {
          const dataList = res.data?.data || res.data || [];
          const mappedList = dataList.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            status: (item.is_active === 1 || item.is_active === '1') ? 'Active' : 'Inactive',
            icon: item.icon || 'directions_car',
            itemCount: item.itemCount || 0
          }));
          this.vehicleCategories.set(mappedList);
        }
      },
      error: (err: any) => {
        console.error('Failed to fetch categories', err);
      }
    });
  }

  getSparePartsCategories() {
    this.adminService.getSpareParts(this.sparePartsTableSize, this.sparePartsPage, this.sparePartsSearchText, this.sparePartsCategoryId).subscribe({
      next: (res: any) => {
        if (res && (res.status === 200 || res.status === true)) {
          const dataList = res.data?.data || res.data || [];
          const mappedList = dataList.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            status: (item.is_active === 1 || item.is_active === '1') ? 'Active' : 'Inactive',
            icon: item.icon || 'settings',
            itemCount: item.itemCount || 0,
            vehicleCategory: item.vehicle_category_id || null,
            vehicleCategoryName: item.vehicle_category?.name || ''
          }));
          this.sparePartCategories.set(mappedList);

          if (res.data && res.data.total !== undefined) {
            this.sparePartsTotalRecords = res.data.total;
          } else {
            this.sparePartsTotalRecords = mappedList.length;
          }
        }
      },
      error: (err: any) => {
        console.error('Failed to fetch spare parts', err);
      }
    });
  }

  // --- Services ---
  onServiceTableSizeChange(event: any): void {
    this.serviceTableSize = event.target.value;
    this.servicePage = 1;
    this.getServices();
  }

  onServiceTableDataChange(event: any) {
    this.servicePage = event;
    this.getServices();
  }

  onServiceFilterChange() {
    this.servicePage = 1;
    this.getServices();
  }

  getServices() {
    this.adminService.getServices(this.serviceTableSize, this.servicePage, this.serviceSearchText, this.serviceCategoryId).subscribe({
      next: (res: any) => {
        if (res && (res.status === 200 || res.status === true)) {
          const dataList = res.data?.data || res.data || [];
          this.services.set(dataList.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            status: item.is_active === 1 ? 'Active' : 'Inactive',
            vehicleCategory: item.vehicle_category_id || null,
            vehicleCategoryName: item.vehicle_category?.name || '',
            rawData: item
          })));
          this.serviceTotalRecords = res.data?.total || dataList.length;
        }
      },
      error: (err) => console.error(err)
    });
  }

  // --- Sub Categories ---
  onSubCategoryTableSizeChange(event: any): void {
    this.subCategoryTableSize = event.target.value;
    this.subCategoryPage = 1;
    this.getSubCategories();
  }

  onSubCategoryTableDataChange(event: any) {
    this.subCategoryPage = event;
    this.getSubCategories();
  }

  onSubCategoryFilterChange() {
    this.subCategoryPage = 1;
    this.getSubCategories();
  }

  getSubCategories() {
    this.adminService.getSubCategories(this.subCategoryTableSize, this.subCategoryPage, this.subCategorySearchText, this.subCategorySparePartId).subscribe({
      next: (res: any) => {
        if (res && (res.status === 200 || res.status === true)) {
          const dataList = res.data?.data || res.data || [];
          this.subCategories.set(dataList.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            status: item.is_active === 1 ? 'Active' : 'Inactive',
            sparePart: item.vehicle_spare_parts_id || item.spare_part_id || null,
            sparePartName: item.vehicle_spare_part?.name || item.spare_part?.name || '',
            rawData: item
          })));
          this.subCategoryTotalRecords = res.data?.total || dataList.length;
        }
      },
      error: (err) => console.error(err)
    });
  }

  switchTab(tab: 'vehicle' | 'spare' | 'service' | 'sub_category') {
    this.activeTab.set(tab);
    if (tab === 'vehicle') {
      this.getVehicleCategories();
    } else if (tab === 'spare') {
      this.getSparePartsCategories();
    } else if (tab === 'service') {
      this.getServices();
    } else if (tab === 'sub_category') {
      this.getSubCategories();
    }
  }

  getCurrentList() {
    switch (this.activeTab()) {
      case 'vehicle': return this.vehicleCategories();
      case 'spare': return this.sparePartCategories();
      case 'service': return this.services();
      case 'sub_category': return this.subCategories();
    }
  }

  getTableSize() {
    switch (this.activeTab()) {
      case 'vehicle': return 1000;
      case 'spare': return this.sparePartsTableSize;
      case 'service': return this.serviceTableSize;
      case 'sub_category': return this.subCategoryTableSize;
    }
  }

  getPage() {
    switch (this.activeTab()) {
      case 'vehicle': return 1;
      case 'spare': return this.sparePartsPage;
      case 'service': return this.servicePage;
      case 'sub_category': return this.subCategoryPage;
    }
  }

  getTotalRecords() {
    switch (this.activeTab()) {
      case 'vehicle': return this.vehicleCategories().length;
      case 'spare': return this.sparePartsTotalRecords;
      case 'service': return this.serviceTotalRecords;
      case 'sub_category': return this.subCategoryTotalRecords;
    }
  }

  handlePageChange(event: any) {
    switch (this.activeTab()) {
      case 'spare': this.onSparePartsTableDataChange(event); break;
      case 'service': this.onServiceTableDataChange(event); break;
      case 'sub_category': this.onSubCategoryTableDataChange(event); break;
    }
  }

  openAddModal() {
    this.editingCategory.set(null);
    this.newCategory = { name: '', description: '', status: 'Active', itemCount: 0, icon: 'category', vehicleCategory: [], sparePart: '' };
    this.showModal.set(true);
    if (['spare', 'service'].includes(this.activeTab())) {
      this.fetchPublicVehicleCategories();
    }
    if (this.activeTab() === 'sub_category') {
      this.fetchPublicSpareParts();
    }
  }

  openEditModal(category: any) {
    this.editingCategory.set(category);
    this.newCategory = { ...category };
    this.showModal.set(true);
    if (['spare', 'service'].includes(this.activeTab())) {
      this.fetchPublicVehicleCategories();
    }
    if (this.activeTab() === 'sub_category') {
      this.fetchPublicSpareParts();
    }

    const id = category.id;
    let apiCall;
    switch (this.activeTab()) {
      case 'vehicle':
        apiCall = this.adminService.getCategoryById(id);
        break;
      case 'spare':
        apiCall = this.adminService.getSparePartById(id);
        break;
      case 'service':
        apiCall = this.adminService.getServiceById(id);
        break;
      case 'sub_category':
        apiCall = this.adminService.getSubCategoryById(id);
        break;
    }

    if (apiCall) {
      apiCall.subscribe({
        next: (res: any) => {
          if (res && res.status === 200) {
            const data = res.data;
            this.newCategory = {
              ...this.newCategory,
              id: data.id,
              name: data.name,
              description: data.description || '',
              status: (data.is_active === 1 || data.is_active === '1') ? 'Active' : 'Inactive',
            };
            if (this.activeTab() === 'spare' || this.activeTab() === 'service') {
              const ensureArray = (val: any) => {
                if (Array.isArray(val)) return val.map(v => parseInt(v, 10));
                if (val) return [parseInt(val, 10)];
                return [];
              };
              this.newCategory.vehicleCategory = ensureArray(data.vehicle_category_id);
            }
            if (this.activeTab() === 'sub_category') {
              this.newCategory.sparePart = data.vehicle_spare_parts_id || data.spare_part_id || null;
            }
          }
        },
        error: (err) => console.error(err)
      });
    }
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveCategory() {
    if (this.activeTab() === 'spare' && (!this.newCategory.vehicleCategory || (this.newCategory.vehicleCategory as any[]).length === 0)) {
      this.notificationService.show('Vehicle Category is required', 'error');
      return;
    }

    if (!this.newCategory.name || this.newCategory.name.trim() === '') {
      this.notificationService.show(this.activeTab() === 'vehicle' ? 'Category Name is required' : 'Spare Part Name is required', 'error');
      return;
    }


    const formData = new FormData();
    formData.append('name', this.newCategory.name);
    if (this.newCategory.description) {
      formData.append('description', this.newCategory.description);
    }

    // If editing, append the ID
    if (this.editingCategory() && this.editingCategory()?.id) {
      formData.append('id', this.editingCategory()!.id.toString());
    }

    if (this.activeTab() === 'service') {
      if (!this.newCategory.vehicleCategory || (this.newCategory.vehicleCategory as any[]).length === 0) {
        this.notificationService.show('Vehicle Category is required', 'error');
        return;
      }
      (this.newCategory.vehicleCategory as number[]).forEach((id: number) => formData.append('vehicle_category_id[]', id.toString()));

      const apiCall = this.editingCategory() && this.editingCategory()?.id
        ? this.adminService.updateService(this.editingCategory()!.id, formData)
        : this.adminService.addService(formData);

      apiCall.subscribe({
        next: (response: any) => {
          if (response && (response.status === 200 || response.status === 201 || response.status === true)) {
            this.notificationService.show(response.message || 'Service saved successfully', 'success');
            this.closeModal();
            this.getServices();
          } else {
            this.notificationService.show(response.message || 'Failed to save service', 'error');
          }
        },
        error: (err: any) => this.notificationService.show(err?.error?.message || err?.message || 'Error saving service', 'error')
      });
      return;
    }

    if (this.activeTab() === 'sub_category') {
      if (!this.newCategory.sparePart) {
        this.notificationService.show('Spare Part is required', 'error');
        return;
      }
      formData.append('vehicle_spare_parts_id', this.newCategory.sparePart.toString());

      const apiCall = this.editingCategory() && this.editingCategory()?.id
        ? this.adminService.updateSubCategory(this.editingCategory()!.id, formData)
        : this.adminService.addSubCategory(formData);

      apiCall.subscribe({
        next: (response: any) => {
          if (response && (response.status === 200 || response.status === 201 || response.status === true)) {
            this.notificationService.show(response.message || 'Sub Category saved successfully', 'success');
            this.closeModal();
            this.getSubCategories();
          } else {
            this.notificationService.show(response.message || 'Failed to save sub category', 'error');
          }
        },
        error: (err: any) => this.notificationService.show(err?.error?.message || err?.message || 'Error saving sub category', 'error')
      });
      return;
    }

    if (this.activeTab() === 'vehicle') {
      this.adminService.AddCategory(formData).subscribe({
        next: (response: any) => {
          if (response && (response.status === 200 || response.status === 201 || response.status === true)) {
            this.notificationService.show(response.message || 'Category saved successfully', 'success');
            this.closeModal();
            this.getVehicleCategories();
          } else {
            this.notificationService.show(response.message || 'Failed to save category', 'error');
          }
        },
        error: (err: any) => {
          this.notificationService.show(err?.error?.message || err?.message || 'Error saving category', 'error');
        }
      });
    } else {
      // For spare parts
      if (this.newCategory.vehicleCategory && Array.isArray(this.newCategory.vehicleCategory)) {
        (this.newCategory.vehicleCategory as number[]).forEach((id: number) => formData.append('vehicle_category_id[]', id.toString()));
      }
      this.adminService.AddSparePart(formData).subscribe({
        next: (response: any) => {
          if (response && (response.status === 200 || response.status === 201 || response.status === true)) {
            this.notificationService.show(response.message || 'Spare part saved successfully', 'success');
            this.closeModal();
            this.getSparePartsCategories();
          } else {
            this.notificationService.show(response.message || 'Failed to save spare part', 'error');
          }
        },
        error: (err: any) => {
          this.notificationService.show(err?.error?.message || err?.message || 'Error saving spare part', 'error');
        }
      });
    }
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      // delete logic can be hooked to API later
      const listToUpdate = this.activeTab() === 'vehicle' ? this.vehicleCategories : this.sparePartCategories;
      listToUpdate.set(listToUpdate().filter(c => c.id !== id));
    }
  }

  toggleVehicleCategory(id: number) {
    if (!this.newCategory.vehicleCategory || !Array.isArray(this.newCategory.vehicleCategory)) {
      this.newCategory.vehicleCategory = [];
    }
    const arr = this.newCategory.vehicleCategory as number[];
    const index = arr.indexOf(id);
    if (index > -1) {
      arr.splice(index, 1);
    } else {
      arr.push(id);
    }
  }

  isVehicleCategoryChecked(id: number): boolean {
    if (!this.newCategory.vehicleCategory || !Array.isArray(this.newCategory.vehicleCategory)) return false;
    return (this.newCategory.vehicleCategory as number[]).includes(id);
  }

  toggleStatus(item: CategoryItem) {
    const originalStatus = item.status;
    const newStatus = originalStatus === 'Active' ? 'Inactive' : 'Active';

    if (this.activeTab() === 'vehicle') {
      const listToUpdate = this.vehicleCategories;
      const currentList = listToUpdate();
      listToUpdate.set(currentList.map(c =>
        c.id === item.id ? { ...c, status: newStatus } as CategoryItem : c
      ));

      this.adminService.UpdateCategoryStatus(item.id).subscribe({
        next: (response: any) => {
          if (response && (response.status === 200 || response.status === 201 || response.status === true)) {
            this.notificationService.show(response.message || 'Status updated successfully', 'success');
          } else {
            this.notificationService.show(response.message || 'Failed to update status', 'error');
            listToUpdate.set(currentList.map(c =>
              c.id === item.id ? { ...c, status: originalStatus } as CategoryItem : c
            ));
          }
        },
        error: (err: any) => {
          this.notificationService.show(err?.error?.message || err?.message || 'Error updating status', 'error');
          listToUpdate.set(currentList.map(c =>
            c.id === item.id ? { ...c, status: originalStatus } as CategoryItem : c
          ));
        }
      });
    } else if (this.activeTab() === 'service') {
      const listToUpdate = this.services;
      const currentList = listToUpdate();
      listToUpdate.set(currentList.map(c => c.id === item.id ? { ...c, status: newStatus } : c));

      this.adminService.updateServiceStatus(item.id).subscribe({
        next: (res: any) => {
          if (res && (res.status === 200 || res.status === true)) {
            this.notificationService.show(res.message || 'Status updated', 'success');
          } else {
            this.notificationService.show(res.message || 'Failed to update status', 'error');
            listToUpdate.set(currentList.map(c => c.id === item.id ? { ...c, status: originalStatus } : c));
          }
        },
        error: (err: any) => {
          this.notificationService.show(err?.error?.message || err?.message || 'Error updating status', 'error');
          listToUpdate.set(currentList.map(c => c.id === item.id ? { ...c, status: originalStatus } : c));
        }
      });
    } else if (this.activeTab() === 'sub_category') {
      const listToUpdate = this.subCategories;
      const currentList = listToUpdate();
      listToUpdate.set(currentList.map(c => c.id === item.id ? { ...c, status: newStatus } : c));

      this.adminService.updateSubCategoryStatus(item.id).subscribe({
        next: (res: any) => {
          if (res && (res.status === 200 || res.status === true)) {
            this.notificationService.show(res.message || 'Status updated', 'success');
          } else {
            this.notificationService.show(res.message || 'Failed to update status', 'error');
            listToUpdate.set(currentList.map(c => c.id === item.id ? { ...c, status: originalStatus } : c));
          }
        },
        error: (err: any) => {
          this.notificationService.show(err?.error?.message || err?.message || 'Error updating status', 'error');
          listToUpdate.set(currentList.map(c => c.id === item.id ? { ...c, status: originalStatus } : c));
        }
      });
    } else {
      const listToUpdate = this.sparePartCategories;
      const currentList = listToUpdate();
      listToUpdate.set(currentList.map(c =>
        c.id === item.id ? { ...c, status: newStatus } as CategoryItem : c
      ));

      this.adminService.UpdateSparePartStatus(item.id).subscribe({
        next: (response: any) => {
          if (response && (response.status === 200 || response.status === 201 || response.status === true)) {
            this.notificationService.show(response.message || 'Status updated successfully', 'success');
          } else {
            this.notificationService.show(response.message || 'Failed to update status', 'error');
            listToUpdate.set(currentList.map(c =>
              c.id === item.id ? { ...c, status: originalStatus } as CategoryItem : c
            ));
          }
        },
        error: (err: any) => {
          this.notificationService.show(err?.error?.message || err?.message || 'Error updating status', 'error');
          listToUpdate.set(currentList.map(c =>
            c.id === item.id ? { ...c, status: originalStatus } as CategoryItem : c
          ));
        }
      });
    }
  }
}
