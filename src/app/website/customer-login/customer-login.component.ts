import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { CustomerService } from 'src/app/core/services/customer.service';
import { JwtService } from 'src/app/core/services/jwt.service';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './customer-login.component.html',
  styleUrl: './customer-login.component.scss'
})
export class CustomerLoginComponent {
  username = '';
  password = '';
  showPassword = false;
  isLoading = false;
  apiError = '';

  constructor(
    private customerService: CustomerService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  onSubmit(form: NgForm) {
    this.apiError = '';

    if (form.invalid) {
      this.notificationService.show('Please enter both username and password.', 'error');
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    const credentials = {
      username: this.username,
      password: this.password,

    };

    this.customerService.login(credentials).subscribe({
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
          this.notificationService.show('Login successful', 'success');
        }

        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.apiError = err.message || 'Invalid username or password.';
        console.error('Login error', err);
      }
    });
  }
}
