import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NgxPaginationModule } from 'ngx-pagination';
import { NotificationService } from '../../core/services/notificationnew.service';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-tags-master',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    NgxPaginationModule,
  ],
  templateUrl: './tags-master.component.html',
  styleUrl: './tags-master.component.scss',
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [animate('0.5s ease-out')]),
    ]),
  ],
})
export class TagsMasterComponent implements OnInit {
  searchbarform: FormGroup;
  createForm: FormGroup;
  updateForm: FormGroup;
  viewForm: FormGroup;

  tagsList: any[] = [];
  publicBusinessCategoriesList: any[] = [];
  publicVehicleCategoriesList: any[] = [];

  page = 1;
  totalRecords = 0;
  tableSize: any = 20;
  tableSizes: any = [10, 20, 50, 100, 'all'];

  selectedBusinessCategory: any = 'all';
  selectedBusinessType: any = 'all';
  selectedVehicleCategory: any = 'all';
  selectedStatus: any = 'all';

  businessTypes = [
    { label: 'Service Provider', value: 'service_provider' },
    { label: 'Spare Part Seller', value: 'spare_part_seller' },
    { label: 'Vehicle Reseller', value: 'vehicle_reseller' },
  ];

  createModalOpen = false;
  updateModalOpen = false;
  viewModalOpen = false;

  currentTagId: any;
  selectedTag: any;

