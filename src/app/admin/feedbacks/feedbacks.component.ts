import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-feedbacks',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, FormsModule],
  templateUrl: './feedbacks.component.html',
  styleUrl: './feedbacks.component.scss'
})
export class FeedbacksComponent implements OnInit {
  tableSize: any = 9;
  tableSizes: any = [9, 12, 15, 18, 'all'];
  page: number = 1;
  totalRecords: number = 0;
  searchText: string = '';

  feedbacks: any[] = [];

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.fetchFeedbacks();
  }

  fetchFeedbacks(): void {
    this.adminService.getFeedbacks(this.tableSize, this.page, this.searchText).subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          const data = res.data || [];
          this.totalRecords = res.pagination?.total || data.length;
          this.feedbacks = data.map((fb: any, index: number) => {
            const baseIndex = this.tableSize !== 'all' ? (this.page - 1) * this.tableSize : 0;
            fb.srNo = baseIndex + index + 1;
            return fb;
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.fetchFeedbacks();
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.fetchFeedbacks();
  }

  onSearchChange() {
    this.page = 1;
    this.fetchFeedbacks();
  }

  clearSearch() {
    this.searchText = '';
    this.onSearchChange();
  }

  toggleVisibility(feedback: any) {
    // API logic for toggling visibility can be implemented here if an endpoint exists
    feedback.is_feedback_visible = !feedback.is_feedback_visible;
  }
}
