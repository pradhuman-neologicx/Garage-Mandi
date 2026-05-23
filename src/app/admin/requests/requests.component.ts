import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.scss'
})
export class RequestsComponent implements OnInit {

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
    return this.customerRequests.length;
  }

  customerRequests: any[] = [
    { reqId: 'REQ-1001', customer: 'Amit Kumar', vehicle: 'Hyundai i20', service: 'Engine Repair', date: '22-May-2026', images: 2, status: 'Open' },
    { reqId: 'REQ-1002', customer: 'Priya Singh', vehicle: 'Honda Activa', service: 'General Service', date: '21-May-2026', images: 0, status: 'Quoted' },
    { reqId: 'REQ-1003', customer: 'Rahul Verma', vehicle: 'Maruti Swift', service: 'AC Gas Refill', date: '21-May-2026', images: 1, status: 'Closed' }
  ];

  quotations = [
    { quoteId: 'QT-5001', reqId: 'REQ-1002', provider: 'Bike Masters', customer: 'Priya Singh', vehicle: 'Honda Activa', service: 'General Service', date: '21-May-2026', status: 'Submitted', pricing: 'Hidden', images: 0 },
    { quoteId: 'QT-5002', reqId: 'REQ-1002', provider: 'Speedy Auto', customer: 'Priya Singh', vehicle: 'Honda Activa', service: 'General Service', date: '21-May-2026', status: 'Submitted', pricing: 'Hidden', images: 0 },
    { quoteId: 'QT-5003', reqId: 'REQ-1003', provider: 'Elite Motors', customer: 'Rahul Verma', vehicle: 'Maruti Swift', service: 'AC Gas Refill', date: '21-May-2026', status: 'Accepted', pricing: 'Hidden', images: 1 }
  ];

  isViewModalOpen: boolean = false;
  selectedRequest: any = null;

  constructor() { }

  ngOnInit(): void {
    // Attach quotes to customer requests
    this.customerRequests.forEach(req => {
      const relatedQuotes = this.quotations.filter(q => q.reqId === req.reqId);
      (req as any).quotes = relatedQuotes;
      (req as any).quoteCount = relatedQuotes.length;
    });
  }

  openViewModal(data: any) {
    this.selectedRequest = data;
    this.isViewModalOpen = true;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
    this.selectedRequest = null;
  }
}
