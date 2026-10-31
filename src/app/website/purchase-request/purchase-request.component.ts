import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { EcomService, CreatePurchaseRequestPayload } from 'src/app/core/services/ecom.service';
import { RazorpayService, RazorpaySuccessResponse, RazorpayPaymentOptions } from 'src/app/core/services/razorpay.service';

export interface Quotation {
  id: string | number;
  rawId?: number | string;
  reference?: string;
  sellerName: string;
  sellerType: string;
  rating: number;
  verified: boolean;
  unitPrice: number;
  quantity: number;
  productAmount: number;
  gstPercent: number;
  gstAmount: number;
  productTotal: number;
  deliveryFee: number;
  platformFee: number;
  finalAmount: number;
  validity: string;
  validUntil: string;
  notes: string;
  status?: string;
  isAccepted?: boolean;
  acceptedAt?: string;
}

export interface PurchaseRequest {
  id: number | string;
  reference: string;
  product: string;
  category: string;
  quantity: number;
  requestDate: string;
  status: string;
  rawStatus: string;
  statusMessage: string;
  note?: string;
  currentStep: number;
  quotations: Quotation[];
  quotationsCount: number;
  deliveryAddress?: any;
  paymentStatus?: string;
  commercialSnapshot?: any;
  order?: any;
  acceptedQuotationId?: number | string | null;
}

@Component({
  selector: 'app-purchase-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './purchase-request.component.html',
  styleUrl: './purchase-request.component.scss'
})
export class PurchaseRequestComponent implements OnInit {
  // Filter tabs: 'ALL' | 'QUOTE_RECEIVED' | 'AWAITING_QUOTATION' | 'ORDER_CONFIRMED'
  activeFilter: string = 'ALL';
  searchQuery: string = '';

  // Main list - initialized purely dynamic (no static mock items)
  purchaseRequests: PurchaseRequest[] = [];

  // Stepper timeline definition
  steps = [
    { id: 1, label: 'Request Submitted' },
    { id: 2, label: 'Awaiting Quotation' },
    { id: 3, label: 'Quotation Received' },
    { id: 4, label: 'Awaiting Acceptance' },
    { id: 5, label: 'Awaiting Payment' },
    { id: 6, label: 'Order Confirmed' }
  ];

  // View Mode: 'list' (default grid of requests) or 'detail' (full detail view of selected request)
  currentView: 'list' | 'detail' = 'list';

  // Selected state for detail view
  selectedRequest: PurchaseRequest | null = null;

  // Modals state
  isQuotationModalOpen: boolean = false;
  selectedQuotation: Quotation | null = null;

  isFinalConfirmationOpen: boolean = false;
  finalQuantity: number = 1;
  customerDeclarationAccepted: boolean = false;
  isAcceptingQuote: boolean = false;
  isCheckingOut: boolean = false;
  isVerifyingPayment: boolean = false;

  // Cancel Request state
  isCancelModalOpen: boolean = false;
  isCancelling: boolean = false;
  cancelReason: string = '';

  isCreateModalOpen: boolean = false;
  isSubmitting: boolean = false;
  isLoadingRequests: boolean = false;

  vehicleCategories: any[] = [];

  newRequest: {
    product: string;
    quantity: number;
    vehicle_category_id: number | null;
  } = {
    product: '',
    quantity: 1,
    vehicle_category_id: null
  };

  createFormSubmitted: boolean = false;
  productTouched: boolean = false;
  quantityTouched: boolean = false;
  categoryTouched: boolean = false;

  constructor(
    private ecomService: EcomService,
    private razorpayService: RazorpayService
  ) {}

  getProductError(): string {
    if (!this.createFormSubmitted && !this.productTouched) {
      return '';
    }
    if (!this.newRequest.product || !this.newRequest.product.trim()) {
      return 'Please enter a product name.';
    }
    if (this.newRequest.product.trim().length < 2) {
      return 'Product name must be at least 2 characters.';
    }
    return '';
  }

