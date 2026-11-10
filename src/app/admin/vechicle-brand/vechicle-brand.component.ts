import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { NotificationService } from 'src/app/core/services/notificationnew.service';
import { AdminService } from 'src/app/core/services/admin.service';

@Component({
  selector: 'app-vechicle-brand',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    NgxPaginationModule,
    NgSelectModule,
  ],
  templateUrl: './vechicle-brand.component.html',
  styleUrl: './vechicle-brand.component.scss',
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
  ]
})
export class VechicleBrandComponent implements OnInit {
  showreset: boolean = false;
  searchbarform!: FormGroup;
  createBrandForm!: FormGroup;
  updateBrandForm!: FormGroup;
  viewBrandForm!: FormGroup;
  
  tableSize: any = 10;
  tableSizes: any = [10, 20, 50, 100, 'all'];
  totalRecords: any;
  page: number = 1;
  
  createBrandOpen: boolean = false;
  updateBrandOpen: boolean = false;
  viewBrandOpen: boolean = false;
  currentBrandId: any;
  brandList: any;
  vehicleCategories: any[] = [];
  isLoadingCategories: boolean = false;
  selectedViewBrand: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    this.searchbarform = this.formBuilder.group({
      searchbar: [''],
    });

    this.createBrandForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
      vehicle_category_id: [[]],
    });

    this.updateBrandForm = this.formBuilder.group({
      Name: ['', [Validators.required, Validators.minLength(2)]],
      vehicle_category_id: [[]],
    });

    this.viewBrandForm = this.formBuilder.group({
      Name: [''],
      vehicle_category_id: [[]],
    });

    this.loadCategories();
    this.GetBrandsFun();
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.adminService.getPublicVehicleCategories().subscribe({
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

  getBrandCategoryIds(brand: any): number[] {
    if (!brand) return [];
    if (Array.isArray(brand.vehicle_category_id) && brand.vehicle_category_id.length > 0) {
      return brand.vehicle_category_id.map((id: any) => Number(id));
    }
    if (Array.isArray(brand.vehicle_categories) && brand.vehicle_categories.length > 0) {
      return brand.vehicle_categories.map((cat: any) => Number(cat.id));
    }
    return [];
  }

  getBrandCategoryNames(brand: any): string[] {
    if (!brand) return [];
    if (Array.isArray(brand.vehicle_categories) && brand.vehicle_categories.length > 0) {
      return brand.vehicle_categories.map((cat: any) => cat.name).filter(Boolean);
    }
    if (Array.isArray(brand.vehicle_category_id) && brand.vehicle_category_id.length > 0) {
      return brand.vehicle_category_id.map((id: any) => this.getVehicleCategoryName(id));
    }
    return [];
  }

  getVehicleCategoryName(id: any): string {
    const cat = this.vehicleCategories.find((v: any) => Number(v.id) === Number(id));
    return cat ? cat.name : `Category #${id}`;
  }
  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.GetBrandsFun();
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.GetBrandsFun();
  }

  searchfun() {
    const searchValue = this.searchbarform.get('searchbar')?.value;
    if (searchValue && searchValue.trim() !== '') {
      this.showreset = true;
      this.page = 1;
      this.GetBrandsFun();
    } else {
      this.showreset = false;
      this.page = 1;
      this.GetBrandsFun();
    }
  }

  resetsearchbar() {
    this.searchbarform.get('searchbar')?.reset();
    this.showreset = false;
    this.page = 1;
    this.GetBrandsFun();
  }

  openAddModal() {
    this.createBrandForm.reset({
      Name: '',
      vehicle_category_id: []
    });
    this.createBrandOpen = true;
  }

  OpenEditModal(brand: any): void {
    this.currentBrandId = brand.id;
    this.updateBrandOpen = true;
    this.updateBrandForm.patchValue({
      Name: brand.name,
      vehicle_category_id: this.getBrandCategoryIds(brand)
    });
  }

  openviewModal(brand: any): void {
    this.viewBrandOpen = true;
    this.currentBrandId = brand.id;
    this.selectedViewBrand = brand;
    this.viewBrandForm.patchValue({
      Name: brand.name,
      vehicle_category_id: this.getBrandCategoryIds(brand)
    });
  }

  closeModal() {
    this.updateBrandOpen = false;
    this.createBrandOpen = false;
    this.viewBrandOpen = false;
    this.selectedViewBrand = null;
    this.createBrandForm.reset({ Name: '', vehicle_category_id: [] });
    this.updateBrandForm.reset({ Name: '', vehicle_category_id: [] });
    this.viewBrandForm.reset();
  }

  createBrand() {
    if (this.createBrandForm.valid) {
      const name = this.createBrandForm.get('Name')?.value;
      const selectedCats = this.createBrandForm.get('vehicle_category_id')?.value;
      const vehicle_category_id = Array.isArray(selectedCats)
        ? selectedCats.map((id: any) => Number(id))
        : [];
      const data = {
        name: name,
        vehicle_category_id: vehicle_category_id
      };

      this.adminService.addVehicleBrand(data).subscribe({
        next: (response: any) => {
          if (response.status === 200 || response.status === 201) {
            this.closeModal();
            this.notificationService.show(response.message || 'Brand created successfully', 'success', 3000);
            this.GetBrandsFun();
          } else {
            this.notificationService.show(response.error || response.message || 'Failed to create brand', 'error', 3000);
          }
        },
        error: (error: any) => {
          console.error('Create failed', error);
          // this.notificationService.show(error?.error?.message || 'Failed to create brand', 'error', 3000);
        }
      });
    } else {
      this.createBrandForm.markAllAsTouched();
    }
  }

  updateBrand() {
    if (this.updateBrandForm.valid) {
      const name = this.updateBrandForm.get('Name')?.value;
      const selectedCats = this.updateBrandForm.get('vehicle_category_id')?.value;
      const vehicle_category_id = Array.isArray(selectedCats)
        ? selectedCats.map((id: any) => Number(id))
        : [];
      const data = {
        id: this.currentBrandId,
        name: name,
        vehicle_category_id: vehicle_category_id
      };

      this.adminService.addVehicleBrand(data).subscribe({
        next: (response: any) => {
          if (response.status === 200 || response.status === 201) {
            this.closeModal();
            this.notificationService.show(response.message || 'Brand updated successfully', 'success', 3000);
            this.GetBrandsFun();
          } else {
            this.notificationService.show(response.error || response.message || 'Failed to update brand', 'error', 3000);
          }
        },
        error: (error: any) => {
          console.error('Update failed', error);
          // this.notificationService.show(error?.error?.message || 'Failed to update brand', 'error', 3000);
        }
      });
    } else {
      this.updateBrandForm.markAllAsTouched();
    }
  }

  GetBrandsFun() {
    const search = this.searchbarform.get('searchbar')?.value;
    
    this.adminService.getVehicleBrand(this.tableSize, this.page, search).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.brandList = response.data || [];
          this.totalRecords = response.pagination?.total || this.brandList.length;
        }
      },
      error: (error: any) => {
        console.error('Error fetching brands', error);
      }
    });
  }

  Status(id: string, status: any) {
    this.adminService.VehicleBrandStatus(id).subscribe({
      next: (response: any) => {
        if (response.status === 200 || response.status === 201) {
          this.notificationService.show(response.message || `Brand status updated successfully`, 'success', 2000);
          this.GetBrandsFun();
        } else {
           this.notificationService.show(response.error || `Failed to update status`, 'error', 2000);
        }
      },
      error: (error: any) => {
        console.error('Error updating status', error);
      }
    });
  }
}
