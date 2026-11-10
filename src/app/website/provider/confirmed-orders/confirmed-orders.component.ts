import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NotificationService } from 'src/app/core/services/notificationnew.service';
import { EcomService } from 'src/app/core/services/ecom.service';

export type OrderStatus =
  | 'Confirmed'
  | 'Ready for Pickup'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type OrderFilterTab =
  | 'all'
  | 'confirmed'
  | 'ready_for_pickup'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered';

export interface ConfirmedOrderItem {
  id: string | number;
  orderCode: string; // e.g. 'GMO-261102-I8DCKE'
  quotationCode: string; // e.g. 'GQT-261102-VZVGWL'
  quotationVersion?: string; // e.g. 'V1'
  requestCode: string; // e.g. 'GPR-261102-L3QT8D'
  product: string;
  customerName: string;
  customerPhone?: string;
  customerCity?: string;
  customerAddress?: string;
  quantity: number;
  unitPrice: number;
  productAmount: number;
  gstTax: number;
  gstPercent?: number | string;
  deliveryFee: number;
  platformFee: number;
  totalPayable: number;
  sellerPayoutAmount?: number;
  confirmedDate: string; // e.g. '02 Nov 2026, 11:43 am'
  status: OrderStatus;
  paymentStatus: 'Successful' | 'Pending' | 'Refunded';
  fundsStatus: 'Held' | 'Released' | 'Settled';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  paidAt?: string;
  shipmentStatus: string;
  shipmentId: string;
  awbNumber: string;
  deliveryStatus: string;
  discrepancy: string;
  settlementStatus: string;
  readyForPickupAt?: string;
  vehicleCategory?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  providerNotice?: string;
  rawItem?: any;
}

export const ORDER_TIMELINE_STEPS = [
  'Order Confirmed',
  'Ready for Pickup',
  'Shipped',
  'Out for Delivery',
  'Delivered / Open Box',
  '24-Hour Settlement Hold'
];

@Component({
  selector: 'app-confirmed-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './confirmed-orders.component.html',
  styleUrl: './confirmed-orders.component.scss'
})
export class ConfirmedOrdersComponent implements OnInit {
  isLoading = false;
  isRefreshing = false;

  // Orders Data
  orders: ConfirmedOrderItem[] = [];
  filteredOrders: ConfirmedOrderItem[] = [];
  pagedOrders: ConfirmedOrderItem[] = [];

  // Filter & Search
  activeTab: OrderFilterTab = 'all';
  searchQuery = '';

  // Server Pagination State
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalRecordsCount = 0;

  // Details Modal State
  isDetailsModalOpen = false;
  isLoadingDetails = false;
  selectedOrder: ConfirmedOrderItem | null = null;

  // Pickup Confirmation Modal State
  isConfirmPickupModalOpen = false;
  isMarkingReadyForPickup = false;
  orderToPickup: ConfirmedOrderItem | null = null;

  readonly timelineSteps = ORDER_TIMELINE_STEPS;

  constructor(
    private ecomService: EcomService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const qParams = this.route.snapshot.queryParams;
    const statusParam = (qParams['status'] || 'all').toLowerCase();
    const validTabs: OrderFilterTab[] = ['all', 'confirmed', 'ready_for_pickup', 'shipped', 'out_for_delivery', 'delivered'];
    if (validTabs.includes(statusParam as OrderFilterTab)) {
      this.activeTab = statusParam as OrderFilterTab;
    } else {
      this.activeTab = 'all';
    }

    if (qParams['page']) {
      const p = Number(qParams['page']);
      if (!isNaN(p) && p > 0) {
        this.currentPage = p;
      }
    }

    const perPageParam = qParams['per_page'] || qParams['limit'];
    if (perPageParam) {
      const l = Number(perPageParam);
      if (!isNaN(l) && l > 0) {
        this.pageSize = l;
      }
    }

    this.loadOrders();
  }

  // ==========================================
  // PAGINATION GETTERS & CONTROLS
  // ==========================================

  get totalRecords(): number {
    return this.totalRecordsCount || this.filteredOrders.length;
  }

