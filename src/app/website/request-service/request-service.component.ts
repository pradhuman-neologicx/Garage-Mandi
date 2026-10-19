import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { CustomerService } from '../../core/services/customer.service';
import { JwtService } from 'src/app/core/services/jwt.service';

@Component({
  selector: 'app-request-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './request-service.component.html',
  styleUrl: './request-service.component.scss'
})
export class RequestServiceComponent implements OnInit {
  requestForm!: FormGroup;
  vehicleCategories: any[] = [];
  serviceTypes: any[] = [];
  selectedFiles: File[] = [];
  
  isLoadingCategories = false;
  isLoadingServiceTypes = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  backLink = '/request-quote';

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private jwtService: JwtService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initBackLink();
    this.initForm();
    this.fetchVehicleCategories();
  }

  initBackLink() {
    try {
      const role = this.jwtService.getCustomerRole();
      const roleName = (role?.name || '').toLowerCase();
      const roleSlug = (role?.slug || '').toLowerCase();
      const sp = this.jwtService.getServiceProvider();

      if (roleName.includes('service provider') || roleSlug.includes('service-provider') || (sp && (sp.id || sp.is_service_provider))) {
        this.backLink = '/workshop-operations';
      } else {
        this.backLink = '/request-quote';
      }
    } catch (_) {
      this.backLink = '/request-quote';
    }
  }

  initForm() {
    this.requestForm = this.fb.group({
      vehicle_category_id: ['', Validators.required],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      service_type_id: this.fb.array([], Validators.required)
    });

    // Listen for category changes to load service types
    this.requestForm.get('vehicle_category_id')?.valueChanges.subscribe(categoryId => {
      if (categoryId) {
        this.fetchServiceTypes(categoryId);
        // Reset service types selection
        const serviceTypeArray = this.requestForm.get('service_type_id') as FormArray;
        serviceTypeArray.clear();
      } else {
        this.serviceTypes = [];
      }
    });
  }

  fetchVehicleCategories() {
    this.isLoadingCategories = true;
    this.customerService.getVehicleCategories().subscribe({
      next: (res: any) => {
        this.vehicleCategories = res.data || [];
        this.isLoadingCategories = false;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.isLoadingCategories = false;
      }
    });
  }

  fetchServiceTypes(categoryId: string | number) {
    this.isLoadingServiceTypes = true;
    this.customerService.getServiceTypes(categoryId).subscribe({
      next: (res: any) => {
        this.serviceTypes = res.data || [];
        this.isLoadingServiceTypes = false;
      },
      error: (err) => {
        console.error('Error fetching service types:', err);
        this.isLoadingServiceTypes = false;
      }
    });
  }

  onServiceTypeChange(e: any) {
    const serviceTypeArray = this.requestForm.get('service_type_id') as FormArray;
    if (e.target.checked) {
      serviceTypeArray.push(new FormControl(e.target.value));
    } else {
      let i: number = 0;
      serviceTypeArray.controls.forEach((item: any) => {
        if (item.value == e.target.value) {
          serviceTypeArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      for (let i = 0; i < event.target.files.length; i++) {
        this.selectedFiles.push(event.target.files[i]);
      }
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  onSubmit() {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('vehicle_category_id', this.requestForm.get('vehicle_category_id')?.value);
    formData.append('title', this.requestForm.get('title')?.value);
    formData.append('description', this.requestForm.get('description')?.value);

    // Append multiple service types
    const serviceTypeValues = this.requestForm.get('service_type_id')?.value;
    serviceTypeValues.forEach((id: string) => {
      formData.append('service_type_id[]', id);
    });

    // Append files
    this.selectedFiles.forEach((file) => {
      formData.append('media[]', file);
    });

    this.customerService.createServiceRequest(formData).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.successMessage = 'Service request created successfully!';
        setTimeout(() => {
          this.router.navigate(['/my-requests']);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        
        let errorMsg = err.error?.message || 'Failed to create request. Please try again.';
        
        if (err.error?.errors) {
          const firstErrorKey = Object.keys(err.error.errors)[0];
          if (firstErrorKey && err.error.errors[firstErrorKey].length > 0) {
            errorMsg = err.error.errors[firstErrorKey][0];
          }
        }
        
        this.errorMessage = errorMsg;
      }
    });
  }
}
