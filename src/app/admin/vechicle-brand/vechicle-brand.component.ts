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

  constructor(
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    this.searchbarform = this.formBuilder.group({
      searchbar: ['', [Validators.required]],
    });

    this.createBrandForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
    });

    this.updateBrandForm = this.formBuilder.group({
      Name: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.viewBrandForm = this.formBuilder.group({
      Name: [''],
    });
    this.GetBrandsFun();
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
    if (this.searchbarform.valid) {
      this.showreset = true;
      this.page = 1;
      this.GetBrandsFun();
    } else {
      this.searchbarform.markAllAsTouched();
    }
  }

  resetsearchbar() {
    this.searchbarform.get('searchbar')?.reset();
    this.showreset = false;
    this.page = 1;
    this.GetBrandsFun();
  }

  openAddModal() {
    this.createBrandOpen = true;
  }

  OpenEditModal(brand: any): void {
    this.currentBrandId = brand.id;
    this.updateBrandOpen = true;
    this.updateBrandForm.patchValue({ Name: brand.name });
  }

  openviewModal(brand: any): void {
    this.viewBrandOpen = true;
    this.currentBrandId = brand.id;
    this.viewBrandForm.patchValue({ Name: brand.name });
  }

  closeModal() {
    this.updateBrandOpen = false;
    this.createBrandOpen = false;
    this.viewBrandOpen = false;
    this.createBrandForm.reset();
    this.updateBrandForm.reset();
  }

  createBrand() {
    if (this.createBrandForm.valid) {
      const name = this.createBrandForm.get('Name')?.value;
      const data = { name: name };

      this.adminService.addVehicleBrand(data).subscribe({
        next: (response: any) => {
          if (response.status === 200 || response.status === 201) {
            this.closeModal();
            this.notificationService.show(response.message || 'Brand created successfully', 'success', 3000);
            this.GetBrandsFun();
          } else {
            this.notificationService.show(response.error || 'Failed to create brand', 'error', 3000);
          }
        },
        error: (error: any) => {
          console.error('Create failed', error);
        }
      });
    } else {
      this.createBrandForm.markAllAsTouched();
    }
  }

  updateBrand() {
    if (this.updateBrandForm.valid) {
      const name = this.updateBrandForm.get('Name')?.value;
      const data = { id: this.currentBrandId, name: name };

      this.adminService.addVehicleBrand(data).subscribe({
        next: (response: any) => {
          if (response.status === 200 || response.status === 201) {
            this.closeModal();
            this.notificationService.show(response.message || 'Brand updated successfully', 'success', 3000);
            this.GetBrandsFun();
          } else {
            this.notificationService.show(response.error || 'Failed to update brand', 'error', 3000);
          }
        },
        error: (error: any) => {
          console.error('Update failed', error);
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
          this.brandList = response.data.items || response.data || [];
          this.totalRecords = response.data.total_count || response.data.total || this.brandList.length;
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
