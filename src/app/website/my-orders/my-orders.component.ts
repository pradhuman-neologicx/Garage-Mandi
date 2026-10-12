import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';

export interface OrderItem {
  id: string;
  orderNumber: string;
  product: string;
  quantity: number;
  unitPrice: number;
  productAmount: number;
  gstTax: number;
  deliveryFee: number;
  platformFee: number;
  finalAmount: number;
  seller: string;
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
  acceptanceTimestamp: string;
  currentStep: number;
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

  // Order Details Modal state
  isDetailsModalOpen: boolean = false;
  selectedOrder: OrderItem | null = null;

  // 5 Steps in Order Progress Timeline
  orderSteps = [
    {
      id: 1,
      title: 'Order Confirmed',
      description: 'Payment successfully completed and funds held',
      icon: 'fa-receipt'
    },
    {
      id: 2,
      title: 'Ready for Pickup',
      description: 'Seller has prepared the order',
      icon: 'fa-box-archive'
    },
    {
      id: 3,
      title: 'Shipped',
      description: 'Shipment confirmed by logistics partner',
      icon: 'fa-truck-fast'
    },
    {
      id: 4,
      title: 'Out for Delivery',
      description: 'Order is on the way to delivery address',
      icon: 'fa-motorcycle'
    },
    {
      id: 5,
      title: 'Delivered - Open Box',
      description: 'Open-box delivery completed and verified',
      icon: 'fa-box-open'
    }
  ];

  // Dummy list of orders matching mobile screenshots
  orders: OrderItem[] = [
    {
      id: '1',
      orderNumber: 'ORD-1001',
      product: 'Brake Pad Set',
      quantity: 2,
      unitPrice: 4250,
      productAmount: 8500,
      gstTax: 1651.50,
      deliveryFee: 250,
      platformFee: 425,
      finalAmount: 10826.50,
      seller: 'ABC Auto Parts',
      sellerType: 'Automotive Parts Seller',
      orderDate: '18 Sep 2026',
      orderTime: '02:15 PM',
      status: 'Confirmed',
      statusMessage: 'Payment was successfully completed and funds are held.',
      paymentStatus: 'Successful',
      fundsStatus: 'Held',
      settlementStatus: 'Funds Held',
      requestId: 'REQ-1001',
      quotationId: 'QTN-1001',
      quotationVersion: 1,
      acceptanceTimestamp: '18 Sep 2026, 02:15 PM',
      currentStep: 1
    },
    {
      id: '2',
      orderNumber: 'ORD-1002',
      product: 'Clutch Plate',
      quantity: 1,
      unitPrice: 3200,
      productAmount: 3200,
      gstTax: 590,
      deliveryFee: 150,
      platformFee: 50,
      finalAmount: 3990,
      seller: 'XYZ Automotive',
      sellerType: 'Certified Parts Provider',
      orderDate: '16 Sep 2026',
      orderTime: '11:40 AM',
      status: 'Ready for Pickup',
      statusMessage: 'Seller has packaged the clutch plate and booked pickup.',
      paymentStatus: 'Successful',
      fundsStatus: 'Held',
      settlementStatus: 'Funds Held',
      requestId: 'REQ-1002',
      quotationId: 'QTN-1002',
      quotationVersion: 1,
      acceptanceTimestamp: '16 Sep 2026, 11:40 AM',
      currentStep: 2
    },
    {
      id: '3',
      orderNumber: 'ORD-1003',
      product: 'LED Headlight Assembly',
      quantity: 2,
      unitPrice: 5800,
      productAmount: 11600,
      gstTax: 1500,
      deliveryFee: 300,
      platformFee: 450,
      finalAmount: 13850,
      seller: 'Speedline Spares',
      sellerType: 'OEM Lighting Distributor',
      orderDate: '14 Sep 2026',
      orderTime: '04:10 PM',
      status: 'Shipped',
      statusMessage: 'In transit via Delhivery Express. Tracking ID: TRK984210.',
      paymentStatus: 'Successful',
      fundsStatus: 'Held',
      settlementStatus: 'Funds Held',
      requestId: 'REQ-1003',
      quotationId: 'QTN-1003',
      quotationVersion: 1,
      acceptanceTimestamp: '14 Sep 2026, 04:10 PM',
      currentStep: 3
    },
    {
      id: '4',
      orderNumber: 'ORD-1004',
      product: 'Engine Oil & Filter Combo',
      quantity: 1,
      unitPrice: 1950,
      productAmount: 1950,
      gstTax: 250,
      deliveryFee: 100,
      platformFee: 50,
      finalAmount: 2350,
      seller: 'Metro Bikers Spares',
      sellerType: 'Two-Wheeler Specialist',
      orderDate: '10 Sep 2026',
      orderTime: '01:20 PM',
      status: 'Delivered',
      statusMessage: 'Open-box delivery completed successfully. Verified by customer.',
      paymentStatus: 'Successful',
      fundsStatus: 'Settled',
      settlementStatus: 'Settled to Seller',
      requestId: 'REQ-1004',
      quotationId: 'QTN-1004',
      quotationVersion: 1,
      acceptanceTimestamp: '10 Sep 2026, 01:20 PM',
      currentStep: 5
    },
    {
      id: '5',
      orderNumber: 'ORD-1005',
      product: 'Front Brake Disc Rotor',
      quantity: 2,
      unitPrice: 2800,
      productAmount: 5600,
      gstTax: 850,
      deliveryFee: 200,
      platformFee: 150,
      finalAmount: 6800,
      seller: 'National Auto Agency',
      sellerType: 'Automotive Disc Specialist',
      orderDate: '07 Sep 2026',
      orderTime: '10:05 AM',
      status: 'Confirmed',
      statusMessage: 'Payment was successfully completed and funds are held.',
      paymentStatus: 'Successful',
      fundsStatus: 'Held',
      settlementStatus: 'Funds Held',
      requestId: 'REQ-1005',
      quotationId: 'QTN-1005',
      quotationVersion: 1,
      acceptanceTimestamp: '07 Sep 2026, 10:05 AM',
      currentStep: 1
    }
  ];

  ngOnInit(): void {
    // Default select first order if needed
    if (this.orders.length > 0) {
      this.selectedOrder = this.orders[0];
    }
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
    return 9; // matching screenshot display (9 total)
  }

  get completedOrdersCount(): number {
    return 1; // matching screenshot display (1 completed)
  }

  // Filter changer
  setFilter(filter: string): void {
    this.activeFilter = filter;
  }

  // Active in-transit orders count
  get inProgressOrdersCount(): number {
    return this.orders.filter(o => o.status !== 'Delivered').length;
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
  }

  closeOrderDetails(): void {
    this.isDetailsModalOpen = false;
  }
}
