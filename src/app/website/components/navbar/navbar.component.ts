import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CustomerService } from 'src/app/core/services/customer.service';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

import { JwtService } from 'src/app/core/services/jwt.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  isMobileMenuOpen = false;
  isScrolled = false;
  isHomePage = true;
  isLoggedIn = false;
  isProfileMenuOpen = false;
  userRoleSlug = '';

  constructor(
    private router: Router, 
    private jwtService: JwtService,
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isHomePage = event.urlAfterRedirects === '/' || event.urlAfterRedirects === '/home';
      this.checkLoginStatus();
    });
    // Initial check
    this.isHomePage = this.router.url === '/' || this.router.url === '/home';
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    this.isLoggedIn = this.jwtService.getCustomerIsLoggedIn();
    if (this.isLoggedIn) {
      const role = this.jwtService.getCustomerRole();
      this.userRoleSlug = role ? role.slug : '';
    } else {
      this.userRoleSlug = '';
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout() {
    this.customerService.logout().subscribe({
      next: (res: any) => {
        this.jwtService.clearCustomerStorage();
        this.isLoggedIn = false;
        this.isProfileMenuOpen = false;
        
        if (res && res.message) {
          this.notificationService.show(res.message, 'success');
        } else {
          this.notificationService.show('Logged out successfully', 'success');
        }
        
        this.router.navigate(['/customer-login']);
      },
      error: (err: any) => {
        // Even on error (e.g. token expired), we should clear local data
        this.jwtService.clearCustomerStorage();
        this.isLoggedIn = false;
        this.isProfileMenuOpen = false;
        this.router.navigate(['/customer-login']);
      }
    });
  }
}
