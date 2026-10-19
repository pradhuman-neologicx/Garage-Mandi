import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';

export interface ProviderRequestFilterParams {
  status?: string;
  limit?: number;
  page?: number;
  search?: string;
  vehicle_category_id?: string | number;
}

@Injectable({
  providedIn: 'root'
})
export class ProviderService {

  constructor(
    private apiService: ApiService,
    private jwtService: JwtService
  ) { }

  /**
   * Helper to get standard bearer token authorization headers
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
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * Get the current provider/service-provider ID from storage
   */
  getCurrentProviderId(): string | number | null {
    try {
      const sp = this.jwtService.getServiceProvider();
      if (sp && sp.id) {
        return sp.id;
      }
      const custId = this.jwtService.getCustomerId();
      if (custId) {
        return custId;
      }
    } catch (e) {
      console.warn('Error reading provider ID from storage', e);
    }
    return null;
  }

  /**
   * Fetch incoming service requests for a provider
   * GET /api/v1/provider/requests?status=...&limit=...&page=...
   */
  getRequests(filtersOrId?: ProviderRequestFilterParams | string | number | null, maybeFilters?: ProviderRequestFilterParams): Observable<any> {
    const headers = this.getHeaders();
    const filters: ProviderRequestFilterParams | undefined = 
      (typeof filtersOrId === 'object' && filtersOrId !== null) ? (filtersOrId as ProviderRequestFilterParams) : maybeFilters;

    // Path is directly provider/requests without /:id
    const basePath = 'provider/requests';

    // Construct query parameters
    const queryParts: string[] = [];
    if (filters) {
      if (filters.status && filters.status !== 'all') {
        const s = filters.status.toLowerCase();
        queryParts.push(`status=${encodeURIComponent(s === 'closed' ? 'complete' : s)}`);
      }
      if (filters.limit !== undefined && filters.limit !== null) {
        queryParts.push(`limit=${encodeURIComponent(filters.limit)}`);
        queryParts.push(`per_page=${encodeURIComponent(filters.limit)}`);
      }
      if (filters.page !== undefined && filters.page !== null) {
        queryParts.push(`page=${encodeURIComponent(filters.page)}`);
      }
      if (filters.search && filters.search.trim()) {
        queryParts.push(`search=${encodeURIComponent(filters.search.trim())}`);
      }
      if (filters.vehicle_category_id) {
        queryParts.push(`vehicle_category_id=${encodeURIComponent(filters.vehicle_category_id)}`);
      }
    }

    const fullPath = queryParts.length > 0 ? `${basePath}?${queryParts.join('&')}` : basePath;
    return this.apiService.get(fullPath, headers);
  }

  /**
   * Get detailed info for a single service request
   * GET /api/v1/requests/:requestId or /api/v1/provider/requests/details/:requestId
   */
  getRequestDetails(requestId: string | number): Observable<any> {
    const headers = this.getHeaders();
    return this.apiService.get(`requests/${requestId}`, headers);
  }

  /**
   * Submit a service quotation for a request
   * POST /api/v1/provider/quotations or /api/v1/quotations
   */
  createServiceQuotation(formData: FormData | any): Observable<any> {
    const headers = this.getHeaders();
    return this.apiService.post('provider/quotations', formData, headers);
  }

 


  /**
   * Delete uploaded images
   */
  deleteImage(imageId: string | number): Observable<any> {
    const headers = this.getHeaders();
    return this.apiService.deleteFun(`provider/images/${imageId}`, { headers });
  }
}
