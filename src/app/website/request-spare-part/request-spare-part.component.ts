import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { CustomerService } from '../../core/services/customer.service';
import { JwtService } from 'src/app/core/services/jwt.service';

@Component({
  selector: 'app-request-spare-part',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './request-spare-part.component.html',
  styleUrl: './request-spare-part.component.scss'
})
export class RequestSparePartComponent implements OnInit {
  requestForm!: FormGroup;
  vehicleCategories: any[] = [];
  spareParts: any[] = [];
  selectedFiles: File[] = [];

  isLoadingCategories = false;
  isLoadingSpareParts = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  backLink = '/request-quote';

  isSparePartDropdownOpen = false;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private jwtService: JwtService,
    private router: Router,
    private el: ElementRef
  ) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isSparePartDropdownOpen = false;
    }
  }

  toggleSparePartDropdown(event: Event) {
    event.stopPropagation();
    this.isSparePartDropdownOpen = !this.isSparePartDropdownOpen;
  }

  selectSparePart(part: any) {
    this.requestForm.get('spare_part_id')?.setValue(part.id);
    this.isSparePartDropdownOpen = false;
  }

  get selectedSparePartName(): string {
    const id = this.requestForm.get('spare_part_id')?.value;
    if (!id) return 'Select a part type';
    const part = this.spareParts.find(p => p.id == id);
    return part ? part.name : 'Select a part type';
  }

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
      spare_part_id: ['', Validators.required],
      part_condition: ['', Validators.required], // 1 for New, 0 for Second-hand
      part_name: ['', Validators.required],
      vehicle_model: ['', Validators.required],
      requirement_title: ['', [Validators.required, Validators.maxLength(100)]],
      requirement_description: ['', [Validators.required, Validators.maxLength(500)]],
      location: ['', Validators.required]
    });

    // Listen for category changes to load spare parts
    this.requestForm.get('vehicle_category_id')?.valueChanges.subscribe(categoryId => {
      if (categoryId) {
        this.fetchSpareParts(categoryId);
        // Reset spare part selection
        this.requestForm.get('spare_part_id')?.setValue('');
      } else {
        this.spareParts = [];
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

  fetchSpareParts(categoryId: string | number) {
    this.isLoadingSpareParts = true;
    this.customerService.getSpareParts(categoryId).subscribe({
      next: (res: any) => {
        this.spareParts = res.data || [];
        this.isLoadingSpareParts = false;
      },
      error: (err) => {
        console.error('Error fetching spare parts:', err);
        this.isLoadingSpareParts = false;
      }
    });
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
    const formValues = this.requestForm.value;

    // Append simple values
    Object.keys(formValues).forEach(key => {
      formData.append(key, formValues[key]);
    });

    // Append files
    this.selectedFiles.forEach((file) => {
      formData.append('media[]', file);
    });

    this.customerService.createSparePartRequest(formData).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.successMessage = 'Spare part request created successfully!';
        setTimeout(() => {
          this.router.navigate(['/my-requests']);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.log(err)

        let errorMsg = err || 'Failed to create request. Please try again.';

        this.errorMessage = errorMsg;
      }
    });
  }
}
