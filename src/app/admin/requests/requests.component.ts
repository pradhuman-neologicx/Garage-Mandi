import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { AdminService } from '../../core/services/admin.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, FormsModule],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.scss'
})
export class RequestsComponent implements OnInit {

  tableSize: any = 9;
  tableSizes: any = [9, 12, 15, 18, 'all'];
  page: number = 1;
  totalRecords: number = 0;
  searchText: string = '';

  customerRequests: any[] = [];
  
  isViewModalOpen: boolean = false;
  selectedRequest: any = null;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.fetchRequests();
  }

  fetchRequests(): void {
    this.adminService.getRequests(this.tableSize, this.page, this.searchText).subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          const data = res.data || [];
          this.totalRecords = res.pagination?.total || data.length;
          
          this.customerRequests = data.map((req: any, index: number) => {
            const baseIndex = this.tableSize !== 'all' ? (this.page - 1) * this.tableSize : 0;
            req.srNo = baseIndex + index + 1;
            return req;
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.fetchRequests();
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.fetchRequests();
  }

  onSearchChange() {
    this.page = 1;
    this.fetchRequests();
  }

  clearSearch() {
    this.searchText = '';
    this.onSearchChange();
  }

  openViewModal(data: any) {
    this.selectedRequest = null; // Will populate via API
    this.isViewModalOpen = true;

    this.adminService.getRequestById(data.id, data.type).subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          this.selectedRequest = res.data;
          this.selectedRequest.srNo = data.srNo;
        }
      },
      error: (err) => {
        console.error(err);
        this.isViewModalOpen = false;
      }
    });
  }

  closeViewModal() {
    this.isViewModalOpen = false;
    this.selectedRequest = null;
  }

  isString(val: any): boolean {
    return typeof val === 'string';
  }
}
