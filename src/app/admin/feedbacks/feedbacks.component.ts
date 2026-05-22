import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feedbacks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedbacks.component.html',
  styleUrl: './feedbacks.component.scss'
})
export class FeedbacksComponent implements OnInit {
  feedbacks = [
    { id: 'FB-001', customerName: 'Rahul Verma', providerName: 'AutoCare Garage', rating: 5, comment: 'Excellent service, fixed my car in 2 hours!', date: '21-May-2026', status: 'Visible' },
    { id: 'FB-002', customerName: 'Priya Singh', providerName: 'Bike Masters', rating: 2, comment: 'Charged more than quoted. Not happy.', date: '20-May-2026', status: 'Visible' },
    { id: 'FB-003', customerName: 'Amit Kumar', providerName: 'Elite Motors', rating: 1, comment: 'Fake parts used! Do not go here.', date: '19-May-2026', status: 'Hidden' },
    { id: 'FB-004', customerName: 'Neha Sharma', providerName: 'Speedy Tyres', rating: 4, comment: 'Good work but slightly delayed.', date: '18-May-2026', status: 'Visible' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  toggleVisibility(feedback: any) {
    feedback.status = feedback.status === 'Visible' ? 'Hidden' : 'Visible';
  }
}
