import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from 'src/app/core/services/Employee.service';
import { JwtService } from 'src/app/core/services/jwt.service';
import { LoginService } from 'src/app/core/services/login.service';
import { NotificationService } from 'src/app/core/services/notificationnew.service';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-department',
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
  templateUrl: './department.component.html',
  styleUrl: './department.component.scss',
  animations: [
    trigger('succesfullyMesaage', [
      state(
        'void',
        style({
          transform: 'translateX(-30%)',
          opacity: 0,
        }),
      ),
      transition(':enter, :leave', [
        animate('0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55)'),
      ]),
    ]),
    trigger('slideIn', [
      state(
        'void',
        style({
          transform: 'translateX(100%)',
          opacity: 0,
        }),
      ),
      transition(':enter', [
        animate(
          '0.5s ease-out',
          style({
            transform: 'translateX(0)', // Final position for slide-in effect
            opacity: 1, // Final opacity
          }),
        ),
      ]),
    ]),

    trigger('fadeIn', [
      state(
        'void',
        style({
          opacity: 0,
          transform: 'scale(0.5)', // Start with smaller size
        }),
      ),
      transition(':enter', [
        animate(
          '0.5s ease-out',
          style({
            opacity: 1,
            transform: 'scale(1)', // Final size
          }),
        ),
      ]),
    ]),
  ],
})
export class DepartmentComponent {
  showreset: boolean = false; // Reintroduced for reset button visibility
  searchbarform!: FormGroup;
  createDepartmentForm!: FormGroup;
  updateDepartmentForm!: FormGroup;
  viewDepartmentForm!: FormGroup;
  tableSize: any = 10;
  tableSizes: any = [10, 20, 50, 100, 'all'];
  totalRecords: any;
  page: number = 1;
  createDepartmentOpen: boolean = false;
  updateDepartmentOpen: boolean = false;
  viewDepartmentOpen: boolean = false;

  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.GetDepartmentFun();
  }

  constructor(
    private formBuilder: FormBuilder,
    private employeeService: EmployeeService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
    private loginService: LoginService,
  ) {}

  searchfun() {
    if (this.searchbarform.valid) {
      this.showreset = true; // Show reset button when search is performed
      this.GetDepartmentFun();
    } else {
      this.searchbarform.markAllAsTouched();
    }
  }

  resetsearchbar() {
    this.searchbarform.get('searchbar')?.reset(); // Clear the search input
    this.showreset = false; // Hide reset button
    this.page = 1; // Reset to first page
    this.GetDepartmentFun(); // Reload data without search
  }
  uuserId: any;
  ngOnInit(): void {
    this.uuserId = this.jwtService.getpanelUserId();
    this.searchbarform = this.formBuilder.group({
      searchbar: ['', [Validators.required]],
    });

    this.createDepartmentForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
    });

    this.updateDepartmentForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
    });

    this.viewDepartmentForm = this.formBuilder.group({
      Name: [''],
    });
    this.GetDepartmentFun();
  }

  departmentList: any;
  table_heading = [
    {
      heading0: 'Serial No.',
      heading1: 'Name',
      heading2: 'Status',
      heading3: 'Action',
    },
  ];

  OpenEditModal(user: any): void {
    this.currentDepartmentId = user.id;
    this.updateDepartmentOpen = true;
    // this.updateDepartmentForm.patchValue({ Name: user.name });
    this.GetupdateDepartmentbyid(this.currentDepartmentId);
  }

  currentDepartmentId: any;
  openviewModal(user: any): void {
    this.viewDepartmentOpen = true;
    this.currentDepartmentId = user.id;
    this.viewDepartmentForm.patchValue({ Name: user.name });
  }

  mockDepartments: any[] = [
    { id: '1', name: 'IT Department', is_active: 1 },
    { id: '2', name: 'Human Resources', is_active: 1 },
    { id: '3', name: 'Operations', is_active: 0 },
    { id: '4', name: 'Sales & Marketing', is_active: 1 },
    { id: '5', name: 'Finance', is_active: 1 },
    { id: '6', name: 'Quality Assurance', is_active: 1 },
    { id: '7', name: 'Customer Support', is_active: 0 },
    { id: '8', name: 'R&D', is_active: 1 },
    { id: '9', name: 'Logistics', is_active: 1 },
    { id: '10', name: 'Legal', is_active: 1 },
  ];

  GetupdateDepartmentbyid(userId: any) {
    // Mock implementation
    const department = this.mockDepartments.find((d) => d.id === userId);
    if (department) {
      this.fillformdate(department);
    }

    /*
    this.employeeService
      .getDepartmentbyID(userId)
      .subscribe((response: any) => {
        if (response.status === 200) {
          this.fillformdate(response.data);
        }
      });
    */
  }

  async fillformdate(response: any) {
    this.updateDepartmentForm = this.formBuilder.group({
      Name: [response.name, [Validators.required, Validators.minLength(2)]],
    });
  }
  updateDepartment() {
    if (this.updateDepartmentForm.valid) {
      const name = this.updateDepartmentForm.get('Name')?.value;

      // Mock update logic
      const index = this.mockDepartments.findIndex(
        (d) => d.id === this.currentDepartmentId,
      );
      if (index !== -1) {
        this.mockDepartments[index].name = name;
        this.closeModal();
        this.notificationService.show(
          'Department updated successfully',
          'success',
          3000,
        );
        this.GetDepartmentFun();
      }

      /*
      const formData = new FormData();
      formData.append('name', name);
      formData.append('_method', 'put');

      this.employeeService
        .updateDepartment(formData, this.currrentClubId)
        .subscribe({
          next: (response: any) => {
            if (response.status === 200 || response.status === 201) {
              this.closeModal();
              this.notificationService.show(response.message, 'success', 3000);
              this.ngOnInit();
            } else {
              this.notificationService.show(response.error, 'error', 3000);
            }
          },
          error: (error: any) => {
            console.error('Update failed', error);
          },
        });
      */
    } else {
      this.updateDepartmentForm.markAllAsTouched();
    }
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.GetDepartmentFun();
  }

  closeModal() {
    this.updateDepartmentOpen = false;
    this.createDepartmentOpen = false;
    this.viewDepartmentOpen = false;
    this.createDepartmentForm.reset();
  }

  openAddModal() {
    this.createDepartmentOpen = true;
  }
  errorMessage: any;
  createDepartment() {
    if (this.createDepartmentForm.valid) {
      const name = this.createDepartmentForm.get('Name')?.value;

      // Mock create logic
      const newId = (this.mockDepartments.length + 1).toString();
      this.mockDepartments.unshift({ id: newId, name: name, is_active: 1 });
      this.closeModal();
      this.notificationService.show(
        'Department created successfully',
        'success',
        3000,
      );
      this.GetDepartmentFun();

      /*
      const formData = new FormData();
      formData.append('name', name);
      this.employeeService.createDepartment(formData).subscribe({
        next: (response: any) => {
          if (response.status === 200 || response.status === 201) {
            this.closeModal();
            this.notificationService.show(response.message, 'success', 3000);
            this.ngOnInit();
          } else {
            this.notificationService.show(
              response.error || 'Something went wrong',
              'error',
              3000,
            );
          }
        },
        error: (error) => {
          this.errorMessage = error.message; // Display error message
          this.notificationService.show(this.errorMessage, 'error', 3000);
        },
      });
      */
    } else {
      this.createDepartmentForm.markAllAsTouched();
    }
  }

  GetDepartmentFun() {
    // Mock fetch logic with search and pagination
    const searchText = this.searchbarform
      .get('searchbar')
      ?.value?.toLowerCase();
    let filteredData = this.mockDepartments;

    if (searchText) {
      filteredData = this.mockDepartments.filter((d) =>
        d.name.toLowerCase().includes(searchText),
      );
    }

    this.totalRecords = filteredData.length;

    if (this.tableSize === 'all') {
      this.departmentList = filteredData;
    } else {
      const startIndex = (this.page - 1) * this.tableSize;
      const endIndex = startIndex + this.tableSize;
      this.departmentList = filteredData.slice(startIndex, endIndex);
    }

    /*
    this.employeeService
      .GetDepartmentAPi(
        this.tableSize,
        this.page,
        this.searchbarform.get('searchbar')?.value,
      )
      .subscribe((response: any) => {
        if (response.status === 200) {
          this.examCategory = response.data.records;
          this.totalRecords = response.data.total;
        }
      });
    */
  }

  async Status(id: string, status: any) {
    // Mock status toggle logic
    const index = this.mockDepartments.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.mockDepartments[index].is_active = status;
      this.notificationService.show(
        `Department ${status ? 'activated' : 'deactivated'} successfully`,
        'success',
        2000,
      );
      this.GetDepartmentFun();
    }

    /*
    this.employeeService.changestatus(id, status).subscribe((response: any) => {
      if (response.status === 200) {
        this.ngOnInit();
      }
    });
    */
  }
}