  get paginationFrom(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;

    // Update query params in router URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.activeTab === 'all' ? null : this.activeTab,
        page: this.currentPage === 1 ? null : this.currentPage
      },
      queryParamsHandling: 'merge'
    });

    this.loadOrders();

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 250, behavior: 'smooth' });
    }
  }

  onPageSizeChange(newSize: any): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.activeTab === 'all' ? null : this.activeTab,
        page: null
      },
      queryParamsHandling: 'merge'
    });

    this.loadOrders();
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  }

  // ==========================================
  // DATA MANAGEMENT & LIVE API
  // ==========================================

  loadOrders(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }

    // Pass page and per_page along with status
    const params: any = {
      page: this.currentPage,
      per_page: this.pageSize
    };
    if (this.activeTab && this.activeTab !== 'all') {
      params.status = this.activeTab;
    }

    console.log('[ConfirmedOrders] Loading orders with params:', params);

    this.ecomService.getSellerOrders(params).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.isRefreshing = false;
        console.log('[ConfirmedOrders] Orders response:', res);

        const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
        if (Array.isArray(items)) {
          this.orders = items.map((item: any) => this.mapApiItem(item));
        } else {
          this.orders = [];
        }

        // Server pagination metadata
        const pagination = res?.data?.pagination;
        if (pagination) {
          this.totalRecordsCount = Number(pagination.total !== undefined ? pagination.total : this.orders.length);
          this.currentPage = Number(pagination.current_page || this.currentPage);
          this.pageSize = Number(pagination.per_page || this.pageSize);
          this.totalPages = Number(pagination.last_page || Math.max(1, Math.ceil(this.totalRecordsCount / this.pageSize)));
        } else {
          this.totalRecordsCount = this.orders.length;
          this.totalPages = Math.max(1, Math.ceil(this.totalRecordsCount / this.pageSize));
        }

        this.applyFilter();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.isRefreshing = false;
        console.error('[ConfirmedOrders] Error loading orders:', err);
        const msg = err?.error?.message || err?.message || 'Failed to load confirmed orders from server.';
        this.notificationService.show(msg, 'error');
      }
    });
  }

  private mapApiItem(item: any): ConfirmedOrderItem {
    const snapshot = item.snapshot || {};
    const deliveryAddress = item.delivery_address || {};
    const shipment = item.shipment || null;
    const customer = item.customer || {};

    const rawStatus = String(item.status || 'confirmed').toLowerCase();
    const formattedStatus = this.formatOrderStatus(rawStatus);

    // Customer formatting
    const customerName = customer.name || deliveryAddress.name || 'Customer';
    const customerPhone = deliveryAddress.phone || customer.phone || '—';
    const customerCity = [deliveryAddress.city, deliveryAddress.state].filter(Boolean).join(', ') || '—';
    const customerAddress = [
      deliveryAddress.line1,
      deliveryAddress.line2,
      deliveryAddress.city,
      deliveryAddress.state,
      deliveryAddress.pincode
    ].filter(Boolean).join(', ') || '—';

    // Vehicle Brand
    const vehicleBrand =
      snapshot.product?.vehicle_brand?.name ||
      snapshot.vehicle_brand?.name ||
      snapshot.product?.vehicle_maker?.name ||
      item.product?.vehicle_brand?.name ||
      item.purchase_request?.vehicle_brand?.name ||
      snapshot.vehicle_brand_name ||
      '';

    // Numbers & Commercial amounts
    const quantity = Number(snapshot.quantity ?? item.quantity ?? 1);
    const unitPrice = Number(snapshot.unit_price ?? item.unit_price ?? 0);
    const productAmount = Number(snapshot.product_amount ?? item.product_amount ?? (unitPrice * quantity));
    const gstPercent = snapshot.gst_percent ? Number(snapshot.gst_percent) : 18;
    const gstTax = Number(snapshot.gst_amount ?? item.gst_amount ?? 0);
    const deliveryFee = Number(snapshot.delivery_fee ?? item.delivery_fee ?? 0);
    const platformFee = Number(snapshot.platform_fee ?? item.platform_fee ?? 0);
    const totalPayable = Number(item.final_amount ?? snapshot.final_amount ?? (productAmount + gstTax + deliveryFee + platformFee));
    const sellerPayoutAmount = item.seller_payout_amount !== undefined && item.seller_payout_amount !== null
      ? Number(item.seller_payout_amount)
      : (snapshot.product_total ? Number(snapshot.product_total) : (productAmount + gstTax));

    // Razorpay and Payment timestamps
    const razorpayPaymentId = snapshot.razorpay_payment_id || '';
    const razorpayOrderId = snapshot.razorpay_order_id || '';
    const paidAt = snapshot.paid_at ? this.formatDateTime(snapshot.paid_at) : '';
    const quotationVersion = snapshot.quotation_version ? `V${snapshot.quotation_version}` : '';

    // Payment & Funds Status
    const finStatus = String(item.financial_status || '').toLowerCase();
    let paymentStatus: 'Successful' | 'Pending' | 'Refunded' = 'Successful';
    if (finStatus === 'refunded') {
      paymentStatus = 'Refunded';
    } else if (finStatus === 'pending') {
      paymentStatus = 'Pending';
    } else {
      paymentStatus = 'Successful';
    }

    let fundsStatus: 'Held' | 'Released' | 'Settled' = 'Held';
    if (item.settled_at || finStatus === 'settled') {
      fundsStatus = 'Settled';
    } else if (finStatus === 'released') {
      fundsStatus = 'Released';
    } else {
      fundsStatus = 'Held';
    }

    // Shipment details
    let shipmentStatus = 'Pending';
    if (shipment?.status) {
      shipmentStatus = shipment.status;
    } else if (rawStatus === 'ready_for_pickup') {
      shipmentStatus = 'Ready for Courier Pickup';
    } else if (rawStatus === 'shipped') {
      shipmentStatus = 'Shipped';
    } else if (rawStatus === 'out_for_delivery') {
      shipmentStatus = 'Out for Delivery';
    } else if (rawStatus === 'delivered') {
      shipmentStatus = 'Delivered';
    }

    const shipmentId = shipment?.shipment_number || shipment?.id ? String(shipment.shipment_number || shipment.id) : '—';
    const awbNumber = shipment?.awb_number || shipment?.tracking_number ? String(shipment.awb_number || shipment.tracking_number) : '—';

    // Delivery details
    let deliveryStatus = 'Not Delivered';
    if (item.delivered_at) {
      deliveryStatus = 'Delivered on ' + this.formatDateTime(item.delivered_at);
    } else if (rawStatus === 'delivered') {
      deliveryStatus = 'Delivered';
    }

    // Settlement
    let settlementStatus = 'Pending';
    if (item.settled_at) {
      settlementStatus = 'Settled to Provider on ' + this.formatDateTime(item.settled_at);
    } else if (finStatus === 'funds_held') {
      settlementStatus = 'Funds Held (Escrow)';
    } else if (finStatus === 'settled') {
      settlementStatus = 'Settled to Provider';
    }

    // Date
    const confirmedDate = this.formatDateTime(item.created_at || snapshot.paid_at || snapshot.accepted_at);

    // Provider action notice
    let providerNotice = item.provider_notice;
    if (!providerNotice) {
      if (rawStatus === 'confirmed') {
        providerNotice = 'Payment is successful and funds are held. Provider can prepare the order and mark it Ready for Pickup.';
      } else if (rawStatus === 'ready_for_pickup') {
        providerNotice = 'Order is marked Ready for Pickup. Courier logistics will arrive for pickup soon.';
      } else if (rawStatus === 'delivered') {
        providerNotice = 'Order delivered successfully. Funds released / eligible for settlement.';
      } else {
        providerNotice = 'Payment is successful and funds are held. Order is currently in progress.';
      }
    }

    return {
      id: item.id,
      orderCode: item.order_number || `GMO-${item.id}`,
      quotationCode: snapshot.quotation_reference || (item.quotation_id ? `GQT-${item.quotation_id}` : '—'),
      quotationVersion,
      requestCode: item.purchase_request?.reference || (item.purchase_request_id ? `${item.purchase_request_id}` : '—'),
      product: snapshot.product_name || item.product_name || 'Spare Part',
      customerName,
      customerPhone,
      customerCity,
      customerAddress,
      quantity,
      unitPrice,
      productAmount,
      gstTax,
      gstPercent,
      deliveryFee,
      platformFee,
      totalPayable,
      sellerPayoutAmount,
      confirmedDate,
      status: formattedStatus,
      paymentStatus,
      fundsStatus,
      razorpayPaymentId,
      razorpayOrderId,
      paidAt,
      shipmentStatus,
      shipmentId,
      awbNumber,
      deliveryStatus,
      discrepancy: item.open_discrepancy ? String(item.open_discrepancy) : 'None',
      settlementStatus,
      readyForPickupAt: item.ready_for_pickup_at ? this.formatDateTime(item.ready_for_pickup_at) : undefined,
      vehicleCategory: snapshot.vehicle_category_name || item.vehicle_category?.name || 'Automobile',
      vehicleBrand,
      vehicleModel: item.vehicle_model || snapshot.vehicle_category_name || '',
      providerNotice,
      rawItem: item
    };
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

  private formatOrderStatus(rawStatus: string): OrderStatus {
    const s = String(rawStatus || '').toLowerCase().trim();
    if (s === 'ready_for_pickup' || s === 'ready for pickup') return 'Ready for Pickup';
    if (s === 'shipped') return 'Shipped';
    if (s === 'out_for_delivery' || s === 'out for delivery') return 'Out for Delivery';
    if (s === 'delivered') return 'Delivered';
    if (s === 'cancelled') return 'Cancelled';
    return 'Confirmed';
  }

  setTab(tab: OrderFilterTab): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.currentPage = 1;

    // Update query params in router URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: tab === 'all' ? null : tab,
        page: null
      },
      queryParamsHandling: 'merge'
    });

    this.loadOrders();
  }

  onSearchChange(): void {
    this.applyFilter(true);
  }

  applyFilter(resetPage: boolean = false): void {
    if (resetPage) {
      this.currentPage = 1;
    }

    let result = [...this.orders];

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(item =>
        (item.product && item.product.toLowerCase().includes(q)) ||
        (item.vehicleBrand && item.vehicleBrand.toLowerCase().includes(q)) ||
        (item.orderCode && item.orderCode.toLowerCase().includes(q)) ||
        (item.quotationCode && item.quotationCode.toLowerCase().includes(q)) ||
        (item.requestCode && item.requestCode.toLowerCase().includes(q)) ||
        (item.customerName && item.customerName.toLowerCase().includes(q)) ||
        (item.vehicleModel && item.vehicleModel.toLowerCase().includes(q))
      );
    }

    this.filteredOrders = result;
    this.pagedOrders = result;
  }

  // ==========================================
  // READY FOR PICKUP CONFIRMATION MODAL LOGIC
  // ==========================================

  openConfirmPickupModal(order: ConfirmedOrderItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.orderToPickup = order;
    this.isConfirmPickupModalOpen = true;
  }

  cancelConfirmPickup(): void {
    if (this.isMarkingReadyForPickup) return;
    this.isConfirmPickupModalOpen = false;
    this.orderToPickup = null;
  }

  confirmReadyForPickup(): void {
    if (!this.orderToPickup || this.isMarkingReadyForPickup) return;

    const order = this.orderToPickup;
    this.isMarkingReadyForPickup = true;

    this.ecomService.markSellerOrderReadyForPickup(order.id).subscribe({
      next: (res: any) => {
        this.isMarkingReadyForPickup = false;
        const data = res?.data?.item || res?.data || res;

        if (data && typeof data === 'object' && (data.id || data.status || data.order_number)) {
          const updatedOrder = this.mapApiItem(data);
          const idx = this.orders.findIndex(o => o.id === order.id);
          if (idx !== -1) {
            this.orders[idx] = updatedOrder;
          }
          if (this.selectedOrder && this.selectedOrder.id === order.id) {
            this.selectedOrder = updatedOrder;
          }
        } else {
          const nowStr = new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          order.status = 'Ready for Pickup';
          order.readyForPickupAt = nowStr;
          order.shipmentStatus = 'Ready for Courier Pickup';
          order.providerNotice = 'Order is marked Ready for Pickup. Courier logistics will arrive for pickup soon.';

          const idx = this.orders.findIndex(o => o.id === order.id);
          if (idx !== -1) {
            this.orders[idx].status = 'Ready for Pickup';
            this.orders[idx].readyForPickupAt = nowStr;
            this.orders[idx].shipmentStatus = 'Ready for Courier Pickup';
            this.orders[idx].providerNotice = order.providerNotice;
          }

          if (this.selectedOrder && this.selectedOrder.id === order.id) {
            this.selectedOrder.status = 'Ready for Pickup';
            this.selectedOrder.readyForPickupAt = nowStr;
            this.selectedOrder.shipmentStatus = 'Ready for Courier Pickup';
            this.selectedOrder.providerNotice = order.providerNotice;
          }
        }

        this.applyFilter();

        const msg = res?.message || `Order ${order.orderCode} marked as Ready for Pickup! Courier notified.`;
        this.notificationService.show(msg, 'success');

        this.isConfirmPickupModalOpen = false;
        this.orderToPickup = null;

        this.loadOrders(true);
        if (this.isDetailsModalOpen && this.selectedOrder?.id === order.id) {
          this.ecomService.getSellerOrderDetailss(order.id).subscribe({
            next: (detailRes: any) => {
              const detailData = detailRes?.data?.item || detailRes?.data || detailRes;
              if (detailData && typeof detailData === 'object') {
                this.selectedOrder = this.mapApiItem(detailData);
              }
            }
          });
        }
      },
      error: (err: any) => {
        this.isMarkingReadyForPickup = false;
        console.error('[ConfirmedOrders] Error marking ready for pickup:', err);
        const errMsg = err?.message || err?.error?.message || 'Failed to mark order as Ready for Pickup.';
        // this.notificationService.show(errMsg, 'error');
      }
    });
  }

  // Status Badge CSS Classes
  getStatusBadgeClass(status: OrderStatus | string): string {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'ready for pickup':
      case 'ready_for_pickup':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
      case 'out for delivery':
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }

  // Timeline Step Index
  getOrderStepIndex(status: OrderStatus | string): number {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'confirmed':
        return 0; // Order Confirmed
      case 'ready for pickup':
      case 'ready_for_pickup':
        return 1; // Ready for Pickup
      case 'shipped':
        return 2; // Shipped
      case 'out for delivery':
      case 'out_for_delivery':
        return 3; // Out for Delivery
      case 'delivered':
        return 5; // Delivered / 24-Hour Settlement
      default:
        return 0;
    }
  }

  isStepCompleted(stepIdx: number, status: OrderStatus | string): boolean {
    const current = this.getOrderStepIndex(status);
    return stepIdx <= current;
  }

  // ==========================================
  // DETAILS MODAL & API CALL
  // ==========================================

  openDetailsModal(order: ConfirmedOrderItem): void {
    this.selectedOrder = order;
    this.isDetailsModalOpen = true;
    this.isLoadingDetails = true;

    // Fetch order details by ID: GET /api/v1/ecom/seller/orders/:id
    this.ecomService.getSellerOrderDetailss(order.id).subscribe({
      next: (res: any) => {
        this.isLoadingDetails = false;
        console.log('[ConfirmedOrders] Order details response for order', order.id, res);
        const data = res?.data?.item || res?.data || res;
        if (data && typeof data === 'object') {
          this.selectedOrder = this.mapApiItem(data);
        }
      },
      error: (err: any) => {
        this.isLoadingDetails = false;
        console.error('[ConfirmedOrders] Error loading order details:', err);
      }
    });
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.isLoadingDetails = false;
    this.selectedOrder = null;
  }

  copyText(text: string, label = 'Copied'): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.notificationService.show(`${label} to clipboard!`, 'success');
    }
  }
}
