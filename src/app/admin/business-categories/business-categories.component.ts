import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgxPaginationModule } from 'ngx-pagination';
import { NotificationService } from 'src/app/core/services/notificationnew.service';
import { AdminService } from 'src/app/core/services/admin.service';

@Component({
  selector: 'app-business-categories',
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
  templateUrl: './business-categories.component.html',
  styleUrl: './business-categories.component.scss',
  animations: [
    trigger('fadeIn', [
      state(
        'void',
        style({
          opacity: 0,
          transform: 'scale(0.5)',
        }),
      ),
      transition(':enter', [
        animate(
          '0.5s ease-out',
          style({
            opacity: 1,
            transform: 'scale(1)',
          }),
        ),
      ]),
    ]),
  ],
})
export class BusinessCategoriesComponent implements OnInit {
  showreset: boolean = false;
  searchbarform!: FormGroup;
  createForm!: FormGroup;
  updateForm!: FormGroup;
  viewForm!: FormGroup;

  tableSize: any = 10;
  tableSizes: any = [10, 20, 50, 100, 'all'];
  totalRecords: any;
  page: number = 1;

  createModalOpen: boolean = false;
  updateModalOpen: boolean = false;
  viewModalOpen: boolean = false;
  currentCategoryId: any;
  categoryList: any[] = [];

  selectedBusinessType: string = 'all';
  selectedStatus: string = 'all';

  businessTypes = [
    { label: 'Service Provider', value: 'service_provider' },
    { label: 'Spare Part Seller', value: 'spare_part_seller' },
    { label: 'Vehicle Reseller', value: 'vehicle_reseller' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    this.searchbarform = this.formBuilder.group({
      searchbar: [''],
    });

    this.createForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      business_type: ['', [Validators.required]],
      description: [''],
    });

    this.updateForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      business_type: ['', [Validators.required]],
      description: [''],
    });

    this.viewForm = this.formBuilder.group({
      name: [''],
      business_type: [''],
      description: [''],
    });

    this.GetBusinessCategoriesFun();
  }

  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.GetBusinessCategoriesFun();
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.GetBusinessCategoriesFun();
  }

  onFilterChange() {
    this.page = 1;
    this.GetBusinessCategoriesFun();
  }

  searchfun() {
    const searchValue = this.searchbarform.get('searchbar')?.value;
    if (searchValue && searchValue.trim() !== '') {
      this.showreset = true;
      this.page = 1;
      this.GetBusinessCategoriesFun();
    } else {
      this.showreset = false;
      this.page = 1;
      this.GetBusinessCategoriesFun();
    }
  }

  resetsearchbar() {
    this.searchbarform.get('searchbar')?.reset();
    this.showreset = false;
    this.page = 1;
    this.GetBusinessCategoriesFun();
  }

  openAddModal() {
    this.createModalOpen = true;
  }

  OpenEditModal(category: any): void {
    this.currentCategoryId = category.id;
    this.updateModalOpen = true;
    this.updateForm.patchValue({
      name: category.name,
      business_type: category.business_type,
      description: category.description || '',
    });
  }

  openviewModal(category: any): void {
    this.viewModalOpen = true;
    this.currentCategoryId = category.id;
    this.viewForm.patchValue({
      name: category.name,
      business_type: this.getBusinessTypeLabel(category.business_type),
      description: category.description || 'No description provided',
    });
  }

  closeModal() {
    this.updateModalOpen = false;
    this.createModalOpen = false;
    this.viewModalOpen = false;
    this.createForm.reset();
    this.updateForm.reset();
  }

  createCategory() {
    if (this.createForm.valid) {
      const data = {
        name: this.createForm.get('name')?.value,
        business_type: this.createForm.get('business_type')?.value,
        description: this.createForm.get('description')?.value || null,
      };

      this.adminService.addBusinessCategory(data).subscribe({
        next: (response: any) => {
          if (response.status === 200 || response.status === 201) {
            this.closeModal();
            this.notificationService.show(
              response.message || 'Business category created successfully.',
              'success',
              3000,
            );
            this.GetBusinessCategoriesFun();
          } else {
            this.notificationService.show(
              response.error || 'Failed to create business category',
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

  updateCategory() {
    if (this.updateForm.valid) {
      const data = {
        name: this.updateForm.get('name')?.value,
        business_type: this.updateForm.get('business_type')?.value,
        description: this.updateForm.get('description')?.value || null,
      };

      this.adminService
        .updateBusinessCategory(this.currentCategoryId, data)
        .subscribe({
        next: (response: any) => {
          if (response.status === 200 || response.status === 201) {
            this.closeModal();
            this.notificationService.show(
              response.message || 'Business category updated successfully.',
              'success',
              3000,
            );
            this.GetBusinessCategoriesFun();
          } else {
            this.notificationService.show(
              response.error || 'Failed to update business category',
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

  GetBusinessCategoriesFun() {
    const search = this.searchbarform.get('searchbar')?.value;

    this.adminService
      .getBusinessCategories(
        this.tableSize,
        this.page,
        search,
        this.selectedBusinessType,
        this.selectedStatus,
      )
      .subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.categoryList = response.data || [];
            this.totalRecords =
              response.pagination?.total || this.categoryList.length;
          }
        },
        error: (error: any) => {
          console.error('Error fetching business categories', error);
        },
      });
  }

  Status(id: string, status: any) {
    this.adminService.updateBusinessCategoryStatus(id).subscribe({
      next: (response: any) => {
        if (response.status === 200 || response.status === 201) {
          this.notificationService.show(
            response.message || 'Business category status updated successfully',
            'success',
            2000,
          );
          this.GetBusinessCategoriesFun();
        } else {
          this.notificationService.show(
            response.error || 'Failed to update status',
            'error',
            2000,
          );
        }
      },
      error: (error: any) => {
        console.error('Error updating status', error);
      },
    });
  }

  getBusinessTypeLabel(type: string): string {
    const found = this.businessTypes.find((item) => item.value === type);
    if (found) return found.label;
    if (!type) return 'N/A';
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getBusinessTypeBadgeClass(type: string): string {
    switch (type) {
      case 'vehicle_reseller':
        return 'bg-info bg-opacity-10 text-info border border-info border-opacity-25';
      case 'service_provider':
        return 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25';
      case 'spare_part_seller':
        return 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25';
      default:
        return 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25';
    }
  }
}
