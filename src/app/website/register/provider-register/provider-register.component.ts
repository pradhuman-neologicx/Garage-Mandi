import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CustomerService } from 'src/app/core/services/customer.service';
import { JwtService } from 'src/app/core/services/jwt.service';
import { NotificationService } from 'src/app/core/services/notificationnew.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-provider-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent, NgSelectModule],
  templateUrl: './provider-register.component.html',
  styleUrl: './provider-register.component.scss'
})
export class ProviderRegisterComponent implements OnInit {
  states: any[] = [];
  districts: any[] = [];
  cities: any[] = [];

  selectedState: any = '';
  selectedDistrict: any = '';
  selectedCity: any = '';

  fullName = '';
  username = '';
  phone_number = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  pincode = '';

  // Workshop details
  workshopName = '';
  longitude = '';
  latitude = '';
  workshopAddress = '';

  vehicleCategories: any[] = [];
  selectedVehicleCategory: any = '';

  businessTypes = [
    { label: 'Service Provider', value: 'service_provider' },
    { label: 'Spare Part Seller', value: 'spare_part_seller' },
    { label: 'Vehicle Reseller', value: 'vehicle_reseller' },
  ];
  selectedBusinessType: any[] = [];
  businessCategories: any[] = [];
  selectedBusinessCategories: any[] = [];
  
  tags: any[] = [];
  selectedTags: any[] = [];

  acceptServiceRequest = false;
  oldSpareParts = false;
  newSpareParts = false;

  isLoading = false;
  apiError = '';

  isEmailVerified = false;
  showOtpModal = false;
  otpValue = '';
  otpLoading = false;

  selectedFile: File | null = null;
  selectedFiles: File[] = [];
  profileImagePreview: string | ArrayBuffer | null = null;
  galleryPreviews: (string | ArrayBuffer)[] = [];

  constructor(
    private customerService: CustomerService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchStates();
    this.fetchVehicleCategories();
  }

  fetchVehicleCategories() {
    this.customerService.getVehicleCategoriesPublic().subscribe({
      next: (res: any) => {
        this.vehicleCategories = res.data || res;
      },
      error: (err) => console.error('Failed to fetch vehicle categories', err)
    });
  }

  onVehicleCategoryChange() {
    this.fetchTags();
  }

  clearBusinessType(select: any) {
    this.selectedBusinessType = [];
    this.businessCategories = [];
    this.selectedBusinessCategories = [];
    this.tags = [];
    this.selectedTags = [];
    select.close();
  }

  applyBusinessType(select: any) {
    select.close();
    this.onBusinessTypeChange();
  }

  clearBusinessCategory(select: any) {
    this.selectedBusinessCategories = [];
    select.close();
  }

  applyBusinessCategory(select: any) {
    select.close();
    this.fetchTags();
  }

  onBusinessTypeChange() {
    this.businessCategories = [];
    this.selectedBusinessCategories = [];
    this.tags = [];
    this.selectedTags = [];
    if (this.selectedBusinessType && this.selectedBusinessType.length > 0) {
      const types = this.selectedBusinessType.join(',');
      this.customerService.getBusinessCategories(types).subscribe({
        next: (res: any) => {
          const data = res.data || res;
          this.businessCategories = data.map((c: any) => {
            const matchedType = this.businessTypes.find(t => t.value === c.business_type);
            c.business_type_label = matchedType ? matchedType.label : c.business_type;
            return c;
          });
        },
        error: (err) => console.error('Failed to fetch business categories', err)
      });
    }
  }

  fetchTags() {
    this.tags = [];
    this.selectedTags = [];
    const types = (this.selectedBusinessType || []).join(',');
    const vehicleCat = this.selectedVehicleCategory || '';
    const categories = (this.selectedBusinessCategories || []).join(',');
    
    if (types || vehicleCat || categories) {
      this.customerService.getTags(types, vehicleCat, categories).subscribe({
        next: (res: any) => {
          const data = res.data || res;
          this.tags = data.map((t: any) => {
            const matchedType = this.businessTypes.find(bt => bt.value === t.business_type);
            t.business_type_label = matchedType ? matchedType.label : t.business_type;
            return t;
          });
        },
        error: (err) => console.error('Failed to fetch tags', err)
      });
    }
  }

  fetchStates() {
    this.customerService.getStates().subscribe({
      next: (res: any) => {
        this.states = res.data || res;
      },
      error: (err) => console.error('Failed to fetch states', err)
    });
  }

  onStateChange() {
    this.districts = [];
    this.cities = [];
    this.selectedDistrict = '';
    this.selectedCity = '';
    if (this.selectedState) {
      this.customerService.getDistricts(this.selectedState).subscribe({
        next: (res: any) => {
          this.districts = res.data || res;
        },
        error: (err) => console.error('Failed to fetch districts', err)
      });
    }
  }

  onDistrictChange() {
    this.cities = [];
    this.selectedCity = '';
    if (this.selectedDistrict) {
      this.customerService.getCities(this.selectedDistrict).subscribe({
        next: (res: any) => {
          this.cities = res.data || res;
        },
        error: (err) => console.error('Failed to fetch cities', err)
      });
    }
  }

  sendOtp() {
    if (!this.email || this.email.trim() === '') {
      this.notificationService.show('Please enter your email first.', 'error');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.notificationService.show('Please enter a valid email address.', 'error');
      return;
    }

    this.otpLoading = true;
    this.customerService.sendEmailOtp(this.email).subscribe({
      next: (res: any) => {
        this.otpLoading = false;
        this.showOtpModal = true;
        this.notificationService.show(res.message || 'OTP sent successfully', 'success');
      },
      error: (err: any) => {
        this.otpLoading = false;
        this.notificationService.show(err.message || 'Failed to send OTP', 'error');
      }
    });
  }

