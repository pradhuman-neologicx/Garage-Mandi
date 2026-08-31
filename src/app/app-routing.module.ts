import { HomeComponent } from './website/home/home.component';
import { AboutComponent } from './website/about/about.component';
import { ContactComponent } from './website/contact/contact.component';
import { PrivacyComponent } from './website/privacy/privacy.component';
import { TermsComponent } from './website/terms/terms.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { ForgotPasswordComponent } from './admin/loginpages/forgot-password/forgot-password.component';
import { SigninComponent } from './admin/loginpages/signin/signin.component';
import { LoginpagesComponent } from './admin/loginpages/loginpages.component';
import { OtpComponent } from './admin/loginpages/otp/otp.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { ViewProfileComponent } from './admin/user-management/view-profile/view-profile.component';
import { AuthGuard } from './core/auth/auth-guard';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { SubscriptionManagementComponent } from './admin/subscription-management/subscription-management.component';
import { FeedbacksComponent } from './admin/feedbacks/feedbacks.component';
import { RequestsComponent } from './admin/requests/requests.component';
import { ReferralTrackingComponent } from './admin/referral-tracking/referral-tracking.component';
import { MastersComponent } from './admin/masters/masters.component';
import { DepartmentComponent } from './admin/masters/department/department.component';
import { CategoryManagementComponent } from './admin/category-management/category-management.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'contact',
    component: ContactComponent,
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
  },
  {
    path: 'terms',
    component: TermsComponent,
  },
  {
    path: '',
    component: LoginpagesComponent,
    children: [
      { path: 'sign_in', component: SigninComponent },
      { path: 'reset-password/:id/:token', component: OtpComponent },
      { path: 'forgot_password', component: ForgotPasswordComponent },
    ],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
      },

      {
        path: 'user-management',

        component: UserManagementComponent,
        canActivate: [AuthGuard],
        children: [
          { path: '', redirectTo: 'user-management', pathMatch: 'full' },

          {
            path: 'view-profile/:id',
            component: ViewProfileComponent,
          },
        ],
      },

      {
        path: 'subscription-management',
        component: SubscriptionManagementComponent,
        canActivate: [AuthGuard],
      },

      {
        path: 'feedback-monitoring',
        component: FeedbacksComponent,
        canActivate: [AuthGuard],
      },

      {
        path: 'requests-monitoring',
        component: RequestsComponent,
        canActivate: [AuthGuard],
      },

      {
        path: 'referral-tracking',
        component: ReferralTrackingComponent,
        canActivate: [AuthGuard],
      },

      {
        path: 'category-management',
        component: CategoryManagementComponent,
        canActivate: [AuthGuard],
      },

      {
        path: 'master',
        component: MastersComponent,
        canActivate: [AuthGuard],
        children: [
          { path: '', redirectTo: 'department', pathMatch: 'full' },
          {
            path: 'department',
            component: DepartmentComponent,
          },
        ],
      },
      {
        path: 'vehicle-brands',
        loadComponent: () => import('./admin/vechicle-brand/vechicle-brand.component').then(m => m.VechicleBrandComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'business-categories',
        loadComponent: () => import('./admin/business-categories/business-categories.component').then(m => m.BusinessCategoriesComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'tags-master',
        loadComponent: () => import('./admin/tags-master/tags-master.component').then(m => m.TagsMasterComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'vehicle-resale',
        loadComponent: () => import('./admin/vehicle-resale/vehicle-resale.component').then(m => m.VehicleResaleComponent),
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
