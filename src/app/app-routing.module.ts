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
    path: 'request-quote',
    loadComponent: () => import('./website/book-now/book-now.component').then(m => m.BookNowComponent),
  },
  {
    path: 'request-service',
    loadComponent: () => import('./website/request-service/request-service.component').then(m => m.RequestServiceComponent),
  },
  {
    path: 'request-spare-part',
    loadComponent: () => import('./website/request-spare-part/request-spare-part.component').then(m => m.RequestSparePartComponent),
  },
  {
    path: 'search-vehicle',
    loadComponent: () => import('./website/search-vehicle/search-vehicle.component').then(m => m.SearchVehicleComponent),
  },
  {
    path: 'purchase-request',
    loadComponent: () => import('./website/purchase-request/purchase-request.component').then(m => m.PurchaseRequestComponent),
  },
  {
    path: 'my-orders',
    loadComponent: () => import('./website/my-orders/my-orders.component').then(m => m.MyOrdersComponent),
  },
  {
    path: 'vehicle-detail/:id',
    loadComponent: () => import('./website/vehicle-detail/vehicle-detail.component').then(m => m.VehicleDetailComponent),
  },
  {
    path: 'customer-login',
    loadComponent: () => import('./website/customer-login/customer-login.component').then(m => m.CustomerLoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./website/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'customer-register',
    loadComponent: () => import('./website/register/customer-register/customer-register.component').then(m => m.CustomerRegisterComponent),
  },
  {
    path: 'provider-register',
    loadComponent: () => import('./website/register/provider-register/provider-register.component').then(m => m.ProviderRegisterComponent),
  },
  {
    path: 'customer-profile',
    loadComponent: () => import('./website/customer-profile/customer-profile.component').then(m => m.CustomerProfileComponent),
  },
  {
    path: 'provider-profile',
    loadComponent: () => import('./website/provider-profile/provider-profile.component').then(m => m.ProviderProfileComponent),
  },
  {
    path: 'recent-activity',
    loadComponent: () => import('./website/recent-activity/recent-activity.component').then(m => m.RecentActivityComponent),
  },
  {
    path: 'forgot_password',
    loadComponent: () => import('./website/customer-forgot-password/customer-forgot-password.component').then(m => m.CustomerForgotPasswordComponent),
  },
  {
    path: 'my-requests',
    loadComponent: () => import('./website/my-requests/my-requests.component').then(m => m.MyRequestsComponent),
  },
  {
    path: 'request-detail/:type/:id',
    loadComponent: () => import('./website/request-detail/request-detail.component').then(m => m.RequestDetailComponent),
  },
  {
    path: 'subscription',
    loadComponent: () => import('./website/provider-subscription/provider-subscription.component').then(m => m.ProviderSubscriptionComponent),
  },
  {
    path: 'workshop-operations',
    loadComponent: () => import('./website/workshop-operations/workshop-operations.component').then(m => m.WorkshopOperationsComponent),
  },
  {
    path: 'provider',
    redirectTo: 'incoming-requests',
    pathMatch: 'full'
  },
  {
    path: 'incoming-requests',
    loadComponent: () => import('./website/provider/incoming-requests/incoming-requests.component').then(m => m.IncomingRequestsComponent),
  },
  {
    path: 'provider/incoming-requests',
    loadComponent: () => import('./website/provider/incoming-requests/incoming-requests.component').then(m => m.IncomingRequestsComponent),
  },
  {
    path: 'purchase-requests',
    loadComponent: () => import('./website/provider/purchase-requests/purchase-requests.component').then(m => m.PurchaseRequestsComponent),
  },
  {
    path: 'provider/purchase-requests',
    loadComponent: () => import('./website/provider/purchase-requests/purchase-requests.component').then(m => m.PurchaseRequestsComponent),
  },
  {
    path: 'purchase-quotations',
    loadComponent: () => import('./website/provider/purchase-quotations/purchase-quotations.component').then(m => m.PurchaseQuotationsComponent),
  },
  {
    path: 'provider/purchase-quotations',
    loadComponent: () => import('./website/provider/purchase-quotations/purchase-quotations.component').then(m => m.PurchaseQuotationsComponent),
  },
  {
    path: 'confirmed-orders',
    loadComponent: () => import('./website/provider/confirmed-orders/confirmed-orders.component').then(m => m.ConfirmedOrdersComponent),
  },
  {
    path: 'provider/confirmed-orders',
    loadComponent: () => import('./website/provider/confirmed-orders/confirmed-orders.component').then(m => m.ConfirmedOrdersComponent),
  },
  {
    path: 'service-quote-sent',
    loadComponent: () => import('./website/provider/service-quote-sent/service-quote-sent.component').then(m => m.ServiceQuoteSentComponent),
  },
  {
    path: 'provider/service-quote-sent',
    loadComponent: () => import('./website/provider/service-quote-sent/service-quote-sent.component').then(m => m.ServiceQuoteSentComponent),
  },
  {
    path: 'quotes-sent',
    loadComponent: () => import('./website/provider/service-quote-sent/service-quote-sent.component').then(m => m.ServiceQuoteSentComponent),
  },

  {
    path: 'customer-vehicle-requests',
    loadComponent: () => import('./website/provider/custome-vehicle-requests/custome-vehicle-requests.component').then(m => m.CustomeVehicleRequestsComponent),
  },
  {
    path: 'provider/customer-vehicle-requests',
    loadComponent: () => import('./website/provider/custome-vehicle-requests/custome-vehicle-requests.component').then(m => m.CustomeVehicleRequestsComponent),
  },
  {
    path: 'resale-vehicles',
    loadComponent: () => import('./website/provider/resale-vehicles/resale-vehicles.component').then(m => m.ResaleVehiclesComponent),
  },
  {
    path: 'provider/resale-vehicles',
    loadComponent: () => import('./website/provider/resale-vehicles/resale-vehicles.component').then(m => m.ResaleVehiclesComponent),
  },
  {
    path: 'my-resale-vehicles',
    loadComponent: () => import('./website/provider/resale-vehicles/resale-vehicles.component').then(m => m.ResaleVehiclesComponent),
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
      {
        path: 'commission',
        loadComponent: () => import('./admin/commission/commission.component').then(m => m.CommissionComponent),
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
