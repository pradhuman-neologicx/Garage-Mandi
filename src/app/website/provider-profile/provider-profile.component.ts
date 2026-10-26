import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from 'src/app/core/services/customer.service';
import { NotificationService } from 'src/app/core/services/notificationnew.service';
import { JwtService } from 'src/app/core/services/jwt.service';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-provider-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent, NgSelectModule],
  templateUrl: './provider-profile.component.html',
  styleUrl: './provider-profile.component.scss'

})
export class ProviderProfileComponent implements OnInit {
  profileData: any = null;
  isLoading = true;
  selectedImage: string | null = null;

  // Password Modal
  showPasswordModal = false;
  isChangingPassword = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Delete Modal
  showDeleteModal = false;

  // Edit Profile Modal
  showEditModal = false;
  isSaving = false;
  apiError = '';

  states: any[] = [];
  districts: any[] = [];
  cities: any[] = [];
  vehicleCategories: any[] = [];

  // Form Fields
  selectedState: any = '';
  selectedDistrict: any = '';
  selectedCity: any = '';

  fullName = '';
  username = '';
  phone_number = '';
  email = '';
  pincode = '';

  workshopName = '';
  longitude = '';
  latitude = '';
  workshopAddress = '';
  business_phone = '';

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

  selectedFile: File | null = null;
  selectedFiles: File[] = [];
  profileImagePreview: string | ArrayBuffer | null = null;
  galleryPreviews: (string | ArrayBuffer)[] = [];


  constructor(
    private customerService: CustomerService,
    private notificationService: NotificationService,
    private router: Router,
    private jwtService: JwtService
  ) {}

  ngOnInit(): void {
    this.fetchProfile();
    this.fetchStates();
    this.fetchVehicleCategories();
  }

  compareIds(item1: any, item2: any): boolean {
    if (item1 === null || item1 === undefined || item1 === '' || item2 === null || item2 === undefined || item2 === '') {
      return item1 === item2;
    }
    return String(item1) === String(item2);
  }

