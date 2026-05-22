import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { JwtService } from '../services/jwt.service';

@Injectable({
  providedIn: 'root'
})
export class StudentAuthGuard implements CanActivate {

  constructor(private authService: JwtService,private router: Router,) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // return this.authService.getisLoggedIn();
    if (this.authService.getstudentLoggedIn()) {
        return true; // User is authenticated, allow access
     } else {
        // User is not authenticated, redirect to the login page or another route
        this.router.navigate(["/student_sign_in"]); // Adjust the route as needed
        return false;
     }
  }
}