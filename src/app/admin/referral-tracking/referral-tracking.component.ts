import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-referral-tracking',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './referral-tracking.component.html',
  styleUrl: './referral-tracking.component.scss'
})
export class ReferralTrackingComponent implements OnInit {
  tableSize: any = 10;
  tableSizes: any = [10, 20, 50, 100, 'all'];
  page: number = 1;

  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
  }

  onTableDataChange(event: any) {
    this.page = event;
  }

  get totalRecords(): number {
    return this.referrals.length;
  }

  stats = {
    totalReferrals: 124,
    successfulOnboards: 89,
    pending: 35,
    totalRewards: 44500
  };

  referrals = [
    { id: 'REF-8001', referrer: 'Ramesh Singh (EMP-101)', garage: 'Speedy Auto Works', date: '22-May-2026', status: 'Onboarded', reward: '₹500' },
    { id: 'REF-8002', referrer: 'Vikash Kumar (EMP-104)', garage: 'Two Wheeler Point', date: '21-May-2026', status: 'Pending', reward: '-' },
    { id: 'REF-8003', referrer: 'Rahul Verma (Customer)', garage: 'Elite Motors', date: '20-May-2026', status: 'Subscribed', reward: '₹1000' },
    { id: 'REF-8004', referrer: 'Sunil Das (EMP-102)', garage: 'Delhi Auto Garage', date: '19-May-2026', status: 'Subscribed', reward: '₹500' }
  ];

  constructor() { }

  ngOnInit(): void {
  }
}