  fetchProfile() {
    this.isLoading = true;
    this.customerService.getProviderProfile().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.data) {
          this.profileData = res.data;
          console.log('Provider Profile Data:', this.profileData);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        // this.notificationService.show('Failed to fetch provider profile', 'error');
        console.error('Error fetching provider profile:', err);
      }
    });
  }

  openImage(url: string) {
    this.selectedImage = url;
  }

  closeImage() {
    this.selectedImage = null;
  }


  openEditModal() {
    this.showEditModal = true;
    this.apiError = '';

    if (this.profileData) {
      this.fullName = this.profileData.name || '';
      this.username = this.profileData.username || '';
      this.phone_number = this.profileData.phone_number || '';
      this.email = this.profileData.email || '';
      
      const sp = this.profileData.service_provider_profile || {};
      this.business_phone = sp.business_phone || this.phone_number;
      this.workshopName = sp.business_name || '';
      this.workshopAddress = sp.business_address || '';
      this.latitude = sp.latitude || '';
      this.longitude = sp.longitude || '';
      this.pincode = sp.pincode || '';

      this.acceptServiceRequest = sp.is_service_available == 1;
      this.oldSpareParts = sp.spare_parts_old == 1;
      this.newSpareParts = sp.spare_parts_new == 1;

      this.selectedBusinessType = [];
      if (sp.is_service_provider == 1) this.selectedBusinessType.push('service_provider');
      if (sp.is_spare_part_seller == 1) this.selectedBusinessType.push('spare_part_seller');
      if (sp.is_vehicle_reseller == 1) this.selectedBusinessType.push('vehicle_reseller');

      this.selectedBusinessCategories = sp.business_category?.map((bc: any) => Number(bc.id)) || sp.business_category_id?.map((id: any) => Number(id)) || [];
      this.selectedTags = sp.tags?.map((t: any) => Number(t.id)) || sp.tag_id?.map((id: any) => Number(id)) || [];

      // Service Offered (Vehicle Category) - Read Only
      const rawVehId = sp.vehicle_category?.[0]?.id ?? sp.vehicle_category_id?.[0] ?? '';
      if (rawVehId && this.vehicleCategories && this.vehicleCategories.length > 0) {
        const found = this.vehicleCategories.find((vc: any) => String(vc.id) === String(rawVehId));
        this.selectedVehicleCategory = found ? found.id : (isNaN(Number(rawVehId)) ? rawVehId : Number(rawVehId));
      } else {
        this.selectedVehicleCategory = rawVehId ? (isNaN(Number(rawVehId)) ? rawVehId : Number(rawVehId)) : '';
      }

      if (this.selectedBusinessType.length > 0) {
        this.onBusinessTypeChange();
      } else if (this.selectedVehicleCategory) {
        this.fetchTags();
      }

      this.profileImagePreview = sp.image_url || null;
      this.galleryPreviews = sp.gallery?.map((g: any) => g.image_url) || [];
      this.selectedFile = null;
      this.selectedFiles = [];

      // State, District, City prefill with dependency chain
      this.selectedState = sp.state_id !== null && sp.state_id !== undefined ? sp.state_id : '';
      this.selectedDistrict = sp.district_id !== null && sp.district_id !== undefined ? sp.district_id : '';
      this.selectedCity = sp.city_id !== null && sp.city_id !== undefined ? sp.city_id : '';

      this.ensureStatesLoaded(() => {
        if (this.selectedState) {
          this.onStateChange(true);
        }
      });
    }
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  fetchStates(callback?: () => void) {
    this.customerService.getStates().subscribe({
      next: (res: any) => {
        this.states = res.data || res;
        if (callback) callback();
      },
      error: (err: any) => {
        console.error('Failed to fetch states', err);
        if (callback) callback();
      }
    });
  }

  ensureStatesLoaded(callback?: () => void) {
    if (this.states && this.states.length > 0) {
      if (callback) callback();
    } else {
      this.fetchStates(callback);
    }
  }

  onStateChange(fetchDependencies = false) {
    if (!fetchDependencies) {
      this.selectedDistrict = '';
      this.selectedCity = '';
      this.districts = [];
      this.cities = [];
    }
    if (this.selectedState) {
      this.customerService.getDistricts(this.selectedState).subscribe({
        next: (res: any) => {
          this.districts = res.data || res;
          if (fetchDependencies && this.selectedDistrict) {
            this.onDistrictChange(true);
          }
        },
        error: (err: any) => console.error('Failed to fetch districts', err)
      });
    } else {
      this.districts = [];
      this.cities = [];
    }
  }

  onDistrictChange(fetchDependencies = false) {
    if (!fetchDependencies) {
      this.selectedCity = '';
      this.cities = [];
    }
    if (this.selectedDistrict) {
      this.customerService.getCities(this.selectedDistrict).subscribe({
        next: (res: any) => {
          this.cities = res.data || res;
        },
        error: (err: any) => console.error('Failed to fetch cities', err)
      });
    } else {
      this.cities = [];
    }
  }

  fetchVehicleCategories(callback?: () => void) {
    this.customerService.getVehicleCategoriesPublic().subscribe({
      next: (res: any) => {
        this.vehicleCategories = res.data || res;
        if (this.profileData && !this.selectedVehicleCategory) {
          const sp = this.profileData.service_provider_profile || {};
          const rawVehId = sp.vehicle_category?.[0]?.id ?? sp.vehicle_category_id?.[0] ?? '';
          if (rawVehId) {
            const found = this.vehicleCategories.find((vc: any) => String(vc.id) === String(rawVehId));
            this.selectedVehicleCategory = found ? found.id : (isNaN(Number(rawVehId)) ? rawVehId : Number(rawVehId));
          }
        }
        if (callback) callback();
      },
      error: (err: any) => {
        console.error('Failed to fetch vehicle categories', err);
        if (callback) callback();
      }
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
    this.tags = [];
    if (this.selectedBusinessType && this.selectedBusinessType.length > 0) {
      const types = this.selectedBusinessType.join(',');
      this.customerService.getBusinessCategories(types).subscribe({
        next: (res: any) => {
          const data = res.data || res;
          this.businessCategories = data.map((c: any) => {
            const matchedType = this.businessTypes.find((t: any) => t.value === c.business_type);
            c.business_type_label = matchedType ? matchedType.label : c.business_type;
            return c;
          });
          this.fetchTags();
        },
        error: (err: any) => console.error('Failed to fetch business categories', err)
      });
    }
  }

  fetchTags() {
    this.tags = [];
    const types = (this.selectedBusinessType || []).join(',');
    const vehicleCat = this.selectedVehicleCategory || '';
    const categories = (this.selectedBusinessCategories || []).join(',');
    
    if (types || vehicleCat || categories) {
      this.customerService.getTags(types, vehicleCat, categories).subscribe({
        next: (res: any) => {
          const data = res.data || res;
          this.tags = data.map((t: any) => {
            const matchedType = this.businessTypes.find((bt: any) => bt.value === t.business_type);
            t.business_type_label = matchedType ? matchedType.label : t.business_type;
            return t;
          });
        },
        error: (err: any) => console.error('Failed to fetch tags', err)
      });
    }
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
    const remainingSlots = 3 - this.galleryPreviews.length;
    if (newFiles.length > remainingSlots) {
      this.notificationService.show(`You can only upload up to 3 gallery images. Adding the first ${remainingSlots} images.`, 'error');
      newFiles = newFiles.slice(0, remainingSlots);
    }
    this.selectedFiles = [...this.selectedFiles, ...newFiles];
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        if (reader.result) {
          this.galleryPreviews.push(reader.result);
        }
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  }

  removeProfileImage() {
    this.selectedFile = null;
    this.profileImagePreview = null;
  }

  removeGalleryImage(index: number) {
    if (index >= (this.galleryPreviews.length - this.selectedFiles.length)) {
        const fileIndex = index - (this.galleryPreviews.length - this.selectedFiles.length);
        this.selectedFiles.splice(fileIndex, 1);
    }
    this.galleryPreviews.splice(index, 1);
  }

  submitEditProfile(form: NgForm) {
    if (form.invalid) {
      this.notificationService.show('Please fill all required fields correctly.', 'error');
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    this.isSaving = true;
    const isServiceProvider = (this.selectedBusinessType || []).includes('service_provider') ? 1 : 0;
    const isSparePartSeller = (this.selectedBusinessType || []).includes('spare_part_seller') ? 1 : 0;
    const isVehicleReseller = (this.selectedBusinessType || []).includes('vehicle_reseller') ? 1 : 0;

    const formData = new FormData();
    formData.append('name', this.fullName);
    formData.append('phone_number', this.phone_number);
    formData.append('business_phone', this.business_phone || this.phone_number);
    formData.append('email', this.email);
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
    
    if (this.selectedBusinessCategories && this.selectedBusinessCategories.length > 0) {
        this.selectedBusinessCategories.forEach((id: any, index: number) => {
            formData.append(`business_category_id[${index}]`, id.toString());
        });
    }
    
    if (this.selectedTags && this.selectedTags.length > 0) {
        this.selectedTags.forEach((id: any, index: number) => {
            formData.append(`tag_id[${index}]`, id.toString());
        });
    }
    
    formData.append('is_service_available', this.acceptServiceRequest ? '1' : '0');
    formData.append('spare_parts_old', this.oldSpareParts ? '1' : '0');
    formData.append('spare_parts_new', this.newSpareParts ? '1' : '0');

    if (this.selectedFiles && this.selectedFiles.length > 0) {
      this.selectedFiles.forEach((file: File) => {
        formData.append('gallery[]', file);
      });
    }
    if (this.selectedFile) {
      formData.append('profile_image', this.selectedFile); // Updated key
    }

    this.customerService.updateProviderProfile(formData).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        this.notificationService.show(res.message || 'Profile updated successfully!', 'success');
        this.fetchProfile();
        this.closeEditModal();
      },
      error: (err: any) => {
        this.isSaving = false;
        // this.notificationService.show(err.error?.message || 'Failed to update profile', 'error');
        console.error('Update error', err);
      }
    });
  }


  // Password Change Logic
  changePassword() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
    this.isChangingPassword = false;
    this.showPasswordModal = true;
  }

  closePasswordModal() {
    this.showPasswordModal = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
    this.isChangingPassword = false;
  }

  submitPasswordChange() {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.notificationService.show('Please fill in all fields', 'error');
      return;
    }
    if (this.newPassword.length < 8) {
      this.notificationService.show('New password must be at least 8 characters long', 'error');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.notificationService.show('New password and confirm password do not match', 'error');
      return;
    }

    this.isChangingPassword = true;
    const payload = {
      current_password: this.currentPassword,
      new_password: this.newPassword,
      new_password_confirmation: this.confirmPassword
    };

    this.customerService.changePasswordAuth(payload).subscribe({
      next: (res: any) => {
        this.isChangingPassword = false;
        if (res.status === 200 || res.success || (res.message && res.message.toLowerCase().includes('success'))) {
          this.notificationService.show(res.message || 'Password changed successfully!', 'success');
          this.closePasswordModal();
        } else {
          this.notificationService.show(res.message || 'Failed to change password', 'error');
        }
      },
      error: (err: any) => {
        this.isChangingPassword = false;
        // this.notificationService.show(err.error?.message || err.message || 'Failed to change password', 'error');
      }
    });
  }

  // Delete Account Logic
  deleteAccount() {
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDeleteAccount() {
    if (!this.profileData || !this.profileData.id) {
       this.notificationService.show('User data not found.', 'error');
       return;
    }
    this.customerService.deactivateAccount(this.profileData.id).subscribe({
      next: (res: any) => {
        this.notificationService.show('Account deactivated successfully.', 'success');
        this.closeDeleteModal();
        // Logout user
        this.jwtService.clearCustomerStorage();
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        // this.notificationService.show(err.error?.message || 'Failed to deactivate account', 'error');
      }
    });
  }
}
