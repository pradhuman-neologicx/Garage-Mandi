import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
@Injectable({
    providedIn: 'root',
})
export class AdminService {
    private approvalStageMessage = new BehaviorSubject('');
    currentApprovalStageMessage = this.approvalStageMessage.asObservable();

    constructor(
        private http: HttpClient,
        private apiservice: ApiService,
        private jwtService: JwtService,
        private router: Router,
    ) { }

    changestatus(unit_id: string, status: any): Observable<any> {
        var user = this.jwtService.getpanelUserId();
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        });
        const body = {
            unit_id: unit_id,
            status: status,
        };
        return this.apiservice.post(`change-unit-status`, body, headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            }),
        );
    }

    GetState() {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        });
        return this.apiservice.get('states', headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            }),
        );
    }

    getCity(state_id: any): Observable<any> {
        const token = this.jwtService.getToken(); // Get the token for authorization
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        });

        // Make the GET request to the server
        return this.apiservice.get(`cities/${state_id}`, headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            }),
        );
    }
    // Category Management APIs start
    getCategory(tableSize: any, page: any, search: any) {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        });

        let url = '';

        if (tableSize !== 'all') {
            url = `system-admin/categories?limit=${tableSize}&page=${page}`;
        } else {
            url = `system-admin/categories?`;
        }

        // Add search if present
        if (search && search.length > 0) {
            url += `&search=${search}`;
        }

        return this.apiservice.get(url, headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            }),
        );
    }

    AddCategory(data: FormData): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.apiservice.post('system-admin/categories', data, headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            })
        );
    }

    getCategoryById(id: number | string): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.get(`system-admin/categories/${id}`, headers);
    }

    UpdateCategoryStatus(id: number): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        return this.apiservice.patchWithHeader(`system-admin/categories/${id}/status`, {}, headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            })
        );
    }

    getSpareParts(tableSize: any, page: any, search: any, categoryId?: any) {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        });

        let url = '';
        if (tableSize !== 'all') {
            url = `system-admin/spare-parts?limit=${tableSize}&page=${page}`;
        } else {
            url = `system-admin/spare-parts?`;
        }

        if (search) {
            url += `&search=${search}`;
        }
        if (categoryId) {
            url += `&vehicle_category_id=${categoryId}`;
        }
        return this.apiservice.get(url, headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            }),
        );
    }

    AddSparePart(data: FormData): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.apiservice.post('system-admin/spare-parts', data, headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            }),
        );
    }

    getSparePartById(id: number | string): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.get(`system-admin/spare-parts/${id}`, headers);
    }

    UpdateSparePartStatus(id: number): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        return this.apiservice.patchWithHeader(`system-admin/spare-parts/${id}/status`, {}, headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            })
        );
    }

    getPublicVehicleCategories(): Observable<any> {
        // Public API, no token needed but we pass empty headers to satisfy signature
        const headers = new HttpHeaders();
        return this.apiservice.get('vehicle-categories', headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            })
        );
    }

    getPublicSpareParts(): Observable<any> {
        const headers = new HttpHeaders();
        let url = 'vehicle-spare-parts';
        return this.apiservice.get(url, headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            })
        );
    }
    getPublicServiceType(): Observable<any> {
        const headers = new HttpHeaders();
        let url = 'service-types';
        return this.apiservice.get(url, headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            })
        );
    }

    getPublicSubSpareParts(): Observable<any> {
        const headers = new HttpHeaders();
        let url = 'sub-spare-parts';
        return this.apiservice.get(url, headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            })
        );
    }
    // --- Service APIs ---
    getServices(tableSize: any, page: any, search: any, categoryId?: any): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        let url = tableSize !== 'all' ? `system-admin/service-types?limit=${tableSize}&page=${page}` : `system-admin/service-types?`;
        if (search) url += `&search=${search}`;
        if (categoryId) url += `&vehicle_category_id=${categoryId}`;

        return this.apiservice.get(url, headers).pipe(
            tap((error: any) => { this.erromessagefunction(error); })
        );
    }

    addService(data: FormData): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.post('system-admin/service-types', data, headers);
    }

    getServiceById(id: number | string): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.get(`system-admin/service-types/${id}`, headers);
    }

    updateService(id: number | string, data: FormData): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.post(`system-admin/service-types`, data, headers);
    }

    updateServiceStatus(id: number): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.patchWithHeader(`system-admin/service-types/${id}/status`, {}, headers);
    }

    // --- Sub Category APIs ---
    getSubCategories(tableSize: any, page: any, search: any, sparePartId?: any): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        let url = tableSize !== 'all' ? `system-admin/sub-spare-parts?limit=${tableSize}&page=${page}` : `system-admin/sub-spare-parts?`;
        if (search) url += `&search=${search}`;
        if (sparePartId) url += `&vehicle_spare_parts_id=${sparePartId}`;

        return this.apiservice.get(url, headers).pipe(
            tap((error: any) => { this.erromessagefunction(error); })
        );
    }

    addSubCategory(data: FormData): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.post('system-admin/sub-spare-parts', data, headers);
    }

    getSubCategoryById(id: number | string): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.get(`system-admin/sub-spare-parts/${id}`, headers);
    }

    updateSubCategory(id: number | string, data: FormData): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.post(`system-admin/sub-spare-parts`, data, headers);
    }

    updateSubCategoryStatus(id: number): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.patchWithHeader(`system-admin/sub-spare-parts/${id}/status`, {}, headers);
    }

    // Category Management APIs end


    // User Management APIs end
    // --- Customer APIs ---
    getCustomers(tableSize: any, page: any, search: any): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        let url = tableSize !== 'all' ? `system-admin/customers?limit=${tableSize}&page=${page}` : `system-admin/customers?`;
        if (search) url += `&search=${search}`;

        return this.apiservice.get(url, headers).pipe(
            tap((error: any) => { this.erromessagefunction(error); })
        );
    }

    addCustomer(data: FormData): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.post('system-admin/customers', data, headers);
    }

    getCustomerById(id: number | string): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.get(`system-admin/customers/${id}`, headers);
    }

    updateCustomer(id: number | string, data: FormData): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.post(`system-admin/customers`, data, headers); // Using POST with _method=PUT from formData
    }

    updateCustomerStatus(id: number): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.patchWithHeader(`system-admin/customers/${id}/status`, {}, headers);
    }
    // --- Field Executive APIs ---
    getExecutives(tableSize: any, page: any, search: any): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });
        let url = tableSize !== 'all' ? `system-admin/executives?limit=${tableSize}&page=${page}` : `system-admin/executives?`;
        if (search) url += `&search=${search}`;
        return this.apiservice.get(url, headers).pipe(tap((error: any) => { this.erromessagefunction(error); }));
    }

    addExecutive(data: FormData): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.post('system-admin/executives', data, headers);
    }

    getExecutiveById(id: number | string): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.get(`system-admin/executives/${id}`, headers);
    }

    updateExecutive(id: number | string, data: FormData): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.post(`system-admin/executives`, data, headers);
    }

    updateExecutiveStatus(id: number): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.patchWithHeader(`system-admin/executives/${id}/status`, {}, headers);
    }

    // --- System Admin APIs ---
    getSystemAdmins(tableSize: any, page: any, search: any): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });
        let url = tableSize !== 'all' ? `super-admin/system-admins?limit=${tableSize}&page=${page}` : `super-admin/system-admins?`;
        if (search) url += `&search=${search}`;
        return this.apiservice.get(url, headers).pipe(tap((error: any) => { this.erromessagefunction(error); }));
    }

    addSystemAdmin(data: FormData): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.post('super-admin/system-admins', data, headers);
    }

    getSystemAdminById(id: number | string): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.get(`super-admin/system-admins/${id}`, headers);
    }

    updateSystemAdmin(id: number | string, data: FormData): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.post(`super-admin/system-admins`, data, headers);
    }

    updateSystemAdminStatus(id: number): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.apiservice.patchWithHeader(`super-admin/system-admins/${id}/status`, {}, headers);
    }

    // ServiceProvider APIs
    getServiceProviders(tableSize: any, page: any, search: any): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        let url = '';
        if (tableSize !== 'all') {
            url = `system-admin/vendors?limit=${tableSize}&page=${page}`;
        } else {
            url = `system-admin/vendors?`;
        }

        if (search) {
            url += `&search=${search}`;
        }

        return this.apiservice.get(url, headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            })
        );
    }

    getServiceProviderById(id: string | number): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.apiservice.get(`system-admin/vendors/${id}`, headers);
    }

    addServiceProvider(data: FormData | any): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.apiservice.post(`system-admin/vendors`, data, headers);
    }

    updateServiceProvider(id: string | number, data: FormData | any): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        // Assuming POST with _method=PUT is handled or backend accepts POST to /id for updates
        return this.apiservice.post(`system-admin/vendors`, data, headers);
    }

    approveServiceProvider(id: string | number): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.apiservice.patchWithHeader(`system-admin/vendors/${id}/approve`, {}, headers);
    }

    rejectServiceProvider(id: string | number): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.apiservice.patchWithHeader(`system-admin/vendors/${id}/reject`, {}, headers);
    }

    updateServiceProviderStatus(id: string | number): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.apiservice.patchWithHeader(`system-admin/vendors/${id}/status`, {}, headers);
    }

    // Users Management APIs end

    // Subscription APIs start
    getSubscriptionPlan(): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        return this.apiservice.get('subscription-plan', headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            })
        );
    }

    updateSubscriptionPlan(data: any): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        return this.apiservice.put('subscription-plan', data, headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            })
        );
    }

    getProviderSubscriptions(tableSize: any, page: any, search: any, startDate?: string, endDate?: string): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        let url = '';
        if (tableSize !== 'all') {
            url = `admin/subscriptions?limit=${tableSize}&page=${page}`;
        } else {
            url = `admin/subscriptions?`;
        }

        if (search) {
            url += `&search=${search}`;
        }
        if (startDate) {
            url += `&start_date=${startDate}`;
        }
        if (endDate) {
            url += `&end_date=${endDate}`;
        }

        return this.apiservice.get(url, headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            })
        );
    }
    getProviderExpirySubscriptions(tableSize: any, page: any, search: any, startDate?: string, endDate?: string): Observable<any> {
        const token = this.jwtService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        let url = '';
        if (tableSize !== 'all') {
            url = `admin/subscriptions/expiring?limit=${tableSize}&page=${page}`;
        } else {
            url = `admin/subscriptions/expiring?`;
        }

        if (search) {
            url += `&search=${search}`;
        }
        if (startDate) {
            url += `&start_date=${startDate}`;
        }
        if (endDate) {
            url += `&end_date=${endDate}`;
        }

        return this.apiservice.get(url, headers).pipe(
            tap((error: any) => {
                console.log('Response received:', error);
                this.erromessagefunction(error);
            })
        );
    }
    // Subscription APIs end

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
