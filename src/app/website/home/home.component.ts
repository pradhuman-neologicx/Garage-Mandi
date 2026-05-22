import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  currentYear: number;
  features = [
    {
      icon: 'fa-solid fa-chart-line',
      title: 'Modern Admin Panel',
      description:
        'Manage users, tests, and reports with a sleek, responsive dashboard.',
    },
    {
      icon: 'fa-solid fa-shield-halved',
      title: 'Secure & Reliable',
      description:
        'Ensure data privacy and security for all your laboratory operations.',
    },
    {
      icon: 'fa-solid fa-mobile-screen-button',
      title: 'Easy Access',
      description: 'Access your lab data anytime, anywhere, on any device.',
    },
  ];

  constructor() {
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit(): void {}
  currentScreen = 0;

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
