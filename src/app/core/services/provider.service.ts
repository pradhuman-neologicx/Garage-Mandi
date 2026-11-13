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
   * GET /api/v1/provider/quotations
   * Retrieve list of quotations submitted by provider
   */
  getProviderQuotations(params?: any): Observable<any> {
    const headers = this.getHeaders();
    const queryParts: string[] = [];
    if (params) {
      if (params.page !== undefined && params.page !== null) {
        queryParts.push(`page=${encodeURIComponent(params.page)}`);
      }
      if (params.limit !== undefined && params.limit !== null) {
        queryParts.push(`limit=${encodeURIComponent(params.limit)}`);
      } else if (params.per_page !== undefined && params.per_page !== null) {
        queryParts.push(`limit=${encodeURIComponent(params.per_page)}`);
      }
      if (params.category && params.category !== 'all') {
        queryParts.push(`category=${encodeURIComponent(params.category)}`);
      }
      if (params.quotation_type && params.quotation_type !== 'all') {
        queryParts.push(`quotation_type=${encodeURIComponent(params.quotation_type)}`);
      }
      if (params.search && params.search.trim()) {
        queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
      }
    }
    const url = queryParts.length > 0 ? `provider/quotations?${queryParts.join('&')}` : 'provider/quotations';
    return this.apiService.get(url, headers);
  }

  /**
   * GET /api/v1/provider/quotations/:id
   * Retrieve single quotation details by ID
   */
  getProviderQuotationById(id: number | string): Observable<any> {
    const headers = this.getHeaders();
    return this.apiService.get(`provider/quotations/${id}`, headers);
  }

 


  /**
   * Delete uploaded images
   */
  deleteImage(imageId: string | number): Observable<any> {
    const headers = this.getHeaders();
    return this.apiService.deleteFun(`provider/images/${imageId}`, { headers });
  }



  /**
   * GET /api/v1/vehicle-categories
   * Retrieve active vehicle categories
   */
  getPublicVehicleCategories(): Observable<any> {
    return this.apiService.get('vehicle-categories', this.getHeaders());
  }

  /**
   * GET /api/v1/vehicle-makers?vehicle_category_id=:id
   * Retrieve vehicle makers / brands for category
   */
  getPublicVehicleMakers(categoryId?: number | string): Observable<any> {
    const q = categoryId !== undefined && categoryId !== null && categoryId !== '' ? `?vehicle_category_id=${categoryId}` : '';
    return this.apiService.get(`vehicle-makers${q}`, this.getHeaders());
  }

  /**
   * GET /api/v1/fuel-types
   * Retrieve active fuel types
   */
  getFuelTypes(): Observable<any> {
    return this.apiService.get('fuel-types', this.getHeaders());
  }

  /**
   * GET /api/v1/provider/vehicle-resells
   * Retrieve provider's resale vehicles with optional query filters
   */
  getResaleVehicles(params?: any): Observable<any> {
    const headers = this.getHeaders();
    const queryParts: string[] = [];
    if (params) {
      if (params.page !== undefined && params.page !== null) {
        queryParts.push(`page=${encodeURIComponent(params.page)}`);
      }
      if (params.limit !== undefined && params.limit !== null) {
        queryParts.push(`limit=${encodeURIComponent(params.limit)}`);
      } else if (params.per_page !== undefined && params.per_page !== null) {
        queryParts.push(`limit=${encodeURIComponent(params.per_page)}`);
      }
      if (params.search && params.search.trim()) {
        queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
      }
      if (params.vehicle_category_id) {
        queryParts.push(`vehicle_category_id=${encodeURIComponent(params.vehicle_category_id)}`);
      }
      if (params.fuel_type_id) {
        queryParts.push(`fuel_type_id=${encodeURIComponent(params.fuel_type_id)}`);
      }
    }
    const url = queryParts.length > 0 ? `provider/vehicle-resells?${queryParts.join('&')}` : 'provider/vehicle-resells';
    return this.apiService.get(url, headers);
  }

  /**
   * GET /api/v1/provider/vehicle-resells/:id
   * Retrieve single resale vehicle details by ID
   */
  getResaleVehicleById(id: number | string): Observable<any> {
    const headers = this.getHeaders();
    return this.apiService.get(`provider/vehicle-resells/${id}`, headers);
  }

  /**
   * POST /api/v1/provider/vehicle-resells
   * Create or update resale vehicle (FormData with images[] and optional id)
   */
  saveResaleVehicle(formData: FormData): Observable<any> {
    const headers = this.getHeaders();
    return this.apiService.post('provider/vehicle-resells', formData, headers);
  }

  /**
   * DELETE /api/v1/provider/vehicle-resells/:id
   * Delete resale vehicle listing
   */
  deleteResaleVehicle(id: number | string): Observable<any> {
    const headers = this.getHeaders();
    return this.apiService.deleteFun(`provider/vehicle-resells/${id}`, { headers });
  }

  /**
   * DELETE /api/v1/provider/vehicle-resells/gallery/:imageId
   * Delete vehicle gallery image
   */
  deleteResaleVehicleImage(imageId: number | string): Observable<any> {
    const headers = this.getHeaders();
    return this.apiService.deleteFun(`provider/vehicle-resells/gallery/${imageId}`, { headers });
  }

  /**
   * GET /api/v1/provider/vehicle-resell-requests
   * Retrieve customer vehicle interest requests for provider's vehicles
   */
  getVehicleResellRequests(params?: any): Observable<any> {
    const headers = this.getHeaders();
    const queryParts: string[] = [];
    if (params) {
      if (params.page !== undefined && params.page !== null) {
        queryParts.push(`page=${encodeURIComponent(params.page)}`);
      }
      if (params.limit !== undefined && params.limit !== null) {
        queryParts.push(`limit=${encodeURIComponent(params.limit)}`);
      } else if (params.per_page !== undefined && params.per_page !== null) {
        queryParts.push(`limit=${encodeURIComponent(params.per_page)}`);
      }
      if (params.status && params.status !== 'all') {
        queryParts.push(`status=${encodeURIComponent(params.status)}`);
      }
      if (params.search && params.search.trim()) {
        queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
      }
    }
    const url = queryParts.length > 0 ? `provider/vehicle-resell-requests?${queryParts.join('&')}` : 'provider/vehicle-resell-requests';
    return this.apiService.get(url, headers);
  }

  /**
   * GET /api/v1/provider/vehicle-resell-requests/:id
   * Retrieve single customer vehicle interest request details by ID
   */
  getVehicleResellRequestById(id: number | string): Observable<any> {
    const headers = this.getHeaders();
    return this.apiService.get(`provider/vehicle-resell-requests/${id}`, headers);
  }

  /**
   * POST /api/v1/provider/vehicle-resell-requests/:id/contacted
   * Mark customer vehicle interest request as contacted
   */
  markVehicleResellRequestContacted(requestId: number | string): Observable<any> {
    const headers = this.getHeaders();
    return this.apiService.post(`provider/vehicle-resell-requests/${requestId}/contacted`, {}, headers);
  }
}
