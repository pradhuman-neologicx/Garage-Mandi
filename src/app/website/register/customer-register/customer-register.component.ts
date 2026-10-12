import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CustomerService } from 'src/app/core/services/customer.service';
import { JwtService } from 'src/app/core/services/jwt.service';
import { NotificationService } from 'src/app/core/services/notificationnew.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './customer-register.component.html',
  styleUrl: './customer-register.component.scss'
})
export class CustomerRegisterComponent implements OnInit {
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
  address = '';

  isLoading = false;
  apiError = '';

  isEmailVerified = false;
  showOtpModal = false;
  otpValue = '';
  otpLoading = false;

  constructor(
    private customerService: CustomerService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchStates();
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
    
    // Simple email format check
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
    const payload = {
      name: this.fullName,
      phone_number: this.phone_number,
      email: this.email,
      password: this.password,
      address: this.address,
      state_id: this.selectedState,
      city_id: this.selectedCity,
      district_id: this.selectedDistrict,
      pincode: this.pincode,
      username: this.username
    };

    this.customerService.register(payload).subscribe({
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
