import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-provider-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './provider-subscription.component.html',
  styleUrl: './provider-subscription.component.scss'
})
export class ProviderSubscriptionComponent implements OnInit {
  mySubscriptions: any[] = [];
  plans: any[] = [];
  selectedPlans: Set<number> = new Set();
  isLoading = true;
  isSubmitting = false;
  showExecutiveModal = false;
  executiveCode = '';

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.fetchPlans();
  }

  fetchPlans() {
    // 1. Fetch My Active Subscriptions
    this.customerService.getProviderSubscriptions().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 200 && res.data) {
          this.mySubscriptions = Array.isArray(res.data) ? res.data : [];
        }

        // 2. Fetch Available Plans (Mocked for now since endpoint is not provided)
        this.loadAvailablePlans();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.loadAvailablePlans();
      }
    });
  }

  loadAvailablePlans() {
    // Dummy available plans (these should ideally come from another API like /api/v1/plans)
    const allPlans = [
      { id: 1, name: 'Two-Wheeler Service Provider & Parts Seller', price: 200, category: 'Two Wheeler', icon: 'fa-motorcycle' },
      { id: 2, name: 'Two-Wheeler Second-Hand Vehicle Reseller', price: 599, category: 'Two Wheeler', icon: 'fa-motorcycle' },
      { id: 3, name: 'Four-Wheeler Complete Package', price: 999, category: 'Four Wheeler', icon: 'fa-car' },
      { id: 4, name: 'Heavy Commercial Vehicle Service', price: 1499, category: 'Commercial', icon: 'fa-truck' }
    ];

    // Optional: Filter out already active plans from available plans
    const activePlanIds = this.mySubscriptions.map(s => s.plan_id);
    this.plans = allPlans.filter(p => !activePlanIds.includes(p.id));
  }

  togglePlan(planId: number) {
    if (this.selectedPlans.has(planId)) {
      this.selectedPlans.delete(planId);
    } else {
      this.selectedPlans.add(planId);
    }
  }

  isSelected(planId: number): boolean {
    return this.selectedPlans.has(planId);
  }

  get subtotal(): number {
    return this.plans.filter(p => this.selectedPlans.has(p.id)).reduce((sum, p) => sum + Number(p.price), 0);
  }

  get gstAmount(): number {
    return this.subtotal * 0.18;
  }

  get totalAmount(): number {
    return this.subtotal + this.gstAmount;
  }

  openModal() {
    if (this.selectedPlans.size > 0) {
      this.showExecutiveModal = true;
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  }

  closeModal() {
    this.showExecutiveModal = false;
    document.body.style.overflow = 'auto';
    this.executiveCode = '';
  }

  subscribe(withCode: boolean) {
    this.isSubmitting = true;
    const payload = {
      plan_ids: Array.from(this.selectedPlans),
      executive_code: withCode ? this.executiveCode : null
    };
    
    // Simulate API delay
    setTimeout(() => {
      this.isSubmitting = false;
      this.closeModal();
      alert('Subscription feature will be integrated with the final purchase endpoint shortly.');
    }, 1500);
  }
}
