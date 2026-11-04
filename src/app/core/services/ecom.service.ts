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
   * POST /api/v1/ecom/purchase-requests/:id/checkout
   * Checkout purchase request
   */
  checkout(requestId: string | number, payload: any = {}): Observable<any> {
    return this.apiService.post(`ecom/purchase-requests/${requestId}/checkout`, payload, this.getHeaders());
  }

  /**
   * POST /api/v1/ecom/payments/verify
   * Verify razorpay / payment for ecomm order
   */
  verifyPayment(payload: any): Observable<any> {
    return this.apiService.post('ecom/payments/verify', payload, this.getHeaders());
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

  /**
   * GET /api/v1/ecom/seller/quotations
   * Fetch quotations submitted by seller
   */
  getSellerQuotations(params?: any): Observable<any> {
    let path = 'ecom/seller/quotations';
    if (params) {
      const cleanParams: any = {};
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
          cleanParams[k] = params[k];
        }
      });
      const query = new URLSearchParams(cleanParams).toString();
      if (query) {
        path += `?${query}`;
      }
    }
    return this.apiService.get(path, this.getHeaders());
  }

  /**
   * GET /api/v1/ecom/seller/quotations/:id
   * Fetch quotation details for seller by ID
   */
  getSellerQuotationDetails(id: string | number): Observable<any> {
    return this.apiService.get(`ecom/seller/quotations/${id}`, this.getHeaders());
  }

   /**
   * GET /api/v1/ecom/seller/orders
   * Fetch orders submitted by seller
   */
  getSellerOrders(params?: any): Observable<any> {
    let path = 'ecom/seller/orders';
    if (params) {
      const cleanParams: any = {};
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
          cleanParams[k] = params[k];
        }
      });
      const query = new URLSearchParams(cleanParams).toString();
      if (query) {
        path += `?${query}`;
      }
    }
    return this.apiService.get(path, this.getHeaders());
  }

  /**
   * GET /api/v1/ecom/seller/orders/:id
   * Fetch orders details for seller by ID
   */
  getSellerOrderDetailss(id: string | number): Observable<any> {
    return this.apiService.get(`ecom/seller/orders/${id}`, this.getHeaders());
  }

  getSellerOrderDetails(id: string | number): Observable<any> {
    return this.getSellerOrderDetailss(id);
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

  /**
   * GET /api/v1/ecom/admin/orders
   * Fetch all orders for admin
   */
  getAdminOrders(params?: any): Observable<any> {
    let path = 'ecom/admin/orders';
    if (params) {
      const cleanParams: any = {};
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
          cleanParams[k] = params[k];
        }
      });
      const query = new URLSearchParams(cleanParams).toString();
      if (query) {
        path += `?${query}`;
      }
    }
    return this.apiService.get(path, this.getAdminHeaders());
  }

  /**
   * GET /api/v1/ecom/admin/orders/:id
   * Fetch order details by ID for admin
   */
  getAdminOrderDetails(id: string | number): Observable<any> {
    return this.apiService.get(`ecom/admin/orders/${id}`, this.getAdminHeaders());
  }

  /**
   * GET /api/v1/ecom/admin/orders/:id/notes
   * Fetch order notes for admin
   */
  getAdminOrderNotes(orderId: string | number): Observable<any> {
    return this.apiService.get(`ecom/admin/orders/${orderId}/notes`, this.getAdminHeaders());
  }

  /**
   * POST /api/v1/ecom/admin/orders/:id/notes
   * Add note to an order
   */
  addAdminOrderNote(orderId: string | number, payload: any): Observable<any> {
    return this.apiService.post(`ecom/admin/orders/${orderId}/notes`, payload, this.getAdminHeaders());
  }

  /**
   * POST /api/v1/ecom/admin/orders/:id/cancel
   * Cancel order for admin
   */
  cancelAdminOrder(orderId: string | number, payload: any): Observable<any> {
    return this.apiService.post(`ecom/admin/orders/${orderId}/cancel`, payload, this.getAdminHeaders());
  }

  /**
   * POST /api/v1/ecom/admin/orders/:id/refund
   * Issue refund for order
   */
  refundAdminOrder(orderId: string | number, payload: any): Observable<any> {
    return this.apiService.post(`ecom/admin/orders/${orderId}/refunds`, payload, this.getAdminHeaders());
  }

  /**
   * GET /api/v1/ecom/admin/refunds
   * Fetch all customer refunds for admin
   */
  getAdminRefunds(params?: any): Observable<any> {
    let path = 'ecom/admin/refunds';
    if (params) {
      const cleanParams: any = {};
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
          cleanParams[k] = params[k];
        }
      });
      const query = new URLSearchParams(cleanParams).toString();
      if (query) {
        path += `?${query}`;
      }
    }
    return this.apiService.get(path, this.getAdminHeaders());
  }

  /**
   * POST /api/v1/ecom/admin/refunds/:id/sync
   * Re-sync refund status from Razorpay gateway
   */
  syncAdminRefund(id: string | number): Observable<any> {
    return this.apiService.post(`ecom/admin/refunds/${id}/sync`, {}, this.getAdminHeaders());
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