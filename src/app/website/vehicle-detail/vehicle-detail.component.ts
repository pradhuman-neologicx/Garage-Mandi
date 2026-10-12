import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CustomerService } from '../../core/services/customer.service';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './vehicle-detail.component.html',
  styleUrls: ['./vehicle-detail.component.scss']
})
export class VehicleDetailComponent implements OnInit {
  vehicleId: string = '';
  vehicle: any = null;
  isLoading = true;
  isAddingInterest = false;
  interestSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.vehicleId = params.get('id') || '';
      if (this.vehicleId) {
        this.fetchVehicleDetails();
      }
    });
  }

  fetchVehicleDetails() {
    this.isLoading = true;
    this.customerService.getResellVehicleDetails(this.vehicleId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.vehicle = res.data;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  addToInterests() {
    if (this.isAddingInterest || this.interestSuccess) return;
    
    this.isAddingInterest = true;
    this.customerService.addVehicleToInterests(this.vehicleId).subscribe({
      next: (res: any) => {
        this.isAddingInterest = false;
        this.interestSuccess = true;
      },
      error: (err) => {
        this.isAddingInterest = false;
        const msg = err.error?.message || 'Failed to add to interests. Please try again.';
        alert(msg);
      }
    });
  }
}
