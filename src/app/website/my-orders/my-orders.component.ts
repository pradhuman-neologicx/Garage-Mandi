import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { EcomService } from 'src/app/core/services/ecom.service';

export interface OrderItem {
  id: string;
  orderNumber: string;
  product: string;
  vehicleCategory: string;
  quantity: number;
  unitPrice: number;
  productAmount: number;
  gstPercent: number;
  gstTax: number;
  productTotal: number;
  deliveryFee: number;
  platformFee: number;
  finalAmount: number;
  currency: string;
  seller: string;
  sellerBusinessName: string;
  sellerContactName: string;
  sellerId: number | string;
  sellerType: string;
  orderDate: string;
  orderTime: string;
  status: 'Confirmed' | 'Ready for Pickup' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  statusMessage: string;
  paymentStatus: 'Successful' | 'Pending' | 'Failed';
  fundsStatus: 'Held' | 'Settled' | 'Refunded';
  settlementStatus: 'Funds Held' | 'Settled to Seller' | 'Under Review';
  requestId: string;
  quotationId: string;
  quotationVersion: number;
  quotationNotes?: string;
  validUntil?: string;
  submittedAt?: string;
  acceptanceTimestamp: string;
  currentStep: number;
  deliveryAddress?: {
    name?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  rawItem?: any;
}

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.scss'
})
export class MyOrdersComponent implements OnInit {
  // Filter tabs: 'ALL' | 'CONFIRMED' | 'READY_FOR_PICKUP' | 'SHIPPED' | 'DELIVERED'
  activeFilter: string = 'ALL';
  searchQuery: string = '';

  // Loading state
  isLoadingOrders: boolean = false;

  // Pagination state from API
  pagination = {
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1
  };

  // Order Details Modal state
  isDetailsModalOpen: boolean = false;
  selectedOrder: OrderItem | null = null;

  // 5 Steps in Order Progress Timeline
  orderSteps = [
    {
      id: 1,
      title: 'Order Confirmed',
      description: 'Payment successfully completed via Razorpay and funds held in escrow',
      icon: 'fa-receipt'
    },
    {
      id: 2,
      title: 'Ready for Pickup',
      description: 'Seller has packaged the parts and booked delivery pickup',
      icon: 'fa-box-archive'
    },
    {
      id: 3,
      title: 'Shipped',
      description: 'Shipment handed over to logistics partner and in transit',
      icon: 'fa-truck-fast'
    },
    {
      id: 4,
      title: 'Out for Delivery',
      description: 'Order is out for final delivery to your destination address',
      icon: 'fa-motorcycle'
    },
    {
      id: 5,
      title: 'Delivered - Open Box',
      description: 'Open-box inspection completed and verified by customer',
      icon: 'fa-box-open'
    }
  ];

  // Dynamic list of orders loaded from API
  orders: OrderItem[] = [];

  constructor(private ecomService: EcomService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(page: number = 1): void {
    this.isLoadingOrders = true;
    this.pagination.currentPage = page;
    this.ecomService.getPurchaseRequests({ page: page, per_page: this.pagination.perPage }).subscribe({
      next: (res: any) => {
        this.isLoadingOrders = false;
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
          // Filter only items that have an order placed (status == 'ordered', order exists, or payment successful)
          const orderItems = items.filter((item: any) => {
            const s = (item.status || '').toLowerCase().trim();
            const ps = (item.payment_status || '').toLowerCase().trim();
            return !!item.order || s === 'ordered' || s === 'order_confirmed' || s === 'confirmed' || ps === 'successful' || ps === 'paid';
          });

          this.orders = orderItems.map((item: any) => this.mapApiOrder(item));

          if (this.orders.length > 0) {
            if (this.selectedOrder) {
              const fresh = this.orders.find(o => o.id === this.selectedOrder?.id);
              if (fresh) {
                this.selectedOrder = fresh;
              }
            } else {
              this.selectedOrder = this.orders[0];
            }
          } else {
            this.selectedOrder = null;
          }
        } else {
          this.orders = [];
          this.selectedOrder = null;
        }
      },
      error: (err) => {
        this.isLoadingOrders = false;
        console.error('Failed to load orders:', err);
      }
    });
  }

