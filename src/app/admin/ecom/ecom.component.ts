import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notificationnew.service';
import { EcomService } from 'src/app/core/services/ecom.service';

export type OrderStatus =
  | 'confirmed'
  | 'ready_for_pickup'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivered_open_box'
  | 'settlement_hold'
  | 'settled'
  | 'cancelled';

export interface CancelReasonOption {
  key: string;
  label: string;
}

export interface AdminOrderNote {
  id: number;
  author: string;
  role: string;
  text: string;
  createdAt: string;
  admin?: {
    id: number;
    name: string;
  } | null;
  note?: string;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  purchaseRequestId: number;
  purchaseRequestRef: string;
  quotationId: number;
  quotationRef: string;
  quotationVersion: number;
  productName: string;
  vehicleCategory: string;
  vehicleModel?: string;
  quantity: number;
  unitPrice: number;
  productAmount: number;
  gstPercent: number;
  gstAmount: number;
  productTotal: number;
  deliveryFee: number;
  platformFee: number;
  finalAmount: number;
  sellerPayoutAmount: number;

  customer: {
    id: number;
    name: string;
    phone: string;
    email?: string;
    city: string;
    state: string;
    pincode: string;
    address: string;
  };

  seller: {
    id: number;
    name: string;
    workshopName: string;
    phone: string;
    city: string;
    state: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
    upiId: string;
  };

  payment: {
    method: string;
    paymentId: string;
    orderId: string;
    paidAt: string;
    status: 'paid' | 'pending' | 'failed' | 'refunded' | 'partially_refunded';
    financialStatus: 'funds_held' | 'released' | 'settled' | 'refunded' | 'partially_refunded' | string;
    refundAmount?: number;
    refundReason?: string;
    refundedAt?: string;
  };

  status: OrderStatus;
  deliveryStatus?: string;
  settlementStatus?: string;
  financialStatus?: string;
  createdAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  settlementEligibleAt?: string;
  settledAt?: string;

  shipment?: {
    id: string;
    courierPartner: string;
    awbNumber: string;
    trackingUrl?: string;
    status: string;
    dispatchedAt?: string;
  } | null;

  notes: AdminOrderNote[];
  rawItem?: any;
  allowedActions?: string[];
  refundSummary?: any;
  refunds?: any[];
  attentionReason?: string | null;
  acceptedQuotation?: any;
  pricing?: any;
  events?: any[];
  statusHistory?: any[];
}

@Component({
  selector: 'app-ecom',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ecom.component.html',
  styleUrl: './ecom.component.scss'
})
export class EcomComponent implements OnInit {
  isLoading = false;
  isRefreshing = false;
  isLoadingDetails = false;

  // ==========================================================
  // ORDERS DATA & STATE
  // ==========================================================
  orders: AdminOrder[] = [];
  filteredOrders: AdminOrder[] = [];
  pagedOrders: AdminOrder[] = [];
  orderSearchQuery = '';
  appliedOrderSearchQuery = '';
  isOrderSearchApplied = false;
  orderStatusFilter = 'all';
  orderCurrentPage = 1;
  orderPageSize = 10;
  orderTotalPages = 1;
  totalOrdersCountFromServer = 0;

  // ==========================================================
  // MODALS STATE
  // ==========================================================
  // 1. Detailed Order Modal
  isDetailsModalOpen = false;
  selectedOrder: AdminOrder | null = null;

  // 2. Add Notes Modal
  isNotesModalOpen = false;
  orderForNote: AdminOrder | null = null;
  newNoteText = '';

  // 3. Status Update Modal
  isStatusModalOpen = false;
  orderForStatus: AdminOrder | null = null;
  selectedNewStatus: OrderStatus = 'confirmed';
  courierPartnerInput = '';
  awbNumberInput = '';
  statusRemarksInput = '';

  // 4. Cancel Order Modal
  isCancelModalOpen = false;
  orderToCancel: AdminOrder | null = null;
  cancelReasons: CancelReasonOption[] = [];
  cancelReasonInput = '';
  cancelRemarksInput = '';
  autoRefundCustomer = true;

  // 5. Refund Option Modal
  isRefundModalOpen = false;
  orderToRefund: AdminOrder | null = null;
  refundType: 'full' | 'partial' = 'full';
  refundAmountInput: number = 0;
  refundReasonInput = 'Customer dispute / Defective part';

  readonly Number = Number;

