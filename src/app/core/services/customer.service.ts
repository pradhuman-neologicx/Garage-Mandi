import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private apiService: ApiService, private jwtService: JwtService) { }

  logout(): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.apiService.post('logout', {}, headers);
  }

  login(credentials: any): Observable<any> {
    return this.apiService.postWithoutHeader('login', credentials);
  }

  register(data: any): Observable<any> {
    return this.apiService.postWithoutHeader('register', data);
  }
  providerRegister(data: any): Observable<any> {
    return this.apiService.postWithoutHeader('register/service-provider', data);
  }


  getProviderSubscriptions(): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.apiService.get('subscriptions/current', headers);
  }

  cancelAutoRenewal(data: any = {}): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.apiService.post('subscriptions/auto-renew/cancel', data, headers);
  }

  subscriptionCheckout(data: any): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.apiService.post('subscriptions/checkout', data, headers);
  }

  renewalCheckout(data: any): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    const body = (typeof data === 'string') ? { mandate_method: data } : data;
    return this.apiService.post('subscriptions/renewal/checkout', body, headers);
  }

  verifySubscriptionPayment(data: any): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.apiService.post('subscriptions/verify', data, headers);
  }

  cancelSubscriptionPayment(paymentId: number | string, data: any = {}): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.apiService.post(`subscriptions/payments/${paymentId}/cancel`, data, headers);
  }

  getSubscriptionPlans(): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.apiService.get('subscription-plans', headers);
  }

  getHistory(): Observable<any> {
    return this.apiService.get('customer/history', {});
  }

  getStates(): Observable<any> {
    return this.apiService.get('states', {});
  }

  getDistricts(stateId: number): Observable<any> {
    return this.apiService.get(`states/${stateId}/districts`, {});
  }

  getCities(districtId: number): Observable<any> {
    return this.apiService.get(`districts/${districtId}/cities`, {});
  }

  getVehicleCategoriesPublic(): Observable<any> {
    return this.apiService.get('vehicle-categories', {});
  }

  getBusinessCategories(businessType: string): Observable<any> {
    return this.apiService.get(`business-categories?business_type=${businessType}`, {});
  }

  getTags(businessTypes: string, vehicleCategoryId: string, businessCategoryIds?: string): Observable<any> {
    let url = 'tags';
    const params: string[] = [];
    if (businessTypes) params.push(`business_type=${encodeURIComponent(businessTypes)}`);
    if (vehicleCategoryId) params.push(`vehicle_category_id=${encodeURIComponent(vehicleCategoryId)}`);
    if (businessCategoryIds) params.push(`business_category_id=${encodeURIComponent(businessCategoryIds)}`);
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    return this.apiService.get(url, {});
  }

  sendEmailOtp(email: string): Observable<any> {
    return this.apiService.postWithoutHeader('register/send-otp', { email });
  }

  verifyEmailOtp(email: string, otp: string): Observable<any> {
    return this.apiService.postWithoutHeader('register/verify-otp', { email, otp });
  }

  getCustomerProfile(): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.apiService.get('customer/profile', headers);
  }

  updateCustomerProfile(data: FormData): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.apiService.post('customer/profile', data, headers);
  }

  getProviderProfile(): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.apiService.get('provider/profile', headers);
  }

  updateProviderProfile(data: FormData): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.apiService.post('provider/profile', data, headers);
  }

  getRecentActivities(limit?: number, page?: number, fromDate?: string, toDate?: string): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    let url = 'customer/activities';
    const params: string[] = [];
    if (limit) params.push(`limit=${limit}`);
    if (page) params.push(`page=${page}`);
    if (fromDate) params.push(`from_date=${fromDate}`);
    if (toDate) params.push(`to_date=${toDate}`);
    if (params.length) url += '?' + params.join('&');
    return this.apiService.get(url, headers);
  }

  forgotPassword(email: string): Observable<any> {
    return this.apiService.postWithoutHeader('password/request', { email });
  }

  verifyPasswordOtp(email: string, otp: string): Observable<any> {
    return this.apiService.postWithoutHeader('password/verify', { email, otp });
  }

  resetPassword(data: any): Observable<any> {
    return this.apiService.postWithoutHeader('password/reset', data);
  }

  getServiceRequests(page: number = 1, limit: number = 10): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.get(`requests?page=${page}&limit=${limit}`, headers);
  }

  getServiceRequestDetails(requestId: string | number): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.get(`requests/${requestId}`, headers);
  }

  getSparePartRequests(page: number = 1, limit: number = 10): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.get(`spare-part-inquiries?page=${page}&limit=${limit}`, headers);
  }

  getSparePartRequestDetails(requestId: string | number): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.get(`spare-part-inquiries/${requestId}`, headers);
  }

  getQuotationDetails(quotationId: string | number): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.get(`customer/quotations/${quotationId}`, headers);
  }

  getSparePartQuotationDetails(quotationId: string | number): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.get(`customer/spare-part-inquiry-quotations/${quotationId}`, headers);
  }

  getVehicleCategories(): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.get(`vehicle-categories`, headers);
  }

  getServiceTypes(vehicleCategoryId: string | number): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.get(`service-types?vehicle_category_id=${vehicleCategoryId}`, headers);
  }

  createServiceRequest(formData: FormData): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.post(`requests`, formData, headers);
  }

  getSpareParts(vehicleCategoryId: string | number): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.get(`vehicle-spare-parts?vehicle_category_id=${vehicleCategoryId}`, headers);
  }

  createSparePartRequest(formData: FormData): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.post(`spare-part-inquiries`, formData, headers);
  }

  submitServiceFeedback(requestId: number | string, data: any): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.patchNew(`requests/${requestId}/feedback`, data, headers);
  }

  submitSparePartFeedback(inquiryId: number | string, data: any): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.patchNew(`spare-part-inquiries/${inquiryId}/feedback`, data, headers);
  }

  // --- Resell Vehicles ---
  searchResellVehicles(queryParams: any): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // Construct query string manually or using HttpParams
    let queryString = Object.keys(queryParams)
      .filter(key => queryParams[key] !== null && queryParams[key] !== undefined && queryParams[key] !== '')
      .map(key => `${key}=${encodeURIComponent(queryParams[key])}`)
      .join('&');

    const url = queryString ? `customer/resell-vehicles?${queryString}` : `customer/resell-vehicles`;
    return this.apiService.get(url, headers);
  }

  getResellVehicleDetails(vehicleId: string | number): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.get(`customer/resell-vehicles/${vehicleId}`, headers);
  }

  addVehicleToInterests(vehicleId: string | number): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    // It's a POST request according to Postman
    return this.apiService.post(`customer/resell-vehicles/${vehicleId}/interest`, {}, headers);
  }

  // --- Auth specific endpoints ---
  changePasswordAuth(data: any): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.post(`change-password`, data, headers);
  }

  deactivateAccount(userId: string | number): Observable<any> {
    const token = this.jwtService.getCustomerToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.apiService.get(`deactivate/${userId}`, headers);
  }
}
