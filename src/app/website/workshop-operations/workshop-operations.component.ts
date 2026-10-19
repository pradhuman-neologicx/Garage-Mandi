import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-workshop-operations',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './workshop-operations.component.html',
  styleUrl: './workshop-operations.component.scss'
})
export class WorkshopOperationsComponent {
  operations = [
    { 
      title: 'Incoming Requests', 
      icon: 'fa-solid fa-inbox', 
      link: '/incoming-requests', 
      desc: 'View customer service inquiries and submit quotes',
      color: 'text-red-500', 
      bg: 'bg-red-100',
      border: 'border-red-200 hover:border-red-400'
    },
    { 
      title: 'Subscription', 
      icon: 'fa-solid fa-crown', 
      link: '/subscription', 
      desc: 'Manage your active plans and billing',
      color: 'text-amber-500', 
      bg: 'bg-amber-100',
      border: 'border-amber-200 hover:border-amber-400'
    },
    { 
      title: 'Create Service Request', 
      icon: 'fa-solid fa-wrench', 
      link: '/request-service', 
      desc: 'Start a new service for a customer',
      color: 'text-blue-500', 
      bg: 'bg-blue-100',
      border: 'border-blue-200 hover:border-blue-400'
    },
    { 
      title: 'Spare Part Inquiry', 
      icon: 'fa-solid fa-cogs', 
      link: '/request-spare-part', 
      desc: 'Look up and inquire about spare parts',
      color: 'text-purple-500', 
      bg: 'bg-purple-100',
      border: 'border-purple-200 hover:border-purple-400'
    },
    { 
      title: 'My Requests', 
      icon: 'fa-solid fa-list-check', 
      link: '/my-requests', 
      desc: 'Track your ongoing and past requests',
      color: 'text-green-500', 
      bg: 'bg-green-100',
      border: 'border-green-200 hover:border-green-400'
    },
    { 
      title: 'Workshop Profile', 
      icon: 'fa-solid fa-store', 
      link: '/provider-profile', 
      desc: 'Update your workshop details and gallery',
      color: 'text-indigo-500', 
      bg: 'bg-indigo-100',
      border: 'border-indigo-200 hover:border-indigo-400'
    },
    { 
      title: 'Purchase Request', 
      icon: 'fa-solid fa-cart-shopping', 
      link: '/purchase-requests', 
      desc: 'View customer purchase requests and submit quotes',
      color: 'text-teal-500', 
      bg: 'bg-teal-100',
      border: 'border-teal-200 hover:border-teal-400'
    },
    { 
      title: 'Purchase Quotations', 
      icon: 'fa-solid fa-file-invoice-dollar', 
      link: '/purchase-quotations', 
      desc: 'Review quotes received from sellers',
      color: 'text-rose-500', 
      bg: 'bg-rose-100',
      border: 'border-rose-200 hover:border-rose-400'
    },
    { 
      title: 'Confirmed Orders', 
      icon: 'fa-solid fa-boxes-packing', 
      link: '/confirmed-orders', 
      desc: 'Process paid orders and mark ready for pickup',
      color: 'text-emerald-500', 
      bg: 'bg-emerald-100',
      border: 'border-emerald-200 hover:border-emerald-400'
    },
    { 
      title: 'Quotes Sent', 
      icon: 'fa-solid fa-paper-plane', 
      link: '/service-quote-sent', 
      desc: 'View all service quotations sent to customers',
      color: 'text-blue-600', 
      bg: 'bg-blue-100',
      border: 'border-blue-200 hover:border-blue-400'
    },
    { 
      title: 'Customer Vehicle Requests', 
      icon: 'fa-solid fa-car-side', 
      link: '/customer-vehicle-requests', 
      desc: 'View vehicle buyer interest leads and inquiries',
      color: 'text-amber-600', 
      bg: 'bg-amber-100',
      border: 'border-amber-200 hover:border-amber-400'
    },
    { 
      title: 'My Resale Vehicles', 
      icon: 'fa-solid fa-car-tunnel', 
      link: '/my-resale-vehicles', 
      desc: 'Manage resale inventory, add, edit and delete vehicle listings',
      color: 'text-rose-600', 
      bg: 'bg-rose-100',
      border: 'border-rose-200 hover:border-rose-400'
    },
  ];
}
