import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

export interface CreatePurchaseRequestPayload {
  product_name: string;
  quantity: number;
  vehicle_category_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class EcomService {

  constructor(
    private apiService: ApiService,
    private jwtService: JwtService,
     private router: Router,
  ) { }

  /**
   * Helper to retrieve Bearer token headers for ecom endpoints
   */
  private getHeaders(): HttpHeaders {
    let token = this.jwtService.getCustomerToken();
    if (!token) {
      token = this.jwtService.getToken() as string;
    }
    if (!token && typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('Garage_Customer_Token') ||
              localStorage.getItem('garage_mandi_Token') ||
              localStorage.getItem('token') ||
              localStorage.getItem('access_token') ||
              sessionStorage.getItem('Garage_Customer_Token') ||
              sessionStorage.getItem('garage_mandi_Token') ||
              sessionStorage.getItem('token') ||
              '';
    }

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * POST /api/v1/ecomm/purchase-requests
   * Body: { product_name: string, quantity: number, vehicle_category_id: number }
   */
  createPurchaseRequest(data: CreatePurchaseRequestPayload): Observable<any> {
    return this.apiService.post('ecom/purchase-requests', data, this.getHeaders());
  }

  /**
   * GET /api/v1/ecomm/purchase-requests
   * Get purchase requests for current customer
   */
  getPurchaseRequests(params?: any): Observable<any> {
    let path = 'ecom/purchase-requests';
    if (params) {
      const query = new URLSearchParams(params).toString();
      if (query) {
        path += `?${query}`;
      }
    }
    return this.apiService.get(path, this.getHeaders());
  }

  /**
   * GET /api/v1/ecomm/purchase-requests/:id
   * Get single purchase request details
   */
  getPurchaseRequestDetails(id: string | number): Observable<any> {
    return this.apiService.get(`ecom/purchase-requests/${id}`, this.getHeaders());
  }

  /**
   * POST /api/v1/ecom/purchase-requests/:id/cancel
   * Cancel a purchase request
   */
  cancelPurchaseRequest(requestId: string | number, reason: string = ''): Observable<any> {
    const body = reason ? { reason } : {};
    return this.apiService.post(`ecom/purchase-requests/${requestId}/cancel`, body, this.getHeaders());
  }

  /**
   * POST /api/v1/ecom/purchase-requests/:id/quotations/:quotationId/accept
   * Accept seller quotation
   */
  acceptQuotation(requestId: string | number, quotationId: string | number, payload: any = {}): Observable<any> {
    return this.apiService.post(`ecom/purchase-requests/${requestId}/quotations/${quotationId}/accept`, payload, this.getHeaders());
  }

  /**
   * POST /api/v1/ecomm/checkout
   * Checkout purchase request
   */
  checkout(payload: any): Observable<any> {
    return this.apiService.post('ecom/checkout', payload, this.getHeaders());
  }

  /**
   * POST /api/v1/ecomm/verify-payment
   * Verify razorpay / payment for ecomm order
   */
  verifyPayment(payload: any): Observable<any> {
    return this.apiService.post('ecom/verify-payment', payload, this.getHeaders());
  }

  /**
   * GET /api/v1/vehicle-categories
   * Retrieve active vehicle categories
   */
  getVehicleCategories(): Observable<any> {
    return this.apiService.get('vehicle-categories', this.getHeaders());
  }




// provider side ecom end points

  /**
   * GET /api/v1/ecom/seller/purchase-requests
   * Fetch purchase requests for seller/provider
   */
  getSellerPurchaseRequests(params?: any): Observable<any> {
    let path = 'ecom/seller/purchase-requests';
    if (params) {
      const query = new URLSearchParams(params).toString();
      if (query) {
        path += `?${query}`;
      }
    }
    return this.apiService.get(path, this.getHeaders());
  }

  /**
   * POST /api/v1/ecom/seller/purchase-requests/:id/quotations
   * Submit quotation for a purchase request
   */
  createSellerQuotation(requestId: string | number, payload: {
    unit_price: number;
    gst_percent: number;
    delivery_fee: number;
    notes?: string;
  }): Observable<any> {
    return this.apiService.post(`ecom/seller/purchase-requests/${requestId}/quotations`, payload, this.getHeaders());
  }



// Admin side Ecom end points
  private getAdminHeaders(): HttpHeaders {
    let token = this.jwtService.getToken() as string;
    if (!token && typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('garage_mandi_Token') ||
              localStorage.getItem('token') ||
              localStorage.getItem('access_token') ||
              '';
    }
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  GetPlatformFee(): Observable<any> {
    const headers = this.getAdminHeaders();
    return this.apiService.get(`ecom/admin/platform-fee`, headers).pipe(
      tap((error: any) => {
        console.log('Response received:', error);
        this.erromessagefunction(error);
      }),
    );
  }

  UpdatePlatformFee(payload: any): Observable<any> {
    const headers = this.getAdminHeaders();
    return this.apiService.put(`ecom/admin/platform-fee`, payload, headers).pipe(
      tap((error: any) => {
        console.log('Response received:', error);
        this.erromessagefunction(error);
      }),
    );
  }
    erromessagefunction(error: any) {
    console.log('Response received:', error);
    var response = error;
    var errorMessage;
    if (
      typeof response.message === 'object' &&
      response.message !== null &&
      !Array.isArray(response.message)
    ) {
      errorMessage = JSON.stringify(response.message);
    } else {
      errorMessage = response.message;
    }
    console.log(response);
    if (
      error.status === 422 &&
      error.message &&
      (errorMessage.includes('The selected user id is invalid') ||
        errorMessage.includes('Your account has been deactivated') ||
        errorMessage.includes('Your token has been expired') ||
        errorMessage.includes(
          'Your token has been expired. Please login again.',
        ))
    ) {
      // Log the user out and navigate to sign-in page
      this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
      this.router.navigate(['/sign_in']); // Navigate to home route
      alert(errorMessage); // Show alert with error message
    } else if (error && error.message) {
      // Display error message
      // alert(errorMessage);
    }
  }
}