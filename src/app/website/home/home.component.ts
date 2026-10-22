import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  currentYear: number;
  currentScreen = 0;

  // Coming Soon Modal State
  isComingSoonModalOpen = false;
  selectedPlatform: 'Google Play' | 'App Store' = 'Google Play';
  notifyEmail = '';
  isNotified = false;
  features = [
    {
      icon: 'fa-solid fa-warehouse',
      title: 'Verified Garages',
      description: 'Every workshop and mechanic on our platform is verified, rated, and reviewed by real customers.',
    },
    {
      icon: 'fa-solid fa-gears',
      title: 'Spare Parts Marketplace',
      description: 'Find new & used spare parts from trusted vendors at competitive prices — all vehicle types.',
    },
    {
      icon: 'fa-solid fa-file-invoice',
      title: 'Multiple Quotes',
      description: 'Request service quotes from multiple garages and pick the one that fits your budget perfectly.',
    },
    {
      icon: 'fa-solid fa-person-digging',
      title: 'Doorstep Service',
      description: 'Book a certified field executive to come to your location for on-site repairs and inspections.',
    },
    {
      icon: 'fa-solid fa-star-half-stroke',
      title: 'Ratings & Reviews',
      description: 'Make informed choices with transparent ratings, reviews, and service history for every provider.',
    },
    {
      icon: 'fa-solid fa-shield-halved',
      title: 'Secure & Trusted',
      description: 'All transactions and customer data are protected. Your safety is our top priority.',
    },
  ];


  constructor() {
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit(): void {}

  openComingSoon(platform: 'Google Play' | 'App Store' = 'Google Play', event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.selectedPlatform = platform;
    this.isComingSoonModalOpen = true;
    this.isNotified = false;
    this.notifyEmail = '';
  }

  closeComingSoon(): void {
    this.isComingSoonModalOpen = false;
  }



  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isComingSoonModalOpen) {
      this.closeComingSoon();
    }
  }

  nextScreen() {
    if (this.currentScreen < 5) {
      this.currentScreen++;
    }
  }

  previousScreen() {
    if (this.currentScreen > 0) {
      this.currentScreen--;
    }
  }
}
