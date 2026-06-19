import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-vehicle-resale',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './vehicle-resale.component.html',
  styleUrl: './vehicle-resale.component.scss'
})
export class VehicleResaleComponent implements OnInit {
  activeTab: 'listings' | 'requests' = 'listings';

  // Pagination configs
  tableSize: any = 9;
  tableSizes: any = [9, 12, 15, 18, 'all'];
  listingPage: number = 1;
  requestPage: number = 1;
  listingTotalRecords: number = 0;
  requestTotalRecords: number = 0;

  constructor(private adminService: AdminService) {}

  // Data
  vehicleListings: any[] = [];
  interestRequests: any[] = [];

  searchText: string = '';

  isViewModalOpen: boolean = false;
  selectedVehicle: any = null;

  openViewModal(listing: any) {
    this.selectedVehicle = listing;
    this.isViewModalOpen = true;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
    this.selectedVehicle = null;
  }

  openImageInNewTab(imageUrl: string) {
    if (imageUrl && !imageUrl.includes('placeholder-car.png')) {
      window.open(imageUrl, '_blank');
    }
  }

  ngOnInit() {
    this.fetchVehicles();
    this.fetchRequests();
  }

  onSearchChange() {
    if (this.activeTab === 'listings') {
      this.listingPage = 1;
      this.fetchVehicles();
    } else {
      this.requestPage = 1;
      this.fetchRequests();
    }
  }

  clearSearch() {
    this.searchText = '';
    this.onSearchChange();
  }

  fetchVehicles() {
    this.adminService.getResellVehicles(this.tableSize, this.listingPage, this.searchText).subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          this.vehicleListings = res.data.map((item: any) => {
            return {
              id: item.id,
              // Fallback to placeholder if image isn't provided by API
              image: item.images && item.images.length > 0 ? item.images[0].file_url : 'assets/images/placeholder-car.png',
              brandModel: `${item.brand?.name || ''} ${item.vehicle_model || ''}`.trim(),
              vehicleType: item.vehicle_category?.name || 'N/A',
              mfgYear: item.manufacturing_year || 'N/A',
              price: item.price,
              fuelType: item.fuel_type?.name || 'N/A',
              description: item.description,
              provider: { 
                name: item.provider?.name || 'Unknown', 
                business: item.provider?.business_name || 'N/A',
                phone: item.provider?.phone_number || 'N/A',
                email: item.provider?.email || 'N/A'
              },
              isActive: item.is_active === 1,
              dateAdded: this.formatDate(item.created_at),
              registrationNumber: item.registration_number || 'N/A',
              images: item.images || []
            };
          });
          this.listingTotalRecords = res.pagination?.total || 0;
        }
      },
      error: (err: any) => {
        console.error('Error fetching resell vehicles', err);
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate().toString().padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  fetchRequests() {
    this.adminService.getResellVehicleInterests(this.tableSize, this.requestPage, this.searchText).subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          this.interestRequests = res.data.map((item: any) => ({
            id: item.id,
            customer: { 
              name: item.customer?.name || 'Unknown', 
              phone: item.customer?.phone_number || 'N/A', 
              email: item.customer?.email || 'N/A' 
            },
            vehicle: { 
              brandModel: `${item.vehicle?.brand?.name || ''} ${item.vehicle?.vehicle_model || ''}`.trim() || 'Unknown Vehicle',
              price: item.vehicle?.price || 'N/A',
              id: item.vehicle?.id
            },
            provider: {
              name: item.provider?.name || 'Unknown',
              business: item.provider?.business_name || 'N/A'
            },
            requestDate: this.formatDate(item.created_at)
          }));
          this.requestTotalRecords = res.pagination?.total || 0;
        }
      },
      error: (err: any) => {
        console.error('Error fetching resell vehicle interests', err);
      }
    });
  }

  switchTab(tab: 'listings' | 'requests') {
    this.activeTab = tab;
    this.listingPage = 1;
    this.requestPage = 1;
  }

  onTableSizeChange(event: any) {
    this.tableSize = event.target.value;
    this.listingPage = 1;
    this.requestPage = 1;
    if (this.activeTab === 'listings') {
      this.fetchVehicles();
    } else {
      this.fetchRequests();
    }
  }

  onListingPageChange(event: number) {
    this.listingPage = event;
    this.fetchVehicles();
  }

  onRequestPageChange(event: number) {
    this.requestPage = event;
    this.fetchRequests();
  }

  toggleListingStatus(listing: any) {
    const originalStatus = listing.isActive;
    listing.isActive = !listing.isActive;
    
    this.adminService.toggleResellVehicleStatus(listing.id).subscribe({
      next: (res: any) => {
        // Success: status updated
      },
      error: (err: any) => {
        console.error('Error toggling vehicle status', err);
        listing.isActive = originalStatus; // Revert on failure
      }
    });
  }
}
