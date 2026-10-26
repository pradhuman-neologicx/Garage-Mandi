import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { CustomerService } from 'src/app/core/services/customer.service';
import { JwtService } from 'src/app/core/services/jwt.service';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './customer-profile.component.html',
  styleUrl: './customer-profile.component.scss'
})
export class CustomerProfileComponent implements OnInit {
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
  address = '';
  pincode = '';
  
  profileImage: File | null = null;
  profileImageUrl: string | ArrayBuffer | null = null;

  summary = {
    total_vehicles: 0,
    total_requests: 0,
    total_quotes: 0
  };

  isLoading = false;
  isSaving = false;

  // Change Password state
  showPasswordModal = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  isChangingPassword = false;

  constructor(
    private customerService: CustomerService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.jwtService.getCustomerIsLoggedIn()) {
      this.router.navigate(['/customer-login']);
      return;
    }
    this.fetchStates();
    this.fetchProfile();
  }

  fetchStates() {
    this.customerService.getStates().subscribe({
      next: (res: any) => {
        this.states = res.data || res;
      },
      error: (err) => console.error('Failed to fetch states', err)
    });
  }

  onStateChange(fetchDependencies = false) {
    if (!fetchDependencies) {
      this.selectedDistrict = '';
      this.selectedCity = '';
    }
    this.districts = [];
    this.cities = [];
    
    if (this.selectedState) {
      this.customerService.getDistricts(this.selectedState).subscribe({
        next: (res: any) => {
          this.districts = res.data || res;
          if (fetchDependencies && this.selectedDistrict) {
            this.onDistrictChange(true);
          }
        },
        error: (err) => console.error('Failed to fetch districts', err)
      });
    }
  }

  onDistrictChange(fetchDependencies = false) {
    if (!fetchDependencies) {
      this.selectedCity = '';
    }
    this.cities = [];
    if (this.selectedDistrict) {
      this.customerService.getCities(this.selectedDistrict).subscribe({
        next: (res: any) => {
          this.cities = res.data || res;
        },
        error: (err) => console.error('Failed to fetch cities', err)
      });
    }
  }

  fetchProfile() {
    this.isLoading = true;
    this.customerService.getCustomerProfile().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.data) {
          const user = res.data.user || {};
          const profile = res.data.profile || {};
          this.summary = res.data.summary || { total_vehicles: 0, total_requests: 0, total_quotes: 0 };

          this.fullName = user.name || '';
          this.email = user.email || '';
          this.username = user.username || '';
          this.phone_number = user.phone_number || '';
          
          this.address = profile.address || '';
          this.pincode = profile.pincode || '';
          
          if (profile.profile_image) {
             this.profileImageUrl = profile.profile_image;
          }
          
          this.selectedState = profile.state_id || '';
          this.selectedDistrict = profile.district_id || '';
          this.selectedCity = profile.city_id || '';
          
          if (this.selectedState) {
            this.onStateChange(true);
          }
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.notificationService.show('Failed to load profile', 'error');
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profileImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImageUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.notificationService.show('Please fill all required fields correctly.', 'error');
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    this.isSaving = true;
    const formData = new FormData();
    formData.append('name', this.fullName);
    formData.append('email', this.email);
    formData.append('username', this.username);
    formData.append('phone_number', this.phone_number);
    formData.append('address', this.address);
    formData.append('pincode', this.pincode);
    
    if (this.selectedState) formData.append('state_id', this.selectedState.toString());
    if (this.selectedDistrict) formData.append('district_id', this.selectedDistrict.toString());
    if (this.selectedCity) formData.append('city_id', this.selectedCity.toString());
    
    if (this.profileImage) {
      formData.append('profile_image', this.profileImage);
    }

    this.customerService.updateCustomerProfile(formData).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        this.profileImage = null; // Reset file selection
        
        this.notificationService.show(res?.message || 'Profile updated successfully', 'success');
        
        // Re-fetch profile for latest data (including server-processed image URL)
        this.fetchProfile();
      },
      error: (err: any) => {
        this.isSaving = false;
        // this.notificationService.show(err.message || 'Failed to update profile', 'error');
      }
    });
  }

  // Password Modal Methods
  openPasswordModal(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
    this.isChangingPassword = false;
    this.showPasswordModal = true;
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
  }

  submitPasswordChange(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.notificationService.show('Please fill in all fields', 'error');
      return;
    }
    if (this.newPassword.length < 6) {
      this.notificationService.show('New password must be at least 6 characters long', 'error');
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
}
