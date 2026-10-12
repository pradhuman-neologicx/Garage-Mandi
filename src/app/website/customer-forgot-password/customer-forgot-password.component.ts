import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { CustomerService } from 'src/app/core/services/customer.service';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

@Component({
  selector: 'app-customer-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './customer-forgot-password.component.html',
  styleUrl: './customer-forgot-password.component.scss'
})
export class CustomerForgotPasswordComponent {
  step = 1; // 1: Email, 2: OTP, 3: Reset Password
  
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  
  isLoading = false;
  apiError = '';
  apiSuccess = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private customerService: CustomerService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  requestOtp(form: NgForm) {
    if (form.invalid) {
      this.notificationService.show('Please enter a valid email address.', 'error');
      Object.keys(form.controls).forEach(key => form.controls[key].markAsTouched());
      return;
    }

    this.isLoading = true;
    this.apiError = '';
    this.apiSuccess = '';
    
    this.customerService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.apiSuccess = res.message || 'OTP sent successfully to your email.';
        this.notificationService.show(res.message || 'OTP sent successfully to your email.', 'success');
        this.step = 2; // Move to OTP verification
      },
      error: (err: any) => {
        this.isLoading = false;
        this.apiError = err.error?.message || err.message || 'Failed to send OTP.';
      }
    });
  }

  verifyOtp(form: NgForm) {
    if (form.invalid) {
      this.notificationService.show('Please enter the OTP.', 'error');
      Object.keys(form.controls).forEach(key => form.controls[key].markAsTouched());
      return;
    }

    this.isLoading = true;
    this.apiError = '';
    this.apiSuccess = '';
    
    this.customerService.verifyPasswordOtp(this.email, this.otp).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.apiSuccess = res.message || 'OTP verified successfully.';
        this.notificationService.show(res.message || 'OTP verified successfully.', 'success');
        this.step = 3; // Move to Reset Password
      },
      error: (err: any) => {
        this.isLoading = false;
        this.apiError = err.error?.message || err.message || 'Invalid OTP.';
      }
    });
  }

  resetPassword(form: NgForm) {
    if (form.invalid || this.newPassword !== this.confirmPassword) {
      this.notificationService.show('Please provide a valid password and ensure both match.', 'error');
      Object.keys(form.controls).forEach(key => form.controls[key].markAsTouched());
      return;
    }

    this.isLoading = true;
    this.apiError = '';
    this.apiSuccess = '';
    
    const payload = {
      email: this.email,
      new_password: this.newPassword,
      new_password_confirmation: this.confirmPassword
    };

    this.customerService.resetPassword(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.notificationService.show(res.message || 'Password reset successfully.', 'success');
        this.router.navigate(['/customer-login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.apiError = err.error?.message || err.message || 'Failed to reset password.';
      }
    });
  }
}