  loadPurchaseRequests(): void {
    this.loadOrders();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.pagination.lastPage && page !== this.pagination.currentPage) {
      this.loadOrders(page);
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

  private mapOrderStatus(orderStatus: string, itemStatus: string): {
    status: 'Confirmed' | 'Ready for Pickup' | 'Shipped' | 'Out for Delivery' | 'Delivered';
    step: number;
    message: string;
  } {
    const os = (orderStatus || '').toLowerCase().trim();
    const is = (itemStatus || '').toLowerCase().trim();

    if (os === 'delivered' || is === 'delivered' || os === 'completed') {
      return {
        status: 'Delivered',
        step: 5,
        message: 'Open-box delivery completed and verified by customer.'
      };
    }
    if (os === 'out_for_delivery' || os === 'out-for-delivery') {
      return {
        status: 'Out for Delivery',
        step: 4,
        message: 'Order is on the way to your delivery address.'
      };
    }
    if (os === 'shipped' || os === 'in_transit' || os === 'dispatched') {
      return {
        status: 'Shipped',
        step: 3,
        message: 'Shipment handed over to logistics partner and in transit.'
      };
    }
    if (os === 'ready_for_pickup' || os === 'ready' || os === 'packaged' || os === 'packed') {
      return {
        status: 'Ready for Pickup',
        step: 2,
        message: 'Seller has packaged the order and arranged pickup.'
      };
    }
    // Default for newly placed / confirmed order
    return {
      status: 'Confirmed',
      step: 1,
      message: 'Payment completed via Razorpay and order is confirmed. Funds are held in escrow.'
    };
  }

  private mapApiOrder(item: any): OrderItem {
    const snap = item.commercial_snapshot || {};
    const ord = item.order || {};
    const catName = item.vehicle_category?.name || '';

    // Active/accepted quotation from quotations array if present
    const quote = (Array.isArray(item.quotations) && item.quotations.length > 0)
      ? (item.quotations.find((q: any) => q.id === item.accepted_quotation_id) || item.quotations[0])
      : null;

    // Status mapping
    const statusMapping = this.mapOrderStatus(ord.status, item.status);

    // Format created date
    let orderDate = 'Recent';
    let orderTime = '';
    const rawDate = ord.created_at || snap.accepted_at || item.accepted_at || item.created_at;
    if (rawDate) {
      try {
        const d = new Date(rawDate);
        orderDate = d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        orderTime = d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch (_) {
        orderDate = String(rawDate);
      }
    }

    // Format acceptance date
    let acceptanceTimestamp = orderDate + (orderTime ? (', ' + orderTime) : '');
    const rawAccepted = snap.accepted_at || item.accepted_at || quote?.accepted_at;
    if (rawAccepted) {
      try {
        const d = new Date(rawAccepted);
        acceptanceTimestamp = d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ', ' + d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch (_) {}
    }

    // Format validity date
    let validUntil = '';
    if (quote?.valid_until) {
      try {
        const d = new Date(quote.valid_until);
        validUntil = d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ', ' + d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch (_) {
        validUntil = quote.valid_until;
      }
    }

    // Format submitted date
    let submittedAt = '';
    if (quote?.submitted_at) {
      try {
        const d = new Date(quote.submitted_at);
        submittedAt = d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ', ' + d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch (_) {
        submittedAt = quote.submitted_at;
      }
    }

    // Pricing calculations from commercial_snapshot or quotation
    const unitPrice = Number(snap.unit_price !== undefined ? snap.unit_price : (quote?.unit_price || 0));
    const quantity = Number(snap.quantity || quote?.quantity || item.quantity || 1);
    const productAmount = Number(snap.product_amount !== undefined ? snap.product_amount : (quote?.product_amount || (unitPrice * quantity)));
    const gstPercent = Number(snap.gst_percent !== undefined ? snap.gst_percent : (quote?.gst_percent || 18));
    const gstTax = Number(snap.gst_amount !== undefined ? snap.gst_amount : (quote?.gst_amount || 0));
    const productTotal = Number(snap.product_total !== undefined ? snap.product_total : (quote?.product_total || (productAmount + gstTax)));
    const deliveryFee = Number(snap.delivery_fee !== undefined ? snap.delivery_fee : (quote?.delivery_fee || 0));
    const platformFee = Number(snap.platform_fee !== undefined ? snap.platform_fee : (quote?.platform_fee || 0));
    const finalAmount = Number(snap.final_amount !== undefined ? snap.final_amount : (quote?.final_amount || (productTotal + deliveryFee + platformFee)));
    const currency = snap.currency || quote?.currency || 'INR';

    // Seller Information
    const sellerBusiness = quote?.seller?.business_name || '';
    const sellerContact = quote?.seller?.name || '';
    const sellerId = quote?.seller?.id || snap.seller_id || '';
    const sellerDisplay = sellerBusiness || sellerContact || (sellerId ? `Seller #${sellerId}` : 'Garage Mandi Partner');

    // Payment & Escrow
    const isDelivered = statusMapping.status === 'Delivered';
    const payStatus = (item.payment_status || 'successful').toLowerCase();
    const paymentStatus: 'Successful' | 'Pending' | 'Failed' =
      payStatus === 'successful' || payStatus === 'paid' ? 'Successful' :
      payStatus === 'failed' ? 'Failed' : 'Pending';

    return {
      id: String(ord.id || item.id),
      orderNumber: ord.order_number || ('GMO-' + item.id),
      product: snap.product_name || item.product_name || 'Automotive Spare Part',
      vehicleCategory: catName || 'Two Wheeler',
      quantity,
      unitPrice,
      productAmount,
      gstPercent,
      gstTax,
      productTotal,
      deliveryFee,
      platformFee,
      finalAmount,
      currency,
      seller: sellerDisplay,
      sellerBusinessName: sellerBusiness,
      sellerContactName: sellerContact,
      sellerId,
      sellerType: catName ? `${catName} Specialist` : 'Automotive Parts Seller',
      orderDate,
      orderTime,
      status: statusMapping.status,
      statusMessage: statusMapping.message,
      paymentStatus,
      fundsStatus: isDelivered ? 'Settled' : 'Held',
      settlementStatus: isDelivered ? 'Settled to Seller' : 'Funds Held',
      requestId: item.reference || ('GPR-' + item.id),
      quotationId: snap.quotation_reference || quote?.reference || (item.accepted_quotation_id ? ('GQT-' + item.accepted_quotation_id) : 'N/A'),
      quotationVersion: Number(snap.quotation_version || quote?.version || 1),
      quotationNotes: quote?.notes || '',
      validUntil,
      submittedAt,
      acceptanceTimestamp,
      currentStep: statusMapping.step,
      deliveryAddress: item.delivery_address || undefined,
      rawItem: item
    };
  }

  // Filtered orders getter
  get filteredOrders(): OrderItem[] {
    return this.orders.filter(ord => {
      const matchesFilter =
        this.activeFilter === 'ALL' ||
        (this.activeFilter === 'CONFIRMED' && ord.status === 'Confirmed') ||
        (this.activeFilter === 'READY_FOR_PICKUP' && ord.status === 'Ready for Pickup') ||
        (this.activeFilter === 'SHIPPED' && ord.status === 'Shipped') ||
        (this.activeFilter === 'DELIVERED' && ord.status === 'Delivered');

      const query = this.searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        ord.orderNumber.toLowerCase().includes(query) ||
        ord.product.toLowerCase().includes(query) ||
        ord.seller.toLowerCase().includes(query) ||
        ord.requestId.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }

  // Counts
  get totalOrdersCount(): number {
    return this.orders.length;
  }

  get completedOrdersCount(): number {
    return this.orders.filter(o => o.status === 'Delivered').length;
  }

  get inProgressOrdersCount(): number {
    return this.orders.filter(o => o.status !== 'Delivered').length;
  }

  // Filter changer
  setFilter(filter: string): void {
    this.activeFilter = filter;
  }

  // Helper for step states
  isStepCompleted(stepId: number, currentStep: number): boolean {
    return stepId < currentStep;
  }

  isStepCurrent(stepId: number, currentStep: number): boolean {
    return stepId === currentStep;
  }

  // Status badge styling
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Confirmed':
        return 'bg-rose-50 text-rose-600 border border-rose-200';
      case 'Ready for Pickup':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Shipped':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Out for Delivery':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  }

  // Open Details Modal
  openOrderDetails(order: OrderItem): void {
    this.selectedOrder = order;
    this.isDetailsModalOpen = true;

    // Fetch full request details to enrich seller or quotation details if available
    const requestId = order.rawItem?.id;
    if (requestId) {
      this.ecomService.getPurchaseRequestDetails(requestId).subscribe({
        next: (res: any) => {
          if (res?.data) {
            const updated = this.mapApiOrder(res.data);
            this.selectedOrder = updated;
            const idx = this.orders.findIndex(o => o.id === updated.id);
            if (idx !== -1) {
              this.orders[idx] = updated;
            }
          }
        },
        error: (err) => {
          console.error('Failed to get purchase request details:', err);
        }
      });
    }
  }

  closeOrderDetails(): void {
    this.isDetailsModalOpen = false;
  }
}