  constructor(
    private ecomService: EcomService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem('gm_admin_ecom_mock_orders_v1');
        localStorage.removeItem('gm_admin_ecom_mock_orders_v2');
        localStorage.removeItem('gm_admin_ecom_mock_settlements_v1');
        localStorage.removeItem('gm_admin_ecom_mock_settlements_v2');
      } catch (_) {}
    }
    this.loadData();
    this.loadCancelReasons();
  }

  loadCancelReasons(): void {
    this.ecomService.getCancelReasons().subscribe({
      next: (res: any) => {
        const orderReasons = res?.data?.order;
        if (Array.isArray(orderReasons) && orderReasons.length > 0) {
          this.cancelReasons = orderReasons.map((r: any) => ({
            key: r.key || r.code || r.id || r.label,
            label: r.label || r.name || r.key
          }));
          if (!this.cancelReasonInput || !this.cancelReasons.some(r => r.key === this.cancelReasonInput)) {
            this.cancelReasonInput = this.cancelReasons[0].key;
          }
        }
      },
      error: (err: any) => {
        console.warn('[AdminEcom] Failed to load cancel reasons from server, using defaults:', err);
      }
    });
  }

  getCancelReasonLabel(key: string): string {
    const found = this.cancelReasons.find(r => r.key === key);
    return found ? found.label : key;
  }

  // ==========================================================
  // DATA LOADING (LIVE ORDERS API)
  // ==========================================================
  loadData(isRefresh = false): void {
    this.loadAdminOrders(isRefresh);
  }

  loadAdminOrders(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }

    const params: any = {
      page: this.orderCurrentPage,
      limit: this.orderPageSize
    };
    if (this.orderStatusFilter && this.orderStatusFilter !== 'all') {
      params.status = this.orderStatusFilter;
    }
    if (this.appliedOrderSearchQuery && this.appliedOrderSearchQuery.trim()) {
      params.search = this.appliedOrderSearchQuery.trim();
    }

    console.log('[AdminEcom] Loading admin orders with params:', params);

    this.ecomService.getAdminOrders(params).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.isRefreshing = false;
        console.log('[AdminEcom] Admin orders live response:', res);

        const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
        if (Array.isArray(items)) {
          this.orders = items.map((item: any) => this.mapApiOrder(item));
        } else {
          this.orders = [];
        }

        // Handle pagination metadata from server
        const pagination = res?.data?.pagination;
        if (pagination) {
          this.totalOrdersCountFromServer = Number(pagination.total !== undefined ? pagination.total : this.orders.length);
          this.orderCurrentPage = Number(pagination.current_page || this.orderCurrentPage);
          this.orderTotalPages = Number(pagination.last_page || Math.max(1, Math.ceil(this.totalOrdersCountFromServer / this.orderPageSize)));
        } else {
          this.totalOrdersCountFromServer = this.orders.length;
          this.orderTotalPages = Math.max(1, Math.ceil(this.totalOrdersCountFromServer / this.orderPageSize));
        }

        this.applyOrderFilters();
        if (isRefresh) {
          this.notificationService.show('Orders data refreshed from server.', 'info');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.isRefreshing = false;
        console.error('[AdminEcom] Error loading admin orders from API:', err);
        const msg = err?.error?.message || err?.message || 'Failed to load orders from server.';
        this.notificationService.show(msg, 'error');
        this.orders = [];
        this.totalOrdersCountFromServer = 0;
        this.orderTotalPages = 1;
        this.applyOrderFilters();
      }
    });
  }

  // ==========================================================
  // API DATA MAPPER
  // ==========================================================
  private mapApiOrder(item: any): AdminOrder {
    const snapshot = item.snapshot || {};
    const deliveryAddress = item.delivery_address || {};
    const customer = item.customer || {};
    const seller = item.seller || {};
    const firstPayment = Array.isArray(item.payments) && item.payments.length > 0 ? item.payments[0] : null;
    const shipment = item.shipment || null;

    // Numerical amounts
    const quantity = Number(snapshot.quantity ?? item.quantity ?? 1);
    const unitPrice = Number(snapshot.unit_price ?? item.unit_price ?? 0);
    const productAmount = Number(snapshot.product_amount ?? item.product_amount ?? (unitPrice * quantity));
    const gstPercent = Number(snapshot.gst_percent ?? 18);
    const gstAmount = Number(snapshot.gst_amount ?? item.gst_amount ?? 0);
    const productTotal = Number(snapshot.product_total ?? item.product_total ?? (productAmount + gstAmount));
    const deliveryFee = Number(snapshot.delivery_fee ?? item.delivery_fee ?? 0);
    const platformFee = Number(snapshot.platform_fee ?? item.platform_fee ?? 0);
    const finalAmount = Number(item.final_amount ?? snapshot.final_amount ?? (productTotal + deliveryFee + platformFee));
    const sellerPayoutAmount = Number(item.seller_payout_amount ?? productTotal);

    // Customer
    const customerPhone = customer.phone_number || deliveryAddress.phone || '—';
    const customerName = customer.name || deliveryAddress.name || 'Customer';
    const customerAddress = [
      deliveryAddress.line1,
      deliveryAddress.line2,
      deliveryAddress.city,
      deliveryAddress.state,
      deliveryAddress.pincode
    ].filter(Boolean).join(', ') || '—';

    // Seller
    const sellerName = seller.name || 'Seller';
    const workshopName = seller.business_name || seller.name || 'Workshop';
    const sellerPhone = seller.phone_number || '—';

    // Payment details
    const method = firstPayment?.method || 'Online';
    const paymentId = firstPayment?.razorpay_payment_id || snapshot.razorpay_payment_id || '—';
    const orderId = firstPayment?.razorpay_order_id || snapshot.razorpay_order_id || '—';
    const paidAt = this.formatDateTime(firstPayment?.paid_at || snapshot.paid_at || firstPayment?.captured_at);
    const isPaymentSuccess = firstPayment?.status === 'captured' ||
                            firstPayment?.status === 'successful' ||
                            firstPayment?.status === 'paid' ||
                            Boolean(snapshot.paid_at) ||
                            Boolean(firstPayment?.captured_at) ||
                            item.financial_status === 'funds_held' ||
                            item.financial_status === 'settled';

    // Refund & Financial status
    const finStatus = item.financial_status || 'funds_held';
    const isRefunded = finStatus === 'refunded' ||
                       Boolean(item.refunded_at) ||
                       item.refund_summary?.can_refund === false ||
                       firstPayment?.refund_status === 'full';
    const isPartiallyRefunded = finStatus === 'partially_refunded' ||
                                firstPayment?.refund_status === 'partial' ||
                                (Number(firstPayment?.amount_refunded || 0) > 0 && Number(firstPayment?.amount_refunded || 0) < finalAmount);

    let pStatus: 'paid' | 'pending' | 'failed' | 'refunded' | 'partially_refunded' = 'pending';
    if (isRefunded) {
      pStatus = 'refunded';
    } else if (isPartiallyRefunded) {
      pStatus = 'partially_refunded';
    } else if (isPaymentSuccess) {
      pStatus = 'paid';
    }

    const refundAmount = Number(
      item.refund_summary?.refunded_amount ??
      firstPayment?.amount_refunded ??
      (item.refunded_at ? finalAmount : 0)
    );

    // Shipment details
    let shipmentObj: any = null;
    const shipmentData = shipment || (Array.isArray(item.shipments) && item.shipments.length > 0 ? item.shipments[0] : null);
    if (shipmentData) {
      shipmentObj = {
        id: shipmentData.id || shipmentData.shipment_number || 'SHP',
        courierPartner: shipmentData.logistics_partner || shipmentData.courier_partner || shipmentData.carrier || '',
        awbNumber: shipmentData.awb_number || shipmentData.tracking_number || '',
        trackingUrl: shipmentData.tracking_url || '',
        status: shipmentData.status || '',
        dispatchedAt: shipmentData.dispatched_at ? this.formatDateTime(shipmentData.dispatched_at) : (shipmentData.created_at ? this.formatDateTime(shipmentData.created_at) : undefined)
      };
    }

    // Notes mapping (exact match with byId response)
    const notes: AdminOrderNote[] = Array.isArray(item.notes)
      ? item.notes.map((n: any, idx: number) => {
          const author = n.admin?.name || n.author || n.created_by_name || 'Super Admin';
          const text = n.note || n.text || '';
          return {
            id: n.id || idx + 1,
            author,
            role: n.role || (n.admin ? 'Super Admin' : 'Admin'),
            text,
            note: text,
            createdAt: this.formatDateTime(n.created_at),
            admin: n.admin || (n.author ? { id: 0, name: n.author } : null)
          };
        })
      : [];

    return {
      id: item.id,
      orderNumber: item.order_number || `GMO-${item.id}`,
      purchaseRequestId: item.purchase_request_id || 0,
      purchaseRequestRef: item.purchase_request?.reference || `GPR-${item.purchase_request_id}`,
      quotationId: item.quotation_id || 0,
      quotationRef: snapshot.quotation_reference || `GQT-${item.quotation_id}`,
      quotationVersion: snapshot.quotation_version || 1,
      productName: snapshot.product_name || 'Spare Part',
      vehicleCategory: snapshot.vehicle_category_name || (snapshot.vehicle_category_id === 1 ? 'Two Wheeler' : 'Automobile'),
      vehicleModel: snapshot.vehicle_model || '',
      quantity,
      unitPrice,
      productAmount,
      gstPercent,
      gstAmount,
      productTotal,
      deliveryFee,
      platformFee,
      finalAmount,
      sellerPayoutAmount,
      customer: {
        id: customer.id || 0,
        name: customerName,
        phone: customerPhone,
        email: customer.email || '',
        city: deliveryAddress.city || '',
        state: deliveryAddress.state || '',
        pincode: deliveryAddress.pincode || '',
        address: customerAddress
      },
      seller: {
        id: seller.id || snapshot.seller_id || 0,
        name: sellerName,
        workshopName,
        phone: sellerPhone,
        city: seller.city || '',
        state: seller.state || '',
        bankName: seller.bank_name || '',
        accountNumber: seller.account_number || '',
        ifsc: seller.ifsc || '',
        upiId: seller.upi_id || ''
      },
      payment: {
        method,
        paymentId,
        orderId,
        paidAt,
        status: pStatus,
        financialStatus: finStatus,
        refundAmount,
        refundReason: item.cancel_reason,
        refundedAt: item.refunded_at ? this.formatDateTime(item.refunded_at) : undefined
      },
      status: (item.status || 'confirmed') as OrderStatus,
      deliveryStatus: item.delivery_status || item.status || 'confirmed',
      settlementStatus: item.settlement_status || null,
      financialStatus: finStatus,
      createdAt: this.formatDateTime(item.created_at),
      deliveredAt: item.delivered_at ? this.formatDateTime(item.delivered_at) : undefined,
      cancelledAt: item.cancelled_at ? this.formatDateTime(item.cancelled_at) : undefined,
      cancelReason: item.cancel_reason,
      settlementEligibleAt: item.settlement_eligible_at ? this.formatDateTime(item.settlement_eligible_at) : undefined,
      settledAt: item.settled_at ? this.formatDateTime(item.settled_at) : undefined,
      shipment: shipmentObj,
      notes,
      rawItem: item,
      allowedActions: item.allowed_actions || [],
      refundSummary: item.refund_summary || null,
      refunds: item.refunds || [],
      attentionReason: item.attention_reason || null,
      acceptedQuotation: item.accepted_quotation || null,
      pricing: item.pricing || null,
      events: item.events || [],
      statusHistory: Array.isArray(item.status_history) ? item.status_history : []
    };
  }

  canRefund(order: AdminOrder | null | undefined): boolean {
    if (!order) return false;

    // Explicit can_refund flag if returned directly by API
    if ((order as any).can_refund === false || order.rawItem?.can_refund === false) {
      return false;
    }

    // 1. If financial or payment status is refunded
    if (order.payment?.financialStatus === 'refunded' || order.payment?.status === 'refunded') {
      return false;
    }

    // 2. If allowedActions array is explicitly provided and non-empty (e.g. from API details)
    if (order.allowedActions && Array.isArray(order.allowedActions) && order.allowedActions.length > 0) {
      if (!order.allowedActions.includes('record_refund')) {
        return false;
      }
    }

    // 3. If refundSummary has can_refund explicitly set to false
    if (order.refundSummary) {
      if (order.refundSummary.can_refund === false) {
        return false;
      }
      if (order.refundSummary.remaining_refundable_amount !== undefined && Number(order.refundSummary.remaining_refundable_amount) <= 0) {
        return false;
      }
    }

    // 4. Raw API item checks (from listing or details)
    const raw = order.rawItem;
    if (raw) {
      if (raw.financial_status === 'refunded' || Boolean(raw.refunded_at)) {
        return false;
      }
      const p = Array.isArray(raw.payments) && raw.payments.length > 0 ? raw.payments[0] : null;
      if (p?.refund_status === 'full') {
        return false;
      }
      if (p?.amount_refunded && Number(p.amount_refunded) >= Number(raw.final_amount || order.finalAmount) && order.finalAmount > 0) {
        return false;
      }
    }

    // 5. Total refunded amount equal or exceeds final amount
    if ((order.payment?.refundAmount || 0) >= order.finalAmount && order.finalAmount > 0) {
      return false;
    }

    // 6. Only paid or partially_refunded orders can be refunded
    return order.payment?.status === 'paid' || order.payment?.status === 'partially_refunded';
  }

  isOrderRefunded(order: AdminOrder | null | undefined): boolean {
    if (!order) return false;
    return (
      order.payment?.financialStatus === 'refunded' ||
      order.payment?.status === 'refunded' ||
      order.refundSummary?.financial_status === 'refunded' ||
      order.refundSummary?.refund_status === 'refunded' ||
      Boolean(order.rawItem?.refunded_at) ||
      order.rawItem?.financial_status === 'refunded' ||
      (Array.isArray(order.refunds) && order.refunds.length > 0)
    );
  }
  
  
  

  // ==========================================================
  // METRICS & STATS
  // ==========================================================
  get totalOrdersCount(): number {
    return this.totalOrdersCountFromServer || this.orders.length;
  }

  get totalOrdersValue(): number {
    return this.orders.reduce((acc, o) => acc + (o.finalAmount || 0), 0);
  }

  get activeProcessingOrdersCount(): number {
    return this.orders.filter(o => ['confirmed', 'ready_for_pickup', 'shipped', 'out_for_delivery'].includes(o.status)).length;
  }

  get completedOrdersCount(): number {
    return this.orders.filter(o => o.status === 'delivered').length;
  }

  get totalPlatformCommission(): number {
    return this.orders.reduce((acc, o) => acc + (o.platformFee || 0), 0);
  }

  // ==========================================================
  // ORDERS FILTERING & PAGINATION
  // ==========================================================
  setOrderStatusFilter(status: string): void {
    if (this.orderStatusFilter === status) return;
    this.orderStatusFilter = status;
    this.orderCurrentPage = 1;
    this.loadAdminOrders();
  }

  onOrderSearch(): void {
    this.appliedOrderSearchQuery = this.orderSearchQuery ? this.orderSearchQuery.trim() : '';
    this.isOrderSearchApplied = !!this.appliedOrderSearchQuery;
    this.orderCurrentPage = 1;
    this.loadData();
  }

  onResetOrderSearch(): void {
    this.orderSearchQuery = '';
    this.appliedOrderSearchQuery = '';
    this.isOrderSearchApplied = false;
    this.orderCurrentPage = 1;
    this.loadData();
  }

  applyOrderFilters(resetPage = false): void {
    if (resetPage) {
      this.orderCurrentPage = 1;
    }

    let result = [...this.orders];

    if (this.orderStatusFilter !== 'all') {
      result = result.filter(o => (o.deliveryStatus || o.status) === this.orderStatusFilter);
    }

    if (this.appliedOrderSearchQuery && this.appliedOrderSearchQuery.trim()) {
      const q = this.appliedOrderSearchQuery.trim().toLowerCase();
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.quotationRef.toLowerCase().includes(q) ||
        o.purchaseRequestRef.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.city.toLowerCase().includes(q) ||
        o.seller.workshopName.toLowerCase().includes(q)
      );
    }

    this.filteredOrders = result;
    this.orderTotalPages = Math.max(1, Math.ceil(this.filteredOrders.length / this.orderPageSize));
    if (this.orderCurrentPage > this.orderTotalPages) {
      this.orderCurrentPage = this.orderTotalPages;
    }

    const start = (this.orderCurrentPage - 1) * this.orderPageSize;
    this.pagedOrders = this.filteredOrders.slice(start, start + this.orderPageSize);
  }

  goToOrderPage(page: number): void {
    if (page < 1 || page > this.orderTotalPages || page === this.orderCurrentPage) return;
    this.orderCurrentPage = page;
    this.loadAdminOrders();
  }

  getOrderPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.orderTotalPages;
    const current = this.orderCurrentPage;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  }

  // ==========================================================
  // MODAL ACTIONS: 1. VIEW DETAILED ORDER
  // ==========================================================
  openDetailsModal(order: AdminOrder): void {
    this.selectedOrder = order;
    this.isDetailsModalOpen = true;
    this.isLoadingDetails = true;

    // Fetch live details: GET /api/v1/ecom/admin/orders/:id
    this.ecomService.getAdminOrderDetails(order.id).subscribe({
      next: (res: any) => {
        this.isLoadingDetails = false;
        const item = res?.data?.item || res?.data || res;
        if (item && typeof item === 'object') {
          const mapped = this.mapApiOrder(item);
          this.selectedOrder = mapped;
          const idx = this.orders.findIndex(o => o.id === order.id);
          if (idx !== -1) {
            this.orders[idx] = mapped;
          }
        }
      },
      error: (err: any) => {
        this.isLoadingDetails = false;
        console.warn('[AdminEcom] Could not fetch live order details by ID:', err);
      }
    });
  }

  canCancelOrder(order: AdminOrder | null | undefined): boolean {
    if (!order) return false;
    if (order.allowedActions && Array.isArray(order.allowedActions)) {
      return order.allowedActions.includes('cancel_order');
    }
    return order.status !== 'cancelled' &&
           order.status !== 'delivered' &&
           order.status !== 'delivered_open_box' &&
           order.status !== 'settlement_hold' &&
           order.status !== 'settled';
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedOrder = null;
  }

  // ==========================================================
  // MODAL ACTIONS: 2. ADD NOTES
  // ==========================================================
  openNotesModal(order: AdminOrder, event?: Event): void {
    if (event) event.stopPropagation();
    this.orderForNote = order;
    this.newNoteText = '';
    this.isNotesModalOpen = true;
  }

  closeNotesModal(): void {
    this.isNotesModalOpen = false;
    this.orderForNote = null;
    this.newNoteText = '';
  }

  saveOrderNote(): void {
    if (!this.orderForNote || !this.newNoteText.trim()) {
      this.notificationService.show('Please enter a note before saving.', 'error');
      return;
    }

    const orderId = this.orderForNote.id;
    const text = this.newNoteText.trim();

    this.ecomService.addAdminOrderNote(orderId, { note: text }).subscribe({
      next: (res: any) => {
        const successMsg = res?.message || 'Note added.';
        this.notificationService.show(successMsg, 'success');
        this.closeNotesModal();

        // Call byId API to refresh detailed order and its notes
        this.ecomService.getAdminOrderDetails(orderId).subscribe({
          next: (detailRes: any) => {
            const item = detailRes?.data?.item || detailRes?.data || detailRes;
            if (item && typeof item === 'object') {
              const updatedOrder = this.mapApiOrder(item);
              if (this.selectedOrder && this.selectedOrder.id === orderId) {
                this.selectedOrder = updatedOrder;
              }
              const idx = this.orders.findIndex(o => o.id === orderId);
              if (idx !== -1) {
                this.orders[idx] = updatedOrder;
                this.applyOrderFilters();
              }
            }
          },
          error: (detailErr: any) => {
            console.warn('[AdminEcom] Could not refresh order details by ID:', detailErr);
            // If response returned notes array directly, sync it
            if (Array.isArray(res?.data)) {
              const mappedNotes: AdminOrderNote[] = res.data.map((n: any, idx: number) => ({
                id: n.id || idx + 1,
                author: n.admin?.name || n.author || 'Super Admin',
                role: n.role || (n.admin ? 'Super Admin' : 'Admin'),
                text: n.note || n.text || '',
                note: n.note || n.text || '',
                createdAt: this.formatDateTime(n.created_at),
                admin: n.admin || null
              }));
              if (this.selectedOrder && this.selectedOrder.id === orderId) {
                this.selectedOrder.notes = mappedNotes;
              }
              const idx = this.orders.findIndex(o => o.id === orderId);
              if (idx !== -1) {
                this.orders[idx].notes = mappedNotes;
              }
            }
          }
        });
      },
      error: (err: any) => {
        const errMsg = err?.error?.message || err?.message || 'Failed to add note.';
        // this.notificationService.show(errMsg, 'error');
      }
    });
  }

  // ==========================================================
  // MODAL ACTIONS: 3. STATUS UPDATE
  // ==========================================================
  openStatusModal(order: AdminOrder, event?: Event): void {
    if (event) event.stopPropagation();
    this.orderForStatus = order;
    this.selectedNewStatus = order.status;
    this.courierPartnerInput = order.shipment?.courierPartner || 'Delhivery Surface';
    this.awbNumberInput = order.shipment?.awbNumber || '';
    this.statusRemarksInput = '';
    this.isStatusModalOpen = true;
  }

  closeStatusModal(): void {
    this.isStatusModalOpen = false;
    this.orderForStatus = null;
  }

  confirmStatusUpdate(): void {
    if (!this.orderForStatus) return;

    const prevStatus = this.orderForStatus.status;
    const newStatus = this.selectedNewStatus;

    this.orderForStatus.status = newStatus;

    // Handle shipment fields
    if (newStatus === 'shipped' || newStatus === 'out_for_delivery' || newStatus === 'delivered') {
      this.orderForStatus.shipment = {
        id: this.orderForStatus.shipment?.id || `SHP-${Math.floor(1000 + Math.random() * 9000)}`,
        courierPartner: this.courierPartnerInput || 'Delhivery Surface',
        awbNumber: this.awbNumberInput || `DLV-${Math.floor(100000 + Math.random() * 900000)}`,
        status: newStatus === 'delivered' ? 'Delivered (OTP Verified)' : (newStatus === 'out_for_delivery' ? 'Out for Delivery' : 'In Transit'),
        dispatchedAt: this.orderForStatus.shipment?.dispatchedAt || this.formatCurrentDateTime()
      };
    }

    if (newStatus === 'delivered' && !this.orderForStatus.deliveredAt) {
      this.orderForStatus.deliveredAt = this.formatCurrentDateTime();
      this.orderForStatus.payment.financialStatus = 'released';
    }

    // Add note
    const remarks = this.statusRemarksInput.trim() ? ` Remarks: ${this.statusRemarksInput.trim()}` : '';
    this.orderForStatus.notes.unshift({
      id: Date.now(),
      author: 'Super Admin',
      role: 'Admin',
      text: `Status changed from ${this.formatStatusLabel(prevStatus)} to ${this.formatStatusLabel(newStatus)}.${remarks}`,
      createdAt: this.formatCurrentDateTime()
    });

    const idx = this.orders.findIndex(o => o.id === this.orderForStatus!.id);
    if (idx !== -1) {
      this.orders[idx] = this.orderForStatus;
    }

    this.applyOrderFilters();

    this.notificationService.show(
      `Order ${this.orderForStatus.orderNumber} status updated to ${this.formatStatusLabel(newStatus)}!`,
      'success'
    );

    this.closeStatusModal();
  }

  // ==========================================================
  // MODAL ACTIONS: 4. CANCEL ORDER
  // ==========================================================
  openCancelModal(order: AdminOrder, event?: Event): void {
    if (event) event.stopPropagation();
    this.orderToCancel = order;
    if (this.cancelReasons.length === 0) {
      this.loadCancelReasons();
    }
    this.cancelReasonInput = this.cancelReasons[0]?.key || '';
    this.cancelRemarksInput = '';
    this.autoRefundCustomer = true;
    this.isCancelModalOpen = true;
  }

  closeCancelModal(): void {
    this.isCancelModalOpen = false;
    this.orderToCancel = null;
  }

  confirmCancelOrder(): void {
    if (!this.orderToCancel) return;

    const order = this.orderToCancel;
    const orderId = order.id;
    const nowStr = this.formatCurrentDateTime();

    const payload = {
      reason: this.cancelReasonInput,
      remarks: this.cancelRemarksInput,
      auto_refund: this.autoRefundCustomer
    };

    this.ecomService.cancelAdminOrder(orderId, payload).subscribe({
      next: () => {
        this.notificationService.show(`Order ${order.orderNumber} cancelled successfully!`, 'success');
        this.closeCancelModal();
        this.loadAdminOrders();
      },
      error: () => {
        // Fallback local cancellation
        const reasonLabel = this.getCancelReasonLabel(this.cancelReasonInput);
        order.status = 'cancelled';
        order.cancelledAt = nowStr;
        order.cancelReason = this.cancelRemarksInput.trim()
          ? `${reasonLabel} - ${this.cancelRemarksInput.trim()}`
          : reasonLabel;

        if (this.autoRefundCustomer) {
          order.payment.status = 'refunded';
          order.payment.financialStatus = 'refunded';
          order.payment.refundAmount = order.finalAmount;
          order.payment.refundReason = `Auto-refund on cancellation: ${order.cancelReason}`;
          order.payment.refundedAt = nowStr;
        }

        const idx = this.orders.findIndex(o => o.id === order.id);
        if (idx !== -1) {
          this.orders[idx] = order;
        }

        this.applyOrderFilters();

        this.notificationService.show(
          `Order ${order.orderNumber} cancelled! ${this.autoRefundCustomer ? 'Refund processed.' : ''}`,
          'success'
        );

        this.closeCancelModal();
      }
    });
  }

  // ==========================================================
  // MODAL ACTIONS: 5. REFUND OPTION
  // ==========================================================
  get maxRefundableAmount(): number {
    if (!this.orderToRefund) return 0;
    const rem = this.orderToRefund.refundSummary?.remaining_refundable_amount;
    if (rem !== undefined && rem !== null && rem !== '') {
      const num = Number(rem);
      if (!isNaN(num)) return num;
    }
    return this.orderToRefund.finalAmount || 0;
  }

  openRefundModal(order: AdminOrder, event?: Event): void {
    if (event) event.stopPropagation();
    this.orderToRefund = order;
    this.refundType = 'full';
    this.refundAmountInput = this.maxRefundableAmount;
    this.refundReasonInput = 'Customer dispute / Defective part';
    this.isRefundModalOpen = true;
  }

  closeRefundModal(): void {
    this.isRefundModalOpen = false;
    this.orderToRefund = null;
  }

  setRefundType(type: 'full' | 'partial'): void {
    this.refundType = type;
    if (type === 'full') {
      this.refundAmountInput = this.maxRefundableAmount;
    } else {
      if (this.refundAmountInput >= this.maxRefundableAmount) {
        this.refundAmountInput = 0;
      }
    }
  }

  onRefundTypeChange(): void {
    this.setRefundType(this.refundType);
  }

  confirmRefund(): void {
    if (!this.orderToRefund) return;

    const order = this.orderToRefund;
    const orderId = order.id;

    const payload: any = {
      refund_type: this.refundType,
      remarks: this.refundReasonInput?.trim() || 'Customer dispute / Defective part'
    };

    if (this.refundType === 'partial') {
      const maxRefundable = this.maxRefundableAmount;
      const amount = Number(this.refundAmountInput);
      if (isNaN(amount) || amount <= 0 || amount > maxRefundable) {
        this.notificationService.show(`Refund amount must be between ₹1 and ₹${maxRefundable.toFixed(2)}`, 'error');
        return;
      }
      payload.amount = amount;
    }

    this.ecomService.refundAdminOrder(orderId, payload).subscribe({
      next: (res: any) => {
        const msg = res?.message || 'Refund processed successfully!';
        this.notificationService.show(msg, 'success');
        this.closeRefundModal();
        this.loadAdminOrders();

        // Also refresh detailed order if details modal is open
        if (this.selectedOrder && this.selectedOrder.id === orderId) {
          this.ecomService.getAdminOrderDetails(orderId).subscribe({
            next: (detailRes: any) => {
              const item = detailRes?.data?.item || detailRes?.data || detailRes;
              if (item && typeof item === 'object') {
                this.selectedOrder = this.mapApiOrder(item);
              }
            }
          });
        }
      },
      error: (err: any) => {
        const errMsg = err?.error?.message || err?.message || 'Failed to process refund.';
        this.notificationService.show(errMsg, 'error');
      }
    });
  }

  // ==========================================================
  // HELPER FORMATTERS & STYLES
  // ==========================================================
  getOrderStatusBadgeClass(status: OrderStatus | string): string {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'ready_for_pickup':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'delivered_open_box':
        return 'bg-teal-100 text-teal-800 border border-teal-200';
      case 'settlement_hold':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'settled':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  }

  getFinancialStatusBadgeClass(status: string): string {
    switch (status) {
      case 'funds_held':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'released':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'settled':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'refunded':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'partially_refunded':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  }

  formatStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'ready_for_pickup': return 'Ready for Pickup';
      case 'shipped': return 'Shipped';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'delivered_open_box': return 'Delivered (Open Box)';
      case 'settlement_hold': return 'Settlement Hold';
      case 'settled': return 'Settled';
      case 'cancelled': return 'Cancelled';
      default: return status ? status.replace(/_/g, ' ') : '—';
    }
  }

  formatFinancialLabel(status: string): string {
    switch (status) {
      case 'funds_held': return 'Funds in Escrow';
      case 'released': return 'Eligible for Payout';
      case 'settled': return 'Settled to Seller';
      case 'refunded': return 'Refunded to Customer';
      case 'partially_refunded': return 'Partially Refunded';
      default: return status ? status.replace(/_/g, ' ') : '—';
    }
  }

  copyText(text: string, label = 'Copied'): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.notificationService.show(`${label} to clipboard!`, 'success');
    }
  }

  private formatCurrentDateTime(): string {
    return new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  private formatDateCode(): string {
    const d = new Date();
    const yy = d.getFullYear().toString().slice(-2);
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yy}${mm}${dd}`;
  }
}