  getQuantityError(): string {
    if (!this.createFormSubmitted && !this.quantityTouched) {
      return '';
    }
    if (this.newRequest.quantity === null || this.newRequest.quantity === undefined || (this.newRequest.quantity as any) === '') {
      return 'Please enter a valid quantity.';
    }
    if (this.newRequest.quantity < 1) {
      return 'Quantity must be at least 1.';
    }
    if (this.newRequest.quantity > 100) {
      return 'Quantity cannot exceed 100.';
    }
    return '';
  }

  getCategoryError(): string {
    if (!this.createFormSubmitted && !this.categoryTouched) {
      return '';
    }
    if (!this.newRequest.vehicle_category_id) {
      return 'Please select a vehicle category.';
    }
    return '';
  }

  // Toast / notification
  toastMessage: string = '';
  showToast: boolean = false;

  // Order Confirmed modal state
  isOrderSuccessModalOpen: boolean = false;
  confirmedOrderData: any = null;

  // Pagination state from API
  pagination = {
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1
  };

  ngOnInit(): void {
    this.currentView = 'list';
    this.selectedRequest = null;
    this.loadVehicleCategories();
    this.loadPurchaseRequests();
  }

  loadVehicleCategories(): void {
    this.ecomService.getVehicleCategories().subscribe({
      next: (res: any) => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          this.vehicleCategories = res.data;
          if (!this.newRequest.vehicle_category_id) {
            this.newRequest.vehicle_category_id = this.vehicleCategories[0]?.id || 1;
          }
        }
      },
      error: () => {
        // Fallback categories already initialized
      }
    });
  }

  loadPurchaseRequests(page: number = 1): void {
    this.isLoadingRequests = true;
    this.pagination.currentPage = page;
    this.ecomService.getPurchaseRequests({ page: page, per_page: this.pagination.perPage }).subscribe({
      next: (res: any) => {
        this.isLoadingRequests = false;
        if (res?.data?.pagination) {
          this.pagination = {
            currentPage: Number(res.data.pagination.current_page || page),
            perPage: Number(res.data.pagination.per_page || 20),
            total: Number(res.data.pagination.total || 0),
            lastPage: Number(res.data.pagination.last_page || 1)
          };
        }
        const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : (res?.data?.data || []));
        if (Array.isArray(items)) {
          this.purchaseRequests = items.map((item: any) => this.mapApiRequest(item));
          if (this.currentView === 'detail' && this.selectedRequest) {
            const fresh = this.purchaseRequests.find(r => r.id === this.selectedRequest?.id);
            if (fresh) {
              this.selectedRequest = fresh;
            }
          }
        } else {
          this.purchaseRequests = [];
        }
      },
      error: (err) => {
        this.isLoadingRequests = false;
        console.error('Failed to load purchase requests:', err);
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.pagination.lastPage && page !== this.pagination.currentPage) {
      this.loadPurchaseRequests(page);
    }
  }

  get pagesArray(): number[] {
    const pages: number[] = [];
    const total = this.pagination.lastPage || 1;
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }

  private mapStatus(rawStatus: string, item?: any): { statusLabel: string; currentStep: number; statusMessage: string } {
    const s = (rawStatus || '').toLowerCase().trim();
    const payStatus = ((item?.payment_status) || '').toLowerCase().trim();
    const hasOrder = !!item?.order;

    if (s === 'cancelled' || s === 'rejected') {
      return {
        statusLabel: 'Cancelled',
        currentStep: 1,
        statusMessage: 'This purchase request has been cancelled.'
      };
    }

    // Step 6: Ordered / Confirmed / Payment Successful
    if (
      s === 'ordered' ||
      s === 'order_confirmed' ||
      s === 'confirmed' ||
      s === 'completed' ||
      s === 'paid' ||
      payStatus === 'successful' ||
      payStatus === 'paid' ||
      hasOrder
    ) {
      return {
        statusLabel: 'Order Confirmed',
        currentStep: 6,
        statusMessage: 'Order confirmed and payment processed successfully.'
      };
    }

    // Step 5: Awaiting Payment / Commercial Terms Accepted
    if (
      s === 'accepted' ||
      s === 'awaiting_payment' ||
      s === 'payment_pending' ||
      s === 'awaiting_acceptance' ||
      !!item?.accepted_quotation_id
    ) {
      return {
        statusLabel: 'Awaiting Payment',
        currentStep: 5,
        statusMessage: 'Commercial terms accepted. Ready for payment.'
      };
    }

    // Step 3: Quotation Received
    const quotesCount = Array.isArray(item?.quotations) ? item.quotations.length : Number(item?.quotations_count || 0);
    if (s === 'quoted' || s === 'quote_received' || s === 'quotes_received' || quotesCount > 0) {
      return {
        statusLabel: 'Quote Received',
        currentStep: 3,
        statusMessage: 'Seller quotation received. Review the quotation.'
      };
    }

    // Step 2: Awaiting Quotation
    return {
      statusLabel: 'Awaiting Quotation',
      currentStep: 2,
      statusMessage: 'Waiting for seller quotation.'
    };
  }

  private mapApiRequest(item: any): PurchaseRequest {
    const mapped = this.mapStatus(item.status, item);
    let dateStr = 'Recent';
    if (item.created_at) {
      try {
        dateStr = new Date(item.created_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch (_) {
        dateStr = item.created_at;
      }
    }

    const quotationsList: Quotation[] = Array.isArray(item.quotations)
      ? item.quotations.map((q: any) => {
          const uPrice = Number(q.unit_price || q.price || 0);
          const qty = Number(q.quantity || q.quoted_quantity || item.quantity || 1);
          const prodAmt = Number(q.product_amount !== undefined ? q.product_amount : uPrice * qty);
          const gstPct = Number(q.gst_percent || 0);
          const gstAmt = Number(q.gst_amount !== undefined ? q.gst_amount : ((prodAmt * gstPct) / 100));
          const prodTotal = Number(q.product_total !== undefined ? q.product_total : prodAmt + gstAmt);
          const delFee = Number(q.delivery_fee !== undefined ? q.delivery_fee : 0);
          const platFee = Number(q.platform_fee !== undefined ? q.platform_fee : 0);
          const finalAmt = Number(q.final_amount !== undefined ? q.final_amount : prodTotal + delFee + platFee);

          const isAcceptedQuote = (q.status !== 'closed' && q.status !== 'rejected') && (
            (item.accepted_quotation_id && (Number(item.accepted_quotation_id) === Number(q.id))) ||
            (item.commercial_snapshot?.quotation_id && (Number(item.commercial_snapshot.quotation_id) === Number(q.id))) ||
            q.status === 'accepted' || (q.accepted_at != null)
          );

          return {
            id: q.reference || q.quotation_code || (q.id ? `GQT-${q.id}` : 'QUO'),
            rawId: q.id,
            reference: q.reference || q.quotation_code || (q.id ? `GQT-${q.id}` : 'QUO'),
            sellerName: q.seller?.business_name || q.seller?.name || q.seller_name || 'Authorized Seller',
            sellerType: q.seller?.seller_type || q.seller_type || 'Automotive Parts Seller',
            rating: Number(q.rating || q.seller?.rating || 4.8),
            verified: q.verified !== undefined ? q.verified : (q.seller?.is_verified ?? true),
            unitPrice: uPrice,
            quantity: qty,
            productAmount: prodAmt,
            gstPercent: gstPct,
            gstAmount: gstAmt,
            productTotal: prodTotal,
            deliveryFee: delFee,
            platformFee: platFee,
            finalAmount: finalAmt,
            validity: q.validity || '24 Hours',
            validUntil: q.valid_until ? new Date(q.valid_until).toLocaleString() : (q.valid_until_at ? new Date(q.valid_until_at).toLocaleString() : '24 Hours'),
            notes: q.notes || q.description || '',
            status: q.status || '',
            isAccepted: isAcceptedQuote,
            acceptedAt: q.accepted_at || null
          };
        })
      : [];

    return {
      id: item.id,
      reference: item.reference || (item.request_code ? item.request_code : `REQ-${item.id}`),
      product: item.product_name || item.product || 'Spare Part',
      category: item.vehicle_category?.name || item.category || 'Vehicle Spare Part',
      quantity: Number(item.quantity || 1),
      requestDate: dateStr,
      status: mapped.statusLabel,
      rawStatus: item.status || 'requested',
      statusMessage: mapped.statusMessage,
      note: item.description || item.note || '',
      currentStep: mapped.currentStep,
      quotations: quotationsList,
      quotationsCount: item.quotations_count !== undefined ? Number(item.quotations_count) : quotationsList.length,
      deliveryAddress: item.delivery_address || null,
      paymentStatus: item.payment_status || 'not_started',
      commercialSnapshot: item.commercial_snapshot || null,
      order: item.order || null,
      acceptedQuotationId: item.accepted_quotation_id || null
    };
  }

  // Filtered requests getter
  get filteredRequests(): PurchaseRequest[] {
    return this.purchaseRequests.filter(req => {
      const raw = (req.rawStatus || '').toLowerCase();
      const statusLabel = req.status;

      let matchesFilter = true;
      if (this.activeFilter === 'QUOTE_RECEIVED') {
        matchesFilter = statusLabel === 'Quote Received' || raw === 'quoted' || raw === 'quote_received';
      } else if (this.activeFilter === 'AWAITING_QUOTATION') {
        matchesFilter = statusLabel === 'Awaiting Quotation' || raw === 'requested' || raw === 'awaiting_quotation' || raw === 'pending';
      } else if (this.activeFilter === 'CONFIRMED') {
        matchesFilter = statusLabel === 'Order Confirmed' || raw === 'order_confirmed' || raw === 'confirmed' || raw === 'completed';
      }

      const query = this.searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        String(req.id).toLowerCase().includes(query) ||
        (req.reference && req.reference.toLowerCase().includes(query)) ||
        req.product.toLowerCase().includes(query) ||
        req.category.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }

  // Count getters
  get totalCount(): number {
    return this.purchaseRequests.length;
  }

  get quoteReceivedCount(): number {
    return this.purchaseRequests.filter(r => 
      r.status === 'Quote Received' || (r.rawStatus || '').toLowerCase() === 'quoted' || (r.rawStatus || '').toLowerCase() === 'quote_received'
    ).length;
  }

  get awaitingQuotationCount(): number {
    return this.purchaseRequests.filter(r => 
      r.status === 'Awaiting Quotation' || (r.rawStatus || '').toLowerCase() === 'requested' || (r.rawStatus || '').toLowerCase() === 'pending'
    ).length;
  }

  get confirmedCount(): number {
    return this.purchaseRequests.filter(r => 
      r.status === 'Order Confirmed' || (r.rawStatus || '').toLowerCase() === 'confirmed' || (r.rawStatus || '').toLowerCase() === 'order_confirmed'
    ).length;
  }

  // Select request to open detailed view
  selectRequest(req: PurchaseRequest): void {
    this.selectedRequest = req;
    this.currentView = 'detail';
    if (req.id) {
      this.ecomService.getPurchaseRequestDetails(req.id).subscribe({
        next: (res: any) => {
          const detail = res?.data || res;
          if (detail) {
            const mapped = this.mapApiRequest(detail);
            const idx = this.purchaseRequests.findIndex(r => r.id === req.id);
            if (idx !== -1) {
              this.purchaseRequests[idx] = mapped;
            }
            if (this.selectedRequest?.id === req.id) {
              this.selectedRequest = mapped;
            }
          }
        },
        error: () => {}
      });
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Back to full listing cards view
  backToList(): void {
    this.currentView = 'list';
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Open Quotation Details Modal
  openQuotationDetails(quote: Quotation): void {
    this.selectedQuotation = quote;
    this.isQuotationModalOpen = true;
  }

  closeQuotationModal(): void {
    this.isQuotationModalOpen = false;
  }

  // Open Final Confirmation
  openFinalConfirmation(quote: Quotation): void {
    this.selectedQuotation = quote;
    this.finalQuantity = quote.quantity || 1;
    this.customerDeclarationAccepted = false;
    this.isQuotationModalOpen = false;
    this.isFinalConfirmationOpen = true;
  }

  closeFinalConfirmation(): void {
    this.isFinalConfirmationOpen = false;
  }

  // Quantity modification
  increaseQuantity(): void {
    this.finalQuantity++;
  }

  decreaseQuantity(): void {
    if (this.finalQuantity > 1) {
      this.finalQuantity--;
    }
  }

  // Dynamic calculations for final confirmation based on real quotation
  get productAmount(): number {
    if (!this.selectedQuotation) return 0;
    return this.selectedQuotation.productAmount !== undefined
      ? this.selectedQuotation.productAmount
      : (this.selectedQuotation.unitPrice * this.finalQuantity);
  }

  get gstTax(): number {
    if (!this.selectedQuotation) return 0;
    return this.selectedQuotation.gstAmount !== undefined
      ? this.selectedQuotation.gstAmount
      : Math.round(((this.productAmount * (this.selectedQuotation.gstPercent || 18)) / 100) * 100) / 100;
  }

  get deliveryFee(): number {
    return this.selectedQuotation?.deliveryFee !== undefined ? this.selectedQuotation.deliveryFee : 0;
  }

  get platformFee(): number {
    return this.selectedQuotation?.platformFee !== undefined ? this.selectedQuotation.platformFee : 0;
  }

  get finalPayableAmount(): number {
    if (this.selectedQuotation?.finalAmount) {
      return this.selectedQuotation.finalAmount;
    }
    return this.productAmount + this.gstTax + this.deliveryFee + this.platformFee;
  }

  // Proceed to Payment / Accept Quotation
  continueToPayment(): void {
    if (!this.customerDeclarationAccepted) {
      this.displayToast('Please confirm the customer declaration first.');
      return;
    }

    if (!this.selectedRequest || !this.selectedQuotation) {
      return;
    }

    const requestId = this.selectedRequest.id;
    const quotationId = this.selectedQuotation.rawId || this.selectedQuotation.id;

    this.isAcceptingQuote = true;
    this.ecomService.acceptQuotation(requestId, quotationId).subscribe({
      next: (res: any) => {
        this.isAcceptingQuote = false;
        this.isFinalConfirmationOpen = false;

        this.selectedRequest!.status = 'Awaiting Payment';
        this.selectedRequest!.rawStatus = 'accepted';
        this.selectedRequest!.currentStep = 5;
        this.selectedRequest!.statusMessage = 'Commercial terms accepted. Ready for payment.';
        this.selectedRequest!.acceptedQuotationId = quotationId;
        if (this.selectedQuotation) {
          this.selectedQuotation.isAccepted = true;
        }

        this.displayToast(res?.message || 'Quotation accepted! Proceeding to checkout...');
        
        // Immediately trigger checkout and payment gateway
        this.proceedToCheckout(this.selectedRequest);
      },
      error: (err: any) => {
        this.isAcceptingQuote = false;
        const msg = err?.message || err?.error?.message || (typeof err === 'string' ? err : 'Failed to accept quotation.');
        this.displayToast(msg);
      }
    });
  }

  // Check if purchase request is ready for payment checkout
  canCheckout(req: PurchaseRequest | null): boolean {
    if (!req) return false;
    const raw = (req.rawStatus || '').toLowerCase();
    const payStatus = ((req.paymentStatus) || '').toLowerCase();

    if (
      raw === 'ordered' ||
      raw === 'order_confirmed' ||
      raw === 'confirmed' ||
      raw === 'paid' ||
      raw === 'completed' ||
      payStatus === 'successful' ||
      payStatus === 'paid' ||
      req.status === 'Order Confirmed' ||
      req.currentStep === 6 ||
      !!req.order
    ) {
      return false;
    }
    if (raw === 'cancelled' || raw === 'rejected' || req.status === 'Cancelled') {
      return false;
    }

    return raw === 'accepted' || req.status === 'Awaiting Payment' || req.currentStep === 5;
  }

  // Check if request already has commercial terms accepted
  isRequestAccepted(req: PurchaseRequest | null): boolean {
    if (!req) return false;
    const raw = (req.rawStatus || '').toLowerCase();
    const status = (req.status || '').toLowerCase();
    const payStatus = ((req.paymentStatus) || '').toLowerCase();
    return (
      raw === 'ordered' ||
      raw === 'accepted' ||
      raw === 'awaiting_payment' ||
      raw === 'order_confirmed' ||
      raw === 'confirmed' ||
      raw === 'paid' ||
      raw === 'completed' ||
      payStatus === 'successful' ||
      payStatus === 'paid' ||
      status === 'awaiting payment' ||
      status === 'order confirmed' ||
      req.currentStep >= 5 ||
      !!req.acceptedQuotationId ||
      !!req.order
    );
  }

  // Check if a specific quotation is accepted
  isQuoteAccepted(quote: Quotation | null, req: PurchaseRequest | null): boolean {
    if (!quote || !req) return false;

    // Never consider closed or rejected quotes as accepted
    if (quote.status === 'closed' || quote.status === 'rejected') {
      return false;
    }

    // 1. Direct status or timestamp on the quote
    if (quote.status === 'accepted' || quote.isAccepted || !!quote.acceptedAt) {
      return true;
    }

    const quoteRawId = Number(quote.rawId || 0);

    // 2. Request accepted_quotation_id
    if (req.acceptedQuotationId) {
      const acceptedId = Number(req.acceptedQuotationId);
      if (acceptedId > 0 && quoteRawId > 0 && acceptedId === quoteRawId) {
        return true;
      }
      if (req.acceptedQuotationId === quote.id || req.acceptedQuotationId === quote.reference) {
        return true;
      }
      return false;
    }

    // 3. Commercial snapshot quotation_id
    if (req.commercialSnapshot?.quotation_id || req.commercialSnapshot?.quotation_reference) {
      const snapQuoteId = Number(req.commercialSnapshot.quotation_id || 0);
      if (snapQuoteId > 0 && quoteRawId > 0 && snapQuoteId === quoteRawId) {
        return true;
      }
      if (req.commercialSnapshot.quotation_reference && (req.commercialSnapshot.quotation_reference === quote.reference || req.commercialSnapshot.quotation_reference === quote.id)) {
        return true;
      }
      return false;
    }

    // 4. Fallback ONLY if there is only 1 quote and request is confirmed
    if (req.quotations && req.quotations.length === 1) {
      const raw = (req.rawStatus || '').toLowerCase();
      const status = (req.status || '').toLowerCase();
      if (raw === 'accepted' || raw === 'ordered' || raw === 'confirmed' || raw === 'order_confirmed' || status === 'order confirmed') {
        return true;
      }
    }

    return false;
  }

  // Checkout API + Razorpay Payment Gateway integration
  proceedToCheckout(request?: PurchaseRequest | null): void {
    const targetReq = request || this.selectedRequest;
    if (!targetReq) {
      this.displayToast('Please select a purchase request first.');
      return;
    }

    const requestId = targetReq.id;
    this.isCheckingOut = true;

    this.ecomService.checkout(requestId).subscribe({
      next: (res: any) => {
        this.isCheckingOut = false;

        const data = res?.data || {};
        const rzpData = data.razorpay || data;
        const orderId = data.razorpay_order_id || rzpData.razorpay_order_id || rzpData.order_id || rzpData.id;
        const rzpKey = data.key_id || rzpData.key_id || rzpData.key || data.key || data.razorpay_key;
        const paymentId = data.payment_id || rzpData.payment_id;
        const amount = data.amount_paise !== undefined ? data.amount_paise : (rzpData.amount !== undefined ? rzpData.amount : undefined);
        const currency = data.currency || rzpData.currency || 'INR';

        const prefill = data.prefill || {
          name: targetReq.deliveryAddress?.name || '',
          contact: targetReq.deliveryAddress?.phone || '',
          email: ''
        };

        if (!rzpKey) {
          this.displayToast('Razorpay configuration missing in server response.');
          return;
        }

        const paymentOptions: RazorpayPaymentOptions = {
          key: rzpKey,
          order_id: orderId,
          amount: amount !== undefined && !isNaN(Number(amount)) ? Number(amount) : undefined,
          currency: currency,
          name: 'Garage Mandi',
          description: `Payment for ${targetReq.product}`,
          recurring: 0,
          prefill: {
            name: prefill.name || targetReq.deliveryAddress?.name || '',
            contact: prefill.contact || targetReq.deliveryAddress?.phone || '',
            email: prefill.email || ''
          },
          theme: {
            color: '#db3333'
          }
        };

        this.razorpayService.pay(paymentOptions)
          .then((rzpSuccess: RazorpaySuccessResponse) => {
            this.verifyPayment(rzpSuccess, orderId, targetReq, paymentId);
          })
          .catch((rzpErr: any) => {
            if (rzpErr && rzpErr.dismissed) {
              this.displayToast('Payment was cancelled.');
            } else {
              const msg = rzpErr?.message || rzpErr?.description || 'Payment failed or cancelled.';
              this.displayToast(msg);
            }
          });
      },
      error: (err: any) => {
        this.isCheckingOut = false;
        const msg = err?.message || err?.error?.message || (typeof err === 'string' ? err : 'Checkout failed.');
        this.displayToast(msg);
      }
    });
  }

  // Verify payment API after Razorpay completion
  verifyPayment(rzpSuccess: RazorpaySuccessResponse, fallbackOrderId: string, targetReq: PurchaseRequest, paymentId?: number | string): void {
    this.isVerifyingPayment = true;

    const verifyPayload: any = {
      razorpay_order_id: rzpSuccess.razorpay_order_id || fallbackOrderId,
      razorpay_payment_id: rzpSuccess.razorpay_payment_id,
      razorpay_signature: rzpSuccess.razorpay_signature
    };
    if (paymentId) {
      verifyPayload.payment_id = paymentId;
    }

    this.ecomService.verifyPayment(verifyPayload).subscribe({
      next: (verifyRes: any) => {
        this.isVerifyingPayment = false;

        targetReq.status = 'Order Confirmed';
        targetReq.rawStatus = 'order_confirmed';
        targetReq.paymentStatus = 'paid';
        targetReq.currentStep = 6;
        targetReq.statusMessage = 'Order confirmed and payment verified successfully.';

        const quote = this.selectedQuotation || (targetReq.quotations && targetReq.quotations.length > 0 ? targetReq.quotations[0] : null);
        const totalAmount = this.finalPayableAmount || quote?.finalAmount || targetReq.commercialSnapshot?.final_amount || 0;
        const sellerName = quote?.sellerName || 'Authorized Seller';

        this.confirmedOrderData = {
          requestId: targetReq.reference || targetReq.id,
          sellerName: sellerName,
          product: targetReq.product,
          quantity: targetReq.quantity,
          totalAmount: totalAmount,
          orderDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };

        this.isOrderSuccessModalOpen = true;
        this.displayToast(verifyRes?.message || 'Payment verified! Order confirmed.');
        this.loadPurchaseRequests();
      },
      error: (verifyErr: any) => {
        this.isVerifyingPayment = false;
        const msg = verifyErr?.message || verifyErr?.error?.message || 'Payment verification failed. Payment ID: ' + rzpSuccess.razorpay_payment_id;
        this.displayToast(msg);
      }
    });
  }

  // Cancel Request handling: After payment / order placement, cancellation is strictly disabled
  canCancelRequest(req: PurchaseRequest | null): boolean {
    if (!req) return false;
    const raw = (req.rawStatus || '').toLowerCase();
    const payStatus = ((req.paymentStatus) || '').toLowerCase();
    const status = (req.status || '').toLowerCase();

    // Strictly disable cancellation after payment or once order is placed
    if (
      payStatus === 'successful' ||
      payStatus === 'paid' ||
      raw === 'ordered' ||
      raw === 'order_confirmed' ||
      raw === 'confirmed' ||
      raw === 'completed' ||
      raw === 'paid' ||
      status === 'order confirmed' ||
      req.currentStep === 6 ||
      !!req.order
    ) {
      return false;
    }

    if (raw === 'cancelled' || raw === 'rejected' || status === 'cancelled') {
      return false;
    }

    return true;
  }

  openCancelModal(): void {
    if (!this.canCancelRequest(this.selectedRequest)) {
      this.displayToast('Cannot cancel this request as payment has already been completed.');
      return;
    }
    this.cancelReason = '';
    this.isCancelModalOpen = true;
  }

  closeCancelModal(): void {
    this.isCancelModalOpen = false;
    this.cancelReason = '';
  }

  confirmCancelRequest(): void {
    if (!this.selectedRequest || !this.canCancelRequest(this.selectedRequest)) {
      this.displayToast('Cannot cancel this request as payment has already been completed.');
      this.closeCancelModal();
      return;
    }
    this.isCancelling = true;
    const requestId = this.selectedRequest.id;

    this.ecomService.cancelPurchaseRequest(requestId, this.cancelReason).subscribe({
      next: (res: any) => {
        this.isCancelling = false;
        this.isCancelModalOpen = false;
        this.displayToast(res?.message || 'Purchase request cancelled successfully.');
        this.loadPurchaseRequests();
      },
      error: (err: any) => {
        this.isCancelling = false;
        const msg = err?.message || err?.error?.message || (typeof err === 'string' ? err : 'Failed to cancel purchase request.');
        this.displayToast(msg);
      }
    });
  }

  closeOrderSuccessModal(): void {
    this.isOrderSuccessModalOpen = false;
  }

  // Create Request Modal
  openCreateModal(): void {
    this.newRequest = {
      product: '',
      quantity: 1,
      vehicle_category_id: this.vehicleCategories[0]?.id || 1
    };
    this.createFormSubmitted = false;
    this.productTouched = false;
    this.quantityTouched = false;
    this.categoryTouched = false;
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.createFormSubmitted = false;
    this.productTouched = false;
    this.quantityTouched = false;
    this.categoryTouched = false;
    this.isCreateModalOpen = false;
  }

  submitCreateRequest(): void {
    this.createFormSubmitted = true;
    this.productTouched = true;
    this.quantityTouched = true;
    this.categoryTouched = true;

    const productErr = this.getProductError();
    const qtyErr = this.getQuantityError();
    const catErr = this.getCategoryError();

    if (productErr || qtyErr || catErr) {
      this.displayToast(productErr || qtyErr || catErr);
      return;
    }

    this.isSubmitting = true;
    const payload: CreatePurchaseRequestPayload = {
      product_name: this.newRequest.product.trim(),
      quantity: Number(this.newRequest.quantity),
      vehicle_category_id: Number(this.newRequest.vehicle_category_id || 1)
    };

    this.ecomService.createPurchaseRequest(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.isCreateModalOpen = false;
        this.displayToast(res?.message || 'Purchase request created successfully!');
        this.loadPurchaseRequests();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        const msg = err?.message || err?.error?.message || (typeof err === 'string' ? err : 'Failed to submit purchase request. Please try again.');
        this.displayToast(msg);
      }
    });
  }

  // Toast helper
  displayToast(msg: string): void {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }
}
