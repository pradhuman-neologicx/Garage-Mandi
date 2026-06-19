import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AdminService } from '../../core/services/admin.service';
import { JwtService } from '../../core/services/jwt.service';
import { NotificationService } from '../../core/services/notificationnew.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgxPaginationModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
  activeTab: string = 'service_providers';

  tableSize: any = 10;
  tableSizes: any = [10, 20, 50, 100, 'all'];
  page: number = 1;

  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    if (this.activeTab === 'service_providers') {
      this.fetchServiceProviders();
    } else if (this.activeTab === 'customers') {
      this.fetchCustomers();
    } else if (this.activeTab === 'field_executives') {
      this.fetchFieldExecutives();
    } else if (this.activeTab === 'system_admins') {
      this.fetchSystemAdmins();
    }
  }

  onTableDataChange(event: any) {
    this.page = event;
    if (this.activeTab === 'service_providers') {
      this.fetchServiceProviders();
    } else if (this.activeTab === 'customers') {
      this.fetchCustomers();
    } else if (this.activeTab === 'field_executives') {
      this.fetchFieldExecutives();
    } else if (this.activeTab === 'system_admins') {
      this.fetchSystemAdmins();
    }
  }

  apiTotalRecords: number = 0;
  searchText: string = '';

  onSearch() {
    this.page = 1;
    if (this.activeTab === 'service_providers') {
      this.fetchServiceProviders();
    } else if (this.activeTab === 'customers') {
      this.fetchCustomers();
    } else if (this.activeTab === 'field_executives') {
      this.fetchFieldExecutives();
    } else if (this.activeTab === 'system_admins') {
      this.fetchSystemAdmins();
    }
  }

  onResetSearch() {
    this.searchText = '';
    this.onSearch();
  }

  get totalRecords(): number {
    return this.apiTotalRecords || 0;
  }

  get addButtonText(): string {
    switch (this.activeTab) {
      case 'service_providers': return 'Add New Provider';
      case 'customers': return 'Add New Customer';
      case 'field_executives': return 'Add New Executive';
      case 'system_admins': return 'Add New Admin';
      default: return 'Add New User';
    }
  }

  systemAdmins: any[] = [];
  customers: any[] = [];
  fieldExecutives: any[] = [];

  serviceProviders: any[] = [];

  isModalOpen: boolean = false;
  modalMode: 'add' | 'edit' | 'view' = 'view';
  selectedUser: any = null;
  objectKeys = Object.keys;



  roles: string | null = null;

  constructor(
    private adminService: AdminService, 
    private jwtService: JwtService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.roles = this.jwtService.getadmiRole() as string;
    this.fetchServiceProviders();
    this.fetchPublicCategories();
    this.fetchStates();
  }

  publicCategories: any[] = [];
  publicSpareParts: any[] = [];
  fetchPublicCategories() {
    this.adminService.getPublicVehicleCategories().subscribe({
      next: (res: any) => {
        if (res && (res.status === 200 || res.status === true)) {
          this.publicCategories = res.data || [];
        }
      },
      error: (err) => console.error(err)
    });
  }

  fetchPublicSpareParts() {
    this.adminService.getPublicSpareParts().subscribe({
      next: (res: any) => {
        if (res && (res.status === 200 || res.status === true)) {
          this.publicSpareParts = res.data || [];
        }
      },
      error: (err) => console.error(err)
    });
  }

  states: any[] = [];
  cities: any[] = [];
  districts: any[] = [];

  fetchStates() {
    this.adminService.GetState().subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          this.states = res.data || [];
        }
      },
      error: (err) => console.error(err)
    });
  }

  onStateChange(stateId: any) {
    if (!stateId) {
      this.cities = [];
      this.districts = [];
      return;
    }
    this.adminService.getCity(stateId).subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          this.cities = res.data || [];
        }
      },
      error: (err) => console.error(err)
    });
    this.adminService.getDistrict(stateId).subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          this.districts = res.data || [];
        }
      },
      error: (err) => console.error(err)
    });
  }


  fetchServiceProviders() {
    this.adminService.getServiceProviders(this.tableSize, this.page, this.searchText).subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          const apiData = res.data || [];
          this.serviceProviders = apiData.map((item: any) => {
            const profile = item.service_provider_profile || {};
            return {
              id: item.id,
              name: profile.business_name || 'N/A',
              owner: item.name,
              phone: item.phone_number || profile.business_phone || 'N/A',
              email: item.email || 'N/A',
              categories: profile.vehicle_category && profile.vehicle_category.length ? profile.vehicle_category.map((c: any) => c.name) : [],
              category: profile.vehicle_category && profile.vehicle_category.length ? profile.vehicle_category.map((c: any) => c.name).join(', ') : 'N/A',
              rating: 0, // Fallback
              is_verified: profile.is_verified === 1 || profile.is_verified === true || profile.is_verified === '1',
              status: item.is_active === 1 ? 'Active' : 'Inactive',
              rawData: item
            };
          });

          if (res.pagination && res.pagination.total !== undefined) {
            this.apiTotalRecords = res.pagination.total;
          }
        }
      },
      error: (err: any) => {
        console.error('Failed to fetch service providers', err);
      }
    });
  }

  switchTab(tabName: string) {
    this.activeTab = tabName;
    this.page = 1;
    this.apiTotalRecords = 0;
    this.searchText = '';
    this.tableSize = 10;
    if (tabName === 'service_providers') {
      this.fetchServiceProviders();
    } else if (tabName === 'customers') {
      this.fetchCustomers();
    } else if (tabName === 'field_executives') {
      this.fetchFieldExecutives();
    } else if (tabName === 'system_admins') {
      this.fetchSystemAdmins();
    }
  }

  fetchCustomers() {
    this.adminService.getCustomers(this.tableSize, this.page, this.searchText).subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          const apiData = res.data || [];
          this.customers = apiData.map((item: any) => ({
            id: item.id,
            name: item.name || 'N/A',
            phone: item.phone_number || 'N/A',
            email: item.email || 'N/A',
            profile_image: item.profile_image || null,
            lastActive: 'N/A', // Mocking last active for now
            status: item.is_active === 1 ? 'Active' : 'Inactive',
            rawData: item
          }));

          if (res.pagination && res.pagination.total !== undefined) {
            this.apiTotalRecords = res.pagination.total;
          }
        }
      },
      error: (err) => console.error('Failed to fetch customers', err)
    });
  }

  fetchFieldExecutives() {
    this.adminService.getExecutives(this.tableSize, this.page, this.searchText).subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          const apiData = res.data || [];
          this.fieldExecutives = apiData.map((item: any) => ({
            id: item.id,
            name: item.name || 'N/A',
            email: item.email || 'N/A',
            phone: item.phone_number || 'N/A',
            profile_image: item.executive_profile?.image_url || item.profile_image || null,
            rating: 0,
            status: item.is_active === 1 ? 'Active' : 'Inactive',
            rawData: item
          }));
          if (res.pagination && res.pagination.total !== undefined) {
            this.apiTotalRecords = res.pagination.total;
          }
        }
      },
      error: (err) => console.error('Failed to fetch executives', err)
    });
  }

  fetchSystemAdmins() {
    this.adminService.getSystemAdmins(this.tableSize, this.page, this.searchText).subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          const apiData = res.data || [];
          this.systemAdmins = apiData.map((item: any) => ({
            id: item.id,
            name: item.name || 'N/A',
            phone: item.phone_number || 'N/A',
            email: item.email || 'N/A',
            profile_image: item.profile_image_url || item.profile_image || null,
            role: item.role?.name || 'System Admin',
            status: item.is_active === 1 ? 'Active' : 'Inactive',
            rawData: item
          }));
          if (res.pagination && res.pagination.total !== undefined) {
            this.apiTotalRecords = res.pagination.total;
          }
        }
      },
      error: (err) => console.error('Failed to fetch system admins', err)
    });
  }

  openModal(mode: 'add' | 'edit' | 'view', user?: any) {
    this.modalMode = mode;
    this.selectedUser = user ? { ...user } : {};
    this.isModalOpen = true;

    this.selectedFile = null;
    this.selectedFiles = [];
    this.imagePreviews = [];

    if (mode === 'add') {
      this.selectedUser.vehicle_category_id = [];
      this.selectedUser.spare_part_id = [];
      this.selectedUser.sub_spare_part_id = [];
      this.selectedUser.service_type_id = [];
      this.selectedUser.state_id = null;
      this.selectedUser.city_id = null;
      this.selectedUser.district_id = null;
      this.selectedUser.pincode = '';
      this.cities = [];
    }

    if (this.activeTab === 'service_providers') {
      this.fetchPublicCategories();
      // this.fetchPublicSpareParts();
    }

    if (user && user.id && this.activeTab === 'service_providers') {
      this.adminService.getServiceProviderById(user.id).subscribe({
        next: (res: any) => {
          if (res && res.status === 200) {
            const rawData = res.data;
            const profile = rawData.service_provider_profile || {};
            const ensureArray = (val: any) => {
              if (Array.isArray(val)) return val.map(v => parseInt(v, 10));
              if (val) return [parseInt(val, 10)];
              return [];
            };

            this.selectedUser = {
              id: rawData.id,
              name: profile.business_name || '',
              owner: rawData.name || '',
              phone: rawData.phone_number || '',
              email: rawData.email || '',
              username: rawData.username || '',
              description: profile.business_description || '',
              address: profile.business_address || '',
              imagePreview: profile.image_url || null,
              category: profile.vehicle_category && profile.vehicle_category.length ? profile.vehicle_category.map((c: any) => c.name).join(', ') : 'N/A',
              vehicle_category_id: ensureArray(profile.vehicle_category_id),
              is_service_available: profile.is_service_available === 1 || profile.is_service_available === true || profile.is_service_available === '1',
              is_verified: profile.is_verified === 1 || profile.is_verified === true || profile.is_verified === '1',
              state_id: profile.state_id || null,
              city_id: profile.city_id || null,
              district_id: profile.district_id || null,
              state_name: profile.state || '',
              city_name: profile.city || '',
              district_name: profile.district || '',
              pincode: profile.pincode || '',
              spare_parts_new: profile.spare_parts_new === 1 || profile.spare_parts_new === true || profile.spare_parts_new === '1',
              spare_parts_old: profile.spare_parts_old === 1 || profile.spare_parts_old === true || profile.spare_parts_old === '1',
              status: rawData.is_active === 1 ? 'Active' : 'Inactive',
              rawData: rawData
            };
            
            this.selectedFiles = [];
            this.imagePreviews = [];
            if (profile.gallery && Array.isArray(profile.gallery)) {
                this.imagePreviews = profile.gallery.map((img: any) => img.image_url || img);
            }
            if (this.selectedUser.state_id) {
              this.onStateChange(this.selectedUser.state_id);
            }
          }
        },
        error: (err) => console.error(err)
      });
    } else if (user && user.id && this.activeTab === 'customers' && mode !== 'add') {
      this.adminService.getCustomerById(user.id).subscribe({
        next: (res: any) => {
          if (res && res.status === 200) {
            const rawData = res.data;
            const userData = rawData?.user || {};
            const profileData = rawData?.profile || {};
            this.selectedUser = {
              id: userData.id,
              name: userData.name || '',
              phone: userData.phone_number || '',
              email: userData.email || '',
              username: userData.username || '',
              imagePreview: profileData.profile_image || userData.profile_image || null,
              state_id: profileData.state_id || null,
              city_id: profileData.city_id || null,
              state_name: profileData.state || '',
              city_name: profileData.city || '',
              district_id: profileData.district_id || null,
              district_name: profileData.district || '',
              district: profileData.district || '',
              pincode: profileData.pincode || '',
              status: userData.is_active === 1 ? 'Active' : 'Inactive',
              rawData: rawData
            };
            if (this.selectedUser.state_id) {
              this.onStateChange(this.selectedUser.state_id);
            }
          }
        },
        error: (err) => console.error(err)
      });
    } else if (user && user.id && this.activeTab === 'field_executives' && mode !== 'add') {
      this.adminService.getExecutiveById(user.id).subscribe({
        next: (res: any) => {
          if (res && res.status === 200) {
            const rawData = res.data;
            const userData = rawData?.user || {};
            const profileData = rawData?.profile || rawData?.executive_profile || {};
            this.selectedUser = {
              id: userData.id || rawData.id,
              name: userData.name || rawData.name || '',
              phone: userData.phone_number || rawData.phone_number || '',
              email: userData.email || rawData.email || '',
              username: userData.username || rawData.username || '',
              imagePreview: profileData.image_url || profileData.profile_image || userData.profile_image || rawData.profile_image || null,
              state_id: profileData.state_id || null,
              city_id: profileData.city_id || null,
              state_name: profileData.state || '',
              city_name: profileData.city || '',
              district_id: profileData.district_id || null,
              district_name: profileData.district || '',
              district: profileData.district || '',
              pincode: profileData.pincode || '',
              status: (userData.is_active || rawData.is_active) === 1 ? 'Active' : 'Inactive',
              rawData: rawData
            };
            if (this.selectedUser.state_id) {
              this.onStateChange(this.selectedUser.state_id);
            }
          }
        },
        error: (err) => console.error(err)
      });
    } else if (user && user.id && this.activeTab === 'system_admins' && mode !== 'add') {
      this.adminService.getSystemAdminById(user.id).subscribe({
        next: (res: any) => {
          if (res && res.status === 200) {
            const rawData = res.data;
            const userData = rawData?.user || {};
            const profileData = rawData?.profile || {};
            this.selectedUser = {
              id: userData.id || rawData.id,
              name: userData.name || rawData.name || '',
              phone: userData.phone_number || rawData.phone_number || '',
              email: userData.email || rawData.email || '',
              imagePreview: userData.profile_image_url || rawData.profile_image_url || profileData.profile_image || userData.profile_image || rawData.profile_image || null,
              status: (userData.is_active !== undefined ? userData.is_active : rawData.is_active) === 1 ? 'Active' : 'Inactive',
              role: userData.role?.name || rawData.role?.name || 'System Admin',
              rawData: rawData
            };
          }
        },
        error: (err) => console.error(err)
      });
    }
  }

  toggleSelection(field: string, id: number, event?: any) {
    if (!this.selectedUser[field]) {
      this.selectedUser[field] = [];
    }

    if (field === 'vehicle_category_id') {
      const index = this.selectedUser[field].indexOf(id);
      if (index > -1) {
        this.selectedUser[field].splice(index, 1);
      } else {
        if (this.selectedUser[field].length >= 1) {
          this.notificationService.show('You can select only one vehicle category.', 'error');
          if (event && event.target) {
            event.target.checked = false;
          }
          return;
        }
        this.selectedUser[field].push(id);
      }
      return;
    }

    const index = this.selectedUser[field].indexOf(id);
    if (index > -1) {
      this.selectedUser[field].splice(index, 1);
    } else {
      this.selectedUser[field].push(id);
    }
  }

  isSelectionChecked(field: string, id: number): boolean {
    if (!this.selectedUser[field]) return false;
    return this.selectedUser[field].includes(id);
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedUser = null;
    this.selectedFile = null;
    this.selectedFiles = [];
    this.imagePreviews = [];
  }

  saveUser() {
    if (this.activeTab === 'service_providers') {
      const formData = new FormData();
      formData.append('name', this.selectedUser.owner || '');
      formData.append('email', this.selectedUser.email || '');
      formData.append('phone_number', this.selectedUser.phone || '');
      formData.append('business_name', this.selectedUser.name || '');
      formData.append('business_address', this.selectedUser.address || '');
      formData.append('business_description', this.selectedUser.description || '');
      formData.append('username', this.selectedUser.username || '');
      const appendArrayToFormData = (field: string) => {
        if (this.selectedUser[field] && Array.isArray(this.selectedUser[field])) {
          this.selectedUser[field].forEach((id: number) => {
            formData.append(`${field}[]`, id.toString());
          });
        }
      };

      appendArrayToFormData('vehicle_category_id');
      formData.append('is_service_available', this.selectedUser.is_service_available ? '1' : '0');
      formData.append('is_verified', this.selectedUser.is_verified ? '1' : '0');
      if (this.selectedUser.state_id) formData.append('state_id', this.selectedUser.state_id.toString());
      if (this.selectedUser.city_id) formData.append('city_id', this.selectedUser.city_id.toString());
      if (this.selectedUser.district_id) formData.append('district_id', this.selectedUser.district_id.toString());
      if (this.selectedUser.pincode) formData.append('pincode', this.selectedUser.pincode);
      formData.append('spare_parts_new', this.selectedUser.spare_parts_new ? '1' : '0');
      formData.append('spare_parts_old', this.selectedUser.spare_parts_old ? '1' : '0');
      if (this.selectedFiles && this.selectedFiles.length > 0) {
        this.selectedFiles.forEach((file) => {
          formData.append('gallery[]', file); // Array of images
        });
      }
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      if (this.modalMode === 'add') {
        this.adminService.addServiceProvider(formData).subscribe({
          next: (res: any) => {
            this.notificationService.show(res?.message || 'Service provider added successfully', 'success');
            this.closeModal();
            this.fetchServiceProviders();
          },
          error: (err) => {
            console.error(err);

          }
        });
      } else if (this.modalMode === 'edit') {
        formData.append('id', this.selectedUser.id.toString());
        this.adminService.updateServiceProvider(this.selectedUser.id, formData).subscribe({
          next: (res: any) => {
            this.notificationService.show(res?.message || 'Service provider updated successfully', 'success');
            this.closeModal();
            this.fetchServiceProviders();
          },
          error: (err) => {
            console.error(err);

          }
        });
      }
    } else if (this.activeTab === 'customers') {
      const formData = new FormData();
      formData.append('name', this.selectedUser.name || '');
      formData.append('email', this.selectedUser.email || '');
      formData.append('phone_number', this.selectedUser.phone || '');
      formData.append('username', this.selectedUser.username || '');
      if (this.selectedUser.state_id) formData.append('state_id', this.selectedUser.state_id.toString());
      if (this.selectedUser.city_id) formData.append('city_id', this.selectedUser.city_id.toString());
      if (this.selectedUser.district_id) formData.append('district_id', this.selectedUser.district_id.toString());
      if (this.selectedUser.pincode) formData.append('pincode', this.selectedUser.pincode);
      if (this.selectedFile) formData.append('profile_image', this.selectedFile);

      if (this.modalMode === 'add') {
        this.adminService.addCustomer(formData).subscribe({
          next: (res: any) => {
            this.notificationService.show(res?.message || 'Customer added successfully', 'success');
            this.closeModal();
            this.fetchCustomers();
          },
          error: (err) => {
            console.error(err);

          }
        });
      } else if (this.modalMode === 'edit') {
        formData.append('id', this.selectedUser.id.toString());
        this.adminService.updateCustomer(this.selectedUser.id, formData).subscribe({
          next: (res: any) => {
            this.notificationService.show(res?.message || 'Customer updated successfully', 'success');
            this.closeModal();
            this.fetchCustomers();
          },
          error: (err) => {
            console.error(err);

          }
        });
      }
    } else if (this.activeTab === 'field_executives') {
      const formData = new FormData();
      formData.append('name', this.selectedUser.name || '');
      formData.append('email', this.selectedUser.email || '');
      formData.append('phone_number', this.selectedUser.phone || '');
      formData.append('username', this.selectedUser.username || '');
      if (this.selectedUser.state_id) formData.append('state_id', this.selectedUser.state_id.toString());
      if (this.selectedUser.city_id) formData.append('city_id', this.selectedUser.city_id.toString());
      if (this.selectedUser.district_id) formData.append('district_id', this.selectedUser.district_id.toString());
      if (this.selectedUser.pincode) formData.append('pincode', this.selectedUser.pincode);
      if (this.selectedFile) formData.append('image', this.selectedFile);

      if (this.modalMode === 'add') {
        this.adminService.addExecutive(formData).subscribe({
          next: (res: any) => { 
            this.notificationService.show(res?.message || 'Field executive added successfully', 'success');
            this.closeModal(); 
            this.fetchFieldExecutives(); 
          },
          error: (err) => {
            console.error(err);

          }
        });
      } else if (this.modalMode === 'edit') {
        formData.append('id', this.selectedUser.id.toString());
        this.adminService.updateExecutive(this.selectedUser.id, formData).subscribe({
          next: (res: any) => { 
            this.notificationService.show(res?.message || 'Field executive updated successfully', 'success');
            this.closeModal(); 
            this.fetchFieldExecutives(); 
          },
          error: (err) => {
            console.error(err);

          }
        });
      }
    } else if (this.activeTab === 'system_admins') {
      const formData = new FormData();
      formData.append('name', this.selectedUser.name || '');
      formData.append('email', this.selectedUser.email || '');
      formData.append('phone_number', this.selectedUser.phone || '');
      if (this.selectedFile) formData.append('image', this.selectedFile);

      if (this.modalMode === 'add') {
        this.adminService.addSystemAdmin(formData).subscribe({
          next: (res: any) => { 
            this.notificationService.show(res?.message || 'System admin added successfully', 'success');
            this.closeModal(); 
            this.fetchSystemAdmins(); 
          },
          error: (err) => {
            console.error(err);

          }
        });
      } else if (this.modalMode === 'edit') {
        formData.append('id', this.selectedUser.id.toString());
        this.adminService.updateSystemAdmin(this.selectedUser.id, formData).subscribe({
          next: (res: any) => { 
            this.notificationService.show(res?.message || 'System admin updated successfully', 'success');
            this.closeModal(); 
            this.fetchSystemAdmins(); 
          },
          error: (err) => {
            console.error(err);

          }
        });
      }
    } else {
      this.closeModal();
    }
  }

  selectedFile: File | null = null;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  onImageSelected(event: Event, type: 'single' | 'multi' = 'single') {
    const input = event.target as HTMLInputElement;
    if (type === 'multi') {
      if (input.files && input.files.length > 0) {
        const files = Array.from(input.files);
        const remainingSlots = 3 - this.imagePreviews.length;
        
        if (files.length > remainingSlots) {
          alert(`You can only upload a maximum of 3 images. You can add ${remainingSlots} more.`);
        }

        const filesToAdd = files.slice(0, remainingSlots);

        filesToAdd.forEach(file => {
          this.selectedFiles.push(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            this.imagePreviews.push(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      }
      if (input) {
        input.value = '';
      }
    } else {
      if (input.files && input.files[0]) {
        this.selectedFile = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          if (this.selectedUser) {
            this.selectedUser.imagePreview = e.target?.result as string;
          }
        };
        reader.readAsDataURL(input.files[0]);
      }
    }
  }

  removeImage(index: number) {
    const existingImagesCount = this.imagePreviews.length - this.selectedFiles.length;
    if (index >= existingImagesCount) {
      // It's a newly added file
      this.selectedFiles.splice(index - existingImagesCount, 1);
    } else {
      // It's an existing image being removed from view
      // Additional backend logic might be required to actually delete the image.
    }
    this.imagePreviews.splice(index, 1);
  }

  verifyProvider(provider: any, isApproved: boolean) {
    this.adminService.verifyVendor(provider.id, isApproved).subscribe({
      next: (res: any) => {
        this.notificationService.show(res?.message || `Provider successfully ${isApproved ? 'approved' : 'rejected'}.`, 'success');
        // Refresh the list to get updated verification status
        this.fetchServiceProviders();
      },
      error: (err) => {
        console.error('Failed to verify provider', err);
      }
    });
  }



  toggleStatus(provider: any) {
    if (this.activeTab === 'service_providers') {
      this.adminService.updateServiceProviderStatus(provider.id).subscribe({
        next: (res: any) => {
          provider.status = provider.status === 'Active' ? 'Inactive' : 'Active';
          if (provider.rawData) {
            provider.rawData.is_active = provider.rawData.is_active === 1 ? 0 : 1;
          }
          this.notificationService.show(res?.message || 'Status updated successfully', 'success');
        },
        error: (err) => {
          console.error('Failed to toggle status', err);

        }
      });
    } else if (this.activeTab === 'customers') {
      this.adminService.updateCustomerStatus(provider.id).subscribe({
        next: (res: any) => {
          provider.status = provider.status === 'Active' ? 'Inactive' : 'Active';
          if (provider.rawData) {
            provider.rawData.is_active = provider.rawData.is_active === 1 ? 0 : 1;
          }
          this.notificationService.show(res?.message || 'Status updated successfully', 'success');
        },
        error: (err) => {
          console.error('Failed to toggle status', err);

        }
      });
    } else if (this.activeTab === 'field_executives') {
      this.adminService.updateExecutiveStatus(provider.id).subscribe({
        next: (res: any) => {
          provider.status = provider.status === 'Active' ? 'Inactive' : 'Active';
          if (provider.rawData) {
            if (provider.rawData.user) provider.rawData.user.is_active = provider.status === 'Active' ? 1 : 0;
            else provider.rawData.is_active = provider.status === 'Active' ? 1 : 0;
          }
          this.notificationService.show(res?.message || 'Status updated successfully', 'success');
        },
        error: (err) => {
          console.error('Failed to toggle status', err);

        }
      });
    } else if (this.activeTab === 'system_admins') {
      this.adminService.updateSystemAdminStatus(provider.id).subscribe({
        next: (res: any) => {
          provider.status = provider.status === 'Active' ? 'Inactive' : 'Active';
          if (provider.rawData) {
            if (provider.rawData.user) provider.rawData.user.is_active = provider.status === 'Active' ? 1 : 0;
            else provider.rawData.is_active = provider.status === 'Active' ? 1 : 0;
          }
          this.notificationService.show(res?.message || 'Status updated successfully', 'success');
        },
        error: (err) => {
          console.error('Failed to toggle status', err);

        }
      });
    }
  }
}
