import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../../core/services/customer.service';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-search-vehicle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './search-vehicle.component.html',
  styleUrls: ['./search-vehicle.component.scss']
})
export class SearchVehicleComponent implements OnInit {
  vehicles: any[] = [];
  categories: any[] = [];

  // Filters
  selectedCategory: string = '';
  minPrice: string = '';
  maxPrice: string = '';

  isLoading = false;

  constructor(private customerService: CustomerService) { }

  ngOnInit(): void {
    this.fetchCategories();
    this.searchVehicles();
  }

  fetchCategories() {
    this.customerService.getVehicleCategories().subscribe({
      next: (res: any) => {
        this.categories = res.data || [];
      }
    });
  }

  searchVehicles() {
    this.isLoading = true;
    const params: any = {};
    if (this.selectedCategory) params.vehicle_category_id = this.selectedCategory;
    if (this.minPrice) params.min_price = this.minPrice;
    if (this.maxPrice) params.max_price = this.maxPrice;

    this.customerService.searchResellVehicles(params).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.vehicles = res.data || [];
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  clearFilters() {
    this.selectedCategory = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.searchVehicles();
  }

  // Interest Tracking
  addingInterestId: number | null = null;
  interestedIds: Set<number> = new Set();

  addToInterests(vehicleId: number) {
    if (this.addingInterestId === vehicleId || this.interestedIds.has(vehicleId)) return;

    this.addingInterestId = vehicleId;
    this.customerService.addVehicleToInterests(vehicleId).subscribe({
      next: () => {
        this.addingInterestId = null;
        this.interestedIds.add(vehicleId);
      },
      error: (err) => {
        this.addingInterestId = null;
        const msg = err || 'Failed to add to interests.';
        alert(msg);
      }
    });
  }
}