  selectedCreateVehicleCategories: number[] = [];
  selectedUpdateVehicleCategories: number[] = [];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private notificationService: NotificationService,
  ) {
    this.searchbarform = this.fb.group({
      searchbar: [''],
    });

    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      business_category_id: ['', [Validators.required]],
    });

    this.updateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      business_category_id: ['', [Validators.required]],
    });

    this.viewForm = this.fb.group({
      name: [{ value: '', disabled: true }],
      business_category_id: [{ value: '', disabled: true }],
      business_type: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.loadPublicBusinessCategories();
    this.loadPublicVehicleCategories();
    this.GetTagsFun();
  }

  loadPublicBusinessCategories(): void {
    this.adminService
      .getPublicBusinessCategories('')
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.publicBusinessCategoriesList = response.data;
          }
        },
        error: (error: any) => {
          console.error('Failed to load public business categories', error);
        },
      });
  }

  loadPublicVehicleCategories(): void {
    this.adminService.getPublicVehicleCategories().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.publicVehicleCategoriesList = response.data;
        }
      },
      error: (error: any) => {
        console.error('Failed to load public vehicle categories', error);
      },
    });
  }

  getVehicleCategoryName(id: any): string {
    const cat = this.publicVehicleCategoriesList.find(
      (v: any) => v.id === Number(id),
    );
    return cat ? cat.name : `Category #${id}`;
  }

  getVehicleCategoriesNames(ids: any): string[] {
    if (Array.isArray(ids) && ids.length > 0) {
      return ids.map((id: any) => this.getVehicleCategoryName(id));
    }
    return [];
  }

  getBusinessTypeLabel(type: string): string {
    if (type === 'service_provider') return 'Service Provider';
    if (type === 'spare_part_seller') return 'Spare Part Seller';
    if (type === 'vehicle_reseller') return 'Vehicle Reseller';
    return type || 'N/A';
  }

  getBusinessTypeBadgeClass(type: string): string {
    if (type === 'service_provider')
      return 'bg-info bg-opacity-10 text-info border border-info border-opacity-25';
    if (type === 'spare_part_seller')
      return 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25';
    if (type === 'vehicle_reseller')
      return 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25';
    return 'bg-secondary bg-opacity-10 text-secondary';
  }

  toggleCreateVehicleCategory(id: number): void {
    const index = this.selectedCreateVehicleCategories.indexOf(id);
    if (index === -1) {
      this.selectedCreateVehicleCategories.push(id);
    } else {
      this.selectedCreateVehicleCategories.splice(index, 1);
    }
  }

  isCreateVehicleCategorySelected(id: number): boolean {
    return this.selectedCreateVehicleCategories.includes(id);
  }

  toggleUpdateVehicleCategory(id: number): void {
    const index = this.selectedUpdateVehicleCategories.indexOf(id);
    if (index === -1) {
      this.selectedUpdateVehicleCategories.push(id);
    } else {
      this.selectedUpdateVehicleCategories.splice(index, 1);
    }
  }

  isUpdateVehicleCategorySelected(id: number): boolean {
    return this.selectedUpdateVehicleCategories.includes(id);
  }

  openCreateModal() {
    this.createForm.reset();
    this.selectedCreateVehicleCategories = [];
    this.createModalOpen = true;
  }

  openUpdateModal(tag: any) {
    this.currentTagId = tag.id;
    this.updateForm.patchValue({
      name: tag.name,
      business_category_id: tag.business_category_id || (tag.business_category ? tag.business_category.id : ''),
    });
    this.selectedUpdateVehicleCategories = Array.isArray(tag.vehicle_category_id)
      ? tag.vehicle_category_id.map((id: any) => Number(id))
      : [];
    this.updateModalOpen = true;
  }

  openViewModal(tag: any) {
    this.selectedTag = tag;
    this.viewForm.patchValue({
      name: tag.name,
      business_category_id: tag.business_category ? tag.business_category.name : tag.business_category_id,
      business_type: this.getBusinessTypeLabel(tag.business_type),
    });
    this.viewModalOpen = true;
  }

  closeModal() {
    this.createModalOpen = false;
    this.updateModalOpen = false;
    this.viewModalOpen = false;
    this.createForm.reset();
    this.updateForm.reset();
    this.selectedCreateVehicleCategories = [];
    this.selectedUpdateVehicleCategories = [];
  }

  createTag() {
    if (this.createForm.valid) {
      const data: any = {
        name: this.createForm.get('name')?.value,
        business_category_id: Number(this.createForm.get('business_category_id')?.value),
        vehicle_category_id:
          this.selectedCreateVehicleCategories.length > 0
            ? this.selectedCreateVehicleCategories
            : null,
      };

      this.adminService.addTag(data).subscribe({
        next: (response: any) => {
          if (response.status === 200 || response.status === 201) {
            this.closeModal();
            this.notificationService.show(
              response.message || 'Tag created successfully.',
              'success',
              3000,
            );
            this.GetTagsFun();
          } else {
            this.notificationService.show(
              response.error || 'Failed to create tag',
              'error',
              3000,
            );
          }
        },
        error: (error: any) => {
          console.error('Create failed', error);
        },
      });
    } else {
      this.createForm.markAllAsTouched();
    }
  }

  updateTagFun() {
    if (this.updateForm.valid) {
      const data: any = {
        name: this.updateForm.get('name')?.value,
        business_category_id: Number(this.updateForm.get('business_category_id')?.value),
        vehicle_category_id:
          this.selectedUpdateVehicleCategories.length > 0
            ? this.selectedUpdateVehicleCategories
            : null,
      };

      this.adminService.updateTag(this.currentTagId, data).subscribe({
        next: (response: any) => {
          if (response.status === 200 || response.status === 201) {
            this.closeModal();
            this.notificationService.show(
              response.message || 'Tag updated successfully.',
              'success',
              3000,
            );
            this.GetTagsFun();
          } else {
            this.notificationService.show(
              response.error || 'Failed to update tag',
              'error',
              3000,
            );
          }
        },
        error: (error: any) => {
          console.error('Update failed', error);
        },
      });
    } else {
      this.updateForm.markAllAsTouched();
    }
  }

  GetTagsFun() {
    const search = this.searchbarform.get('searchbar')?.value;

    this.adminService
      .getTags(
        this.tableSize,
        this.page,
        search,
        this.selectedBusinessCategory,
        this.selectedBusinessType,
        this.selectedVehicleCategory,
        this.selectedStatus,
      )
      .subscribe({
        next: (response: any) => {
          if (response.status === 200 && response.data) {
            this.tagsList = response.data;
            this.totalRecords =
              response.pagination?.total || this.tagsList.length;
          } else {
            this.tagsList = [];
            this.totalRecords = 0;
          }
        },
        error: (error: any) => {
          console.error('Error fetching tags:', error);
          this.tagsList = [];
          this.totalRecords = 0;
        },
      });
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.GetTagsFun();
  }

  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.GetTagsFun();
  }

  resetSearch() {
    this.searchbarform.get('searchbar')?.setValue('');
    this.selectedBusinessCategory = 'all';
    this.selectedBusinessType = 'all';
    this.selectedVehicleCategory = 'all';
    this.selectedStatus = 'all';
    this.page = 1;
    this.GetTagsFun();
  }

  Status(id: any, is_active: any) {
    this.adminService.updateTagStatus(id).subscribe({
      next: (response: any) => {
        if (response.status === 200 || response.status === 201) {
          this.notificationService.show(
            response.message || 'Tag status updated successfully.',
            'success',
            3000,
          );
          this.GetTagsFun();
        } else {
          this.notificationService.show(
            response.error || 'Failed to change status.',
            'error',
            3000,
          );
        }
      },
      error: (err: any) => {
        console.error('Status change error:', err);
      },
    });
  }
}