  verifyOtp() {
    if (!this.otpValue || this.otpValue.trim() === '') {
      this.notificationService.show('Please enter the OTP.', 'error');
      return;
    }

    this.otpLoading = true;
    this.customerService.verifyEmailOtp(this.email, this.otpValue).subscribe({
      next: (res: any) => {
        this.otpLoading = false;
        this.isEmailVerified = true;
        this.showOtpModal = false;
        this.notificationService.show(res.message || 'Email verified successfully', 'success');
      },
      error: (err: any) => {
        this.otpLoading = false;
        this.notificationService.show(err.message || 'Invalid OTP', 'error');
      }
    });
  }

  closeOtpModal() {
    this.showOtpModal = false;
    this.otpValue = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => this.profileImagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  onFilesSelected(event: any) {
    let newFiles = Array.from(event.target.files) as File[];
    
    // Calculate how many more files we can add
    const remainingSlots = 3 - this.selectedFiles.length;
    
    if (newFiles.length > remainingSlots) {
      this.notificationService.show(`You can only upload up to 3 gallery images. Adding the first ${remainingSlots} images.`, 'error');
      newFiles = newFiles.slice(0, remainingSlots);
    }
    
    // Append new files
    this.selectedFiles = [...this.selectedFiles, ...newFiles];
    
    // Generate previews for the new files
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        if (reader.result) {
          this.galleryPreviews.push(reader.result);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset the input value so the same file can be selected again if needed
    event.target.value = '';
  }

  removeProfileImage() {
    this.selectedFile = null;
    this.profileImagePreview = null;
  }

  removeGalleryImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.galleryPreviews.splice(index, 1);
  }

  onSubmit(form: NgForm) {
    this.apiError = '';
    
    if (form.invalid) {
      this.notificationService.show('Please fill all required fields correctly.', 'error');
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.apiError = 'Passwords do not match.';
      return;
    }

    if (!this.isEmailVerified) {
      this.notificationService.show('Please verify your email address before registering.', 'error');
      return;
    }

    this.isLoading = true;
    const isServiceProvider = (this.selectedBusinessType || []).includes('service_provider') ? 1 : 0;
    const isSparePartSeller = (this.selectedBusinessType || []).includes('spare_part_seller') ? 1 : 0;
    const isVehicleReseller = (this.selectedBusinessType || []).includes('vehicle_reseller') ? 1 : 0;

    const formData = new FormData();
    formData.append('name', this.fullName);
    formData.append('phone_number', this.phone_number);
    formData.append('business_phone', this.phone_number);
    formData.append('email', this.email);
    formData.append('password', this.password);
    if(this.selectedState) formData.append('state_id', this.selectedState.toString());
    if(this.selectedCity) formData.append('city_id', this.selectedCity.toString());
    if(this.selectedDistrict) formData.append('district_id', this.selectedDistrict.toString());
    formData.append('pincode', this.pincode);
    formData.append('username', this.username);
    formData.append('business_name', this.workshopName);
    formData.append('business_address', this.workshopAddress);
    formData.append('latitude', this.latitude);
    formData.append('longitude', this.longitude);
    if(this.selectedVehicleCategory) formData.append('vehicle_category_id[0]', this.selectedVehicleCategory.toString());
    formData.append('is_service_provider', isServiceProvider.toString());
    formData.append('is_spare_part_seller', isSparePartSeller.toString());
    formData.append('is_vehicle_reseller', isVehicleReseller.toString());
    
    if (this.selectedBusinessCategories) {
        this.selectedBusinessCategories.forEach((id, index) => {
            formData.append(`business_category_id[${index}]`, id.toString());
        });
    }
    
    if (this.selectedTags) {
        this.selectedTags.forEach((id, index) => {
            formData.append(`tag_id[${index}]`, id.toString());
        });
    }
    
    formData.append('is_service_available', this.acceptServiceRequest ? '1' : '0');
    formData.append('spare_parts_old', this.oldSpareParts ? '1' : '0');
    formData.append('spare_parts_new', this.newSpareParts ? '1' : '0');

    if (this.selectedFiles && this.selectedFiles.length > 0) {
      this.selectedFiles.forEach((file) => {
        formData.append('gallery[]', file);
      });
    }
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.customerService.providerRegister(formData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        if (res && res.data) {
          const data = res.data;
          
          if (data.token) {
            this.jwtService.saveCustomerToken(data.token);
            this.jwtService.saveCustomerIsLoggedIn(true);
          }
          
          if (data.user) {
            this.jwtService.saveCustomerId(data.user.id);
            this.jwtService.saveCustomerName(data.user.name);
            this.jwtService.saveCustomerEmail(data.user.email);
            this.jwtService.saveCustomerUsername(data.user.username);
            this.jwtService.saveCustomerPhone(data.user.phone_number);
            
            if (data.user.role) {
              this.jwtService.saveCustomerRole(data.user.role);
            }
          }

          if (data.service_provider) {
            this.jwtService.saveServiceProvider(data.service_provider);
          }
        }

        if (res && res.message) {
          this.notificationService.show(res.message, 'success');
        } else {
          this.notificationService.show('Registration successful', 'success');
        }
        
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.apiError = err.message || 'Registration failed. Please try again.';
        console.error('Registration error', err);
      }
    });
  }
}
