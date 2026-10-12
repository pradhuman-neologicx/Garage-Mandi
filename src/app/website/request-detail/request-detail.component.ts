import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CustomerService } from 'src/app/core/services/customer.service';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './request-detail.component.html',
  styleUrl: './request-detail.component.scss'
})
export class RequestDetailComponent implements OnInit {
  type: string = '';
  id: string = '';
  isLoading = true;
  requestDetail: any = null;
  errorMsg: string = '';

  showModal: boolean = false;
  modalLoading: boolean = false;
  quotationDetail: any = null;
  
  previewMedia: any = null;

  // Feedback State
  isFeedbackModalOpen: boolean = false;
  submittingFeedback: boolean = false;
  feedbackProviderId: number | null = null;
  feedbackQuoteId: number | null = null;
  feedbackForm = {
    fulfilled: null as unknown as boolean,
    give_feedback: null as unknown as boolean,
    rating: 0,
    feedback_text: ''
  };

  constructor(
    private route: ActivatedRoute,
    private customerService: CustomerService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.type = params.get('type') || '';
      this.id = params.get('id') || '';
      if (this.type && this.id) {
        this.fetchDetails();
      } else {
        this.errorMsg = 'Invalid Request parameters.';
        this.isLoading = false;
      }
    });
  }

  fetchDetails() {
    this.isLoading = true;
    this.errorMsg = '';
    
    if (this.type === 'service') {
      this.customerService.getServiceRequestDetails(this.id).subscribe({
        next: (res: any) => {
          this.requestDetail = res.data || res;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMsg = 'Failed to load service request details.';
          this.isLoading = false;
        }
      });
    } else if (this.type === 'spare') {
      this.customerService.getSparePartRequestDetails(this.id).subscribe({
        next: (res: any) => {
          this.requestDetail = res.data || res;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMsg = 'Failed to load spare part request details.';
          this.isLoading = false;
        }
      });
    } else {
      this.errorMsg = 'Invalid request type.';
      this.isLoading = false;
    }
  }


  getStatusClass(status: string): string {
    const s = status?.toLowerCase() || '';
    if (s === 'completed' || s === 'delivered' || s === 'closed' || s === 'complete') return 'bg-green-100 text-green-800';
    if (s === 'pending' || s === 'processing' || s === 'open' || s === 'new') return 'bg-yellow-100 text-yellow-800';
    if (s === 'cancelled' || s === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  }

  openQuotationModal(quotationId: number) {
    this.showModal = true;
    this.modalLoading = true;
    this.quotationDetail = null;
    document.body.style.overflow = 'hidden';

    if (this.type === 'spare') {
      this.customerService.getSparePartQuotationDetails(quotationId).subscribe({
        next: (res: any) => {
          this.quotationDetail = res.data || res;
          this.modalLoading = false;
        },
        error: () => {
          this.modalLoading = false;
        }
      });
    } else {
      this.customerService.getQuotationDetails(quotationId).subscribe({
        next: (res: any) => {
          this.quotationDetail = res.data || res;
          this.modalLoading = false;
        },
        error: () => {
          this.modalLoading = false;
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.quotationDetail = null;
    document.body.style.overflow = '';
  }

  openMediaPreview(media: any) {
    this.previewMedia = media;
    document.body.style.overflow = 'hidden';
  }

  closeMediaPreview() {
    this.previewMedia = null;
    document.body.style.overflow = '';
  }

  openFeedbackModal(providerId: number, quoteId: number) {
    this.feedbackProviderId = providerId;
    this.feedbackQuoteId = quoteId;
    this.feedbackForm = {
      fulfilled: null as unknown as boolean,
      give_feedback: null as unknown as boolean,
      rating: 0,
      feedback_text: ''
    };
    this.isFeedbackModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeFeedbackModal() {
    this.isFeedbackModalOpen = false;
    this.feedbackProviderId = null;
    this.feedbackQuoteId = null;
    document.body.style.overflow = '';
  }

  setRating(rating: number) {
    this.feedbackForm.rating = rating;
  }

  submitFeedback() {
    if (!this.feedbackProviderId) return;

    const payload: any = {
      fulfilled: this.feedbackForm.fulfilled,
      provider_id: this.feedbackProviderId
    };

    if (this.feedbackForm.give_feedback) {
      payload.rating = this.feedbackForm.rating;
      payload.feedback_text = this.feedbackForm.feedback_text;
    }

    this.submittingFeedback = true;
    const requestObservable = this.type === 'service'
      ? this.customerService.submitServiceFeedback(this.id, payload)
      : this.customerService.submitSparePartFeedback(this.id, payload);

    requestObservable.subscribe({
      next: (res: any) => {
        this.submittingFeedback = false;
        alert('Feedback submitted successfully!');
        this.closeFeedbackModal();
        if (this.requestDetail && this.requestDetail.quotations) {
          const q = this.requestDetail.quotations.find((qt: any) => qt.id === this.feedbackQuoteId);
          if (q) q.feedback_given = true;
        }
      },
      error: (err: any) => {
        this.submittingFeedback = false;
        alert(err.error?.message || 'Failed to submit feedback.');
      }
    });
  }
}
