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
      title: 'My Purchase Request', 
      icon: 'fa-solid fa-cart-shopping', 
      link: '#', 
      desc: 'View requests you have made for items',
      color: 'text-teal-500', 
      bg: 'bg-teal-100',
      border: 'border-teal-200 hover:border-teal-400'
    },
    { 
      title: 'Purchase Quotations', 
      icon: 'fa-solid fa-file-invoice-dollar', 
      link: '#', 
      desc: 'Review quotes received from sellers',
      color: 'text-rose-500', 
      bg: 'bg-rose-100',
      border: 'border-rose-200 hover:border-rose-400'
    },
  ];
}
