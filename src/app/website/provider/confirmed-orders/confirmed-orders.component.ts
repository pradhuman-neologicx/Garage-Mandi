import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

export type OrderStatus =
  | 'Confirmed'
  | 'Ready for Pickup'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered';

export type OrderFilterTab =
  | 'all'
  | 'confirmed'
  | 'ready_for_pickup'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered';

export interface ConfirmedOrderItem {
  id: string | number;
  orderCode: string; // e.g. 'ORD-1001'
  quotationCode: string; // e.g. 'QTN-1004'
  requestCode: string; // e.g. 'REQ-1004'
  product: string;
  customerName: string;
  customerPhone?: string;
  customerCity?: string;
  customerAddress?: string;
  quantity: number;
  unitPrice: number;
  productAmount: number;
  gstTax: number;
  deliveryFee: number;
  platformFee: number;
  totalPayable: number;
  confirmedDate: string; // e.g. '22 Sep 2026, 11:20 AM'
  status: OrderStatus;
  paymentStatus: 'Successful' | 'Pending' | 'Refunded';
  fundsStatus: 'Held' | 'Released' | 'Settled';
  shipmentStatus: string;
  shipmentId: string;
  awbNumber: string;
  deliveryStatus: string;
  discrepancy: string;
  settlementStatus: string;
  readyForPickupAt?: string;
  vehicleCategory?: string;
  vehicleModel?: string;
  providerNotice?: string;
}

const STORAGE_KEY = 'garage_mandi_mock_confirmed_orders_v5';

export const ORDER_TIMELINE_STEPS = [
  'Order Confirmed',
  'Ready for Pickup',
  'Shipped',
  'Out for Delivery',
  'Delivered / Open Box',
  '24-Hour Settlement Hold'
];

const INITIAL_MOCK_ORDERS: ConfirmedOrderItem[] = [
  {
    id: 1,
    orderCode: 'ORD-1001',
    quotationCode: 'QTN-1001',
    requestCode: 'REQ-1001',
    product: 'Brake Pad Set (Front & Rear)',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98290 12345',
    customerCity: 'Jaipur, Rajasthan',
    customerAddress: 'Plot 45, Nirman Nagar, Kings Road, Jaipur 302019',
    quantity: 2,
    unitPrice: 4250.00,
    productAmount: 8500.00,
    gstTax: 1530.00,
    deliveryFee: 250.00,
    platformFee: 425.00,
    totalPayable: 10705.00,
    confirmedDate: '22 Sep 2026, 11:20 AM',
    status: 'Confirmed',
    paymentStatus: 'Successful',
    fundsStatus: 'Held',
    shipmentStatus: 'Pending',
    shipmentId: '-',
    awbNumber: '-',
    deliveryStatus: 'Not Delivered',
    discrepancy: 'None',
    settlementStatus: 'Funds Held',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Maruti Suzuki Swift (2022)',
    providerNotice: 'Payment is successful and funds are held. Provider can prepare the order and mark it Ready for Pickup.'
  },
  {
    id: 2,
    orderCode: 'ORD-1002',
    quotationCode: 'QTN-1002',
    requestCode: 'REQ-1002',
    product: 'Front Shock Absorber Strut Pair',
    customerName: 'Vikram Rathore',
    customerPhone: '+91 95870 34567',
    customerCity: 'Udaipur, Rajasthan',
    customerAddress: 'Fatehpura Main Road, Udaipur 313001',
    quantity: 2,
    unitPrice: 3400.00,
    productAmount: 6800.00,
    gstTax: 1224.00,
    deliveryFee: 250.00,
    platformFee: 425.00,
    totalPayable: 8699.00,
    confirmedDate: '22 Sep 2026, 10:15 AM',
    status: 'Confirmed',
    paymentStatus: 'Successful',
    fundsStatus: 'Held',
    shipmentStatus: 'Pending',
    shipmentId: '-',
    awbNumber: '-',
    deliveryStatus: 'Not Delivered',
    discrepancy: 'None',
    settlementStatus: 'Funds Held',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Honda City (5th Gen)',
    providerNotice: 'Payment is successful and funds are held. Provider can prepare the order and mark it Ready for Pickup.'
  },
  {
    id: 3,
    orderCode: 'ORD-1003',
    quotationCode: 'QTN-1003',
    requestCode: 'REQ-1003',
    product: 'Radiator Assembly & Cooling Fan',
    customerName: 'Rakesh Meena',
    customerPhone: '+91 97840 98765',
    customerCity: 'Jaipur, Rajasthan',
    customerAddress: 'Sector 5, Mansarovar, Jaipur 302020',
    quantity: 1,
    unitPrice: 6800.00,
    productAmount: 6800.00,
    gstTax: 1199.00,
    deliveryFee: 250.00,
    platformFee: 425.00,
    totalPayable: 8674.00,
    confirmedDate: '21 Sep 2026, 04:30 PM',
    status: 'Confirmed',
    paymentStatus: 'Successful',
    fundsStatus: 'Held',
    shipmentStatus: 'Pending',
    shipmentId: '-',
    awbNumber: '-',
    deliveryStatus: 'Not Delivered',
    discrepancy: 'None',
    settlementStatus: 'Funds Held',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Tata Nexon Facelift',
    providerNotice: 'Payment is successful and funds are held. Provider can prepare the order and mark it Ready for Pickup.'
  },
  {
    id: 4,
    orderCode: 'ORD-1004',
    quotationCode: 'QTN-1004',
    requestCode: 'REQ-1004',
    product: 'Alternator Pulley & V-Belt',
    customerName: 'Manoj Tiwari',
    customerPhone: '+91 94145 67812',
    customerCity: 'Sikar, Rajasthan',
    customerAddress: 'Bajaj Road, Sikar 332001',
    quantity: 1,
    unitPrice: 2350.00,
    productAmount: 2350.00,
    gstTax: 423.00,
    deliveryFee: 250.00,
    platformFee: 425.00,
    totalPayable: 3448.00,
    confirmedDate: '21 Sep 2026, 01:20 PM',
    status: 'Confirmed',
    paymentStatus: 'Successful',
    fundsStatus: 'Held',
    shipmentStatus: 'Pending',
    shipmentId: '-',
    awbNumber: '-',
    deliveryStatus: 'Not Delivered',
    discrepancy: 'None',
    settlementStatus: 'Funds Held',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Maruti Suzuki Dzire',
    providerNotice: 'Payment is successful and funds are held. Provider can prepare the order and mark it Ready for Pickup.'
  },
  {
    id: 5,
    orderCode: 'ORD-1005',
    quotationCode: 'QTN-1005',
    requestCode: 'REQ-1005',
    product: 'Bosch Spark Plugs & Ignition Coil Set (Pickup Test)',
    customerName: 'Suresh Choudhary',
    customerPhone: '+91 98291 55443',
    customerCity: 'Jaipur, Rajasthan',
    customerAddress: 'Plot 18, Queens Road, Vaishali Nagar, Jaipur 302021',
    quantity: 4,
    unitPrice: 1250.00,
    productAmount: 5000.00,
    gstTax: 900.00,
    deliveryFee: 250.00,
    platformFee: 425.00,
    totalPayable: 6575.00,
    confirmedDate: 'Just Now (22 Sep 2026, 03:15 PM)',
    status: 'Confirmed',
    paymentStatus: 'Successful',
    fundsStatus: 'Held',
    shipmentStatus: 'Pending',
    shipmentId: '-',
    awbNumber: '-',
    deliveryStatus: 'Not Delivered',
    discrepancy: 'None',
    settlementStatus: 'Funds Held',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Hyundai Creta (2024)',
    providerNotice: 'Payment is successful and funds are held. Provider can prepare the order and mark it Ready for Pickup.'
  },
  {
    id: 6,
    orderCode: 'ORD-1006',
    quotationCode: 'QTN-1006',
    requestCode: 'REQ-1006',
    product: 'Clutch Plate & Pressure Plate Kit',
    customerName: 'Amit Joshi',
    customerPhone: '+91 94140 54321',
    customerCity: 'Bikaner, Rajasthan',
    customerAddress: 'B-12, Pawanpuri, Sadul Colony, Bikaner 334003',
    quantity: 1,
    unitPrice: 6800.00,
    productAmount: 6800.00,
    gstTax: 1189.00,
    deliveryFee: 250.00,
    platformFee: 425.00,
    totalPayable: 8664.00,
    confirmedDate: '21 Sep 2026, 02:15 PM',
    status: 'Ready for Pickup',
    readyForPickupAt: '21 Sep 2026, 04:30 PM',
    paymentStatus: 'Successful',
    fundsStatus: 'Held',
    shipmentStatus: 'Ready for Courier Pickup',
    shipmentId: 'SHP-98210',
    awbNumber: 'SFX-982140',
    deliveryStatus: 'Not Delivered',
    discrepancy: 'None',
    settlementStatus: 'Funds Held',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Hyundai Creta',
    providerNotice: 'Order is marked Ready for Pickup. Courier logistics will arrive for pickup soon.'
  },
  {
    id: 7,
    orderCode: 'ORD-1007',
    quotationCode: 'QTN-1007',
    requestCode: 'REQ-1007',
    product: 'LED Headlight Assembly (Right)',
    customerName: 'Priya Singh',
    customerPhone: '+91 96100 23456',
    customerCity: 'Jodhpur, Rajasthan',
    customerAddress: 'Ratanada Circle, Near Circuit House, Jodhpur 342001',
    quantity: 1,
    unitPrice: 3800.00,
    productAmount: 3800.00,
    gstTax: 684.00,
    deliveryFee: 250.00,
    platformFee: 425.00,
    totalPayable: 5159.00,
    confirmedDate: '20 Sep 2026, 11:00 AM',
    status: 'Ready for Pickup',
    readyForPickupAt: '20 Sep 2026, 01:15 PM',
    paymentStatus: 'Successful',
    fundsStatus: 'Held',
    shipmentStatus: 'Ready for Courier Pickup',
    shipmentId: 'SHP-55912',
    awbNumber: 'SFX-119284',
    deliveryStatus: 'Not Delivered',
    discrepancy: 'None',
    settlementStatus: 'Funds Held',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Kia Seltos',
    providerNotice: 'Order is marked Ready for Pickup. Courier logistics will arrive for pickup soon.'
  },
  {
    id: 8,
    orderCode: 'ORD-1008',
    quotationCode: 'QTN-1008',
    requestCode: 'REQ-1008',
    product: 'Aerodynamic Wiper Blades (Pair)',
    customerName: 'Pooja Jain',
    customerPhone: '+91 95490 89012',
    customerCity: 'Jaipur, Rajasthan',
    customerAddress: 'Tonk Road, Mahaveer Nagar, Jaipur 302018',
    quantity: 2,
    unitPrice: 650.00,
    productAmount: 1300.00,
    gstTax: 234.00,
    deliveryFee: 250.00,
    platformFee: 425.00,
    totalPayable: 2209.00,
    confirmedDate: '19 Sep 2026, 06:00 PM',
    status: 'Ready for Pickup',
    readyForPickupAt: '20 Sep 2026, 09:30 AM',
    paymentStatus: 'Successful',
    fundsStatus: 'Held',
    shipmentStatus: 'Ready for Courier Pickup',
    shipmentId: 'SHP-11094',
    awbNumber: 'GME-229401',
    deliveryStatus: 'Not Delivered',
    discrepancy: 'None',
    settlementStatus: 'Funds Held',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Mahindra Thar',
    providerNotice: 'Order is marked Ready for Pickup. Courier logistics will arrive for pickup soon.'
  },
  {
    id: 9,
    orderCode: 'ORD-1009',
    quotationCode: 'QTN-1009',
    requestCode: 'REQ-1009',
    product: 'Car Battery 65Ah High Cranking',
    customerName: 'Rajesh Verma',
    customerPhone: '+91 98280 67890',
    customerCity: 'Ajmer, Rajasthan',
    customerAddress: 'Civil Lines, Near Circuit House, Ajmer 305001',
    quantity: 1,
    unitPrice: 5800.00,
    productAmount: 5800.00,
    gstTax: 975.00,
    deliveryFee: 250.00,
    platformFee: 425.00,
    totalPayable: 7450.00,
    confirmedDate: '18 Sep 2026, 10:45 AM',
    status: 'Shipped',
    readyForPickupAt: '18 Sep 2026, 01:00 PM',
    paymentStatus: 'Successful',
    fundsStatus: 'Held',
    shipmentStatus: 'In Transit',
    shipmentId: 'SHP-88391',
    awbNumber: 'BLR-7489201',
    deliveryStatus: 'In Transit',
    discrepancy: 'None',
    settlementStatus: 'Funds Held',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Mahindra Scorpio-N',
    providerNotice: 'Package is in transit with BlueDart Air. Estimated delivery within 24 hours.'
  },
  {
    id: 10,
    orderCode: 'ORD-1010',
    quotationCode: 'QTN-1010',
    requestCode: 'REQ-1010',
    product: 'Gearbox Oil & Seal Kit',
    customerName: 'Mohan Lal',
    customerPhone: '+91 94600 78901',
    customerCity: 'Alwar, Rajasthan',
    customerAddress: 'Transport Nagar, Delhi Road, Alwar 301001',
    quantity: 1,
    unitPrice: 2200.00,
    productAmount: 2200.00,
    gstTax: 396.00,
    deliveryFee: 250.00,
    platformFee: 425.00,
    totalPayable: 3271.00,
    confirmedDate: '17 Sep 2026, 03:40 PM',
    status: 'Shipped',
    readyForPickupAt: '17 Sep 2026, 05:00 PM',
    paymentStatus: 'Successful',
    fundsStatus: 'Held',
    shipmentStatus: 'In Transit',
    shipmentId: 'SHP-44810',
    awbNumber: 'DLV-554901',
    deliveryStatus: 'In Transit',
    discrepancy: 'None',
    settlementStatus: 'Funds Held',
    vehicleCategory: 'Commercial Vehicle',
    vehicleModel: 'Mahindra Bolero Maxi Truck',
    providerNotice: 'Package is in transit with Delhivery Surface. Track AWB for live updates.'
  },
  {
    id: 11,
    orderCode: 'ORD-1011',
    quotationCode: 'QTN-1011',
    requestCode: 'REQ-1011',
    product: 'Engine Timing Belt Kit with Water Pump',
    customerName: 'Rakesh Meena',
    customerPhone: '+91 97840 98765',
    customerCity: 'Jaipur, Rajasthan',
    customerAddress: 'Sector 5, Mansarovar, Jaipur 302020',
    quantity: 1,
    unitPrice: 6800.00,
    productAmount: 6800.00,
    gstTax: 1199.00,
    deliveryFee: 250.00,
    platformFee: 425.00,
    totalPayable: 8674.00,
    confirmedDate: '16 Sep 2026, 04:30 PM',
    status: 'Out for Delivery',
    readyForPickupAt: '16 Sep 2026, 06:15 PM',
    paymentStatus: 'Successful',
    fundsStatus: 'Held',
    shipmentStatus: 'Out for Delivery',
    shipmentId: 'SHP-77419',
    awbNumber: 'GME-102948',
    deliveryStatus: 'Out for Delivery Today',
    discrepancy: 'None',
    settlementStatus: 'Funds Held',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Tata Nexon',
    providerNotice: 'Courier fleet has arrived in customer area. Open box inspection on delivery.'
  },
  {
    id: 12,
    orderCode: 'ORD-1012',
    quotationCode: 'QTN-1012',
    requestCode: 'REQ-1012',
    product: 'Rear Brake Shoe Set',
    customerName: 'Suresh Patel',
    customerPhone: '+91 96800 12389',
    customerCity: 'Bhilwara, Rajasthan',
    customerAddress: 'Old RTO Road, Bhilwara 311001',
    quantity: 2,
    unitPrice: 580.00,
    productAmount: 1160.00,
    gstTax: 208.00,
    deliveryFee: 250.00,
    platformFee: 425.00,
    totalPayable: 2043.00,
    confirmedDate: '15 Sep 2026, 12:15 PM',
    status: 'Out for Delivery',
    readyForPickupAt: '15 Sep 2026, 02:00 PM',
    paymentStatus: 'Successful',
    fundsStatus: 'Held',
    shipmentStatus: 'Out for Delivery',
    shipmentId: 'SHP-33201',
    awbNumber: 'GME-883921',
    deliveryStatus: 'Out for Delivery Today',
    discrepancy: 'None',
    settlementStatus: 'Funds Held',
    vehicleCategory: 'Two Wheeler',
    vehicleModel: 'TVS Jupiter 125',
    providerNotice: 'Courier fleet has arrived in customer area. Customer will verify part.'
  },
  {
    id: 13,
    orderCode: 'ORD-1013',
    quotationCode: 'QTN-1013',
    requestCode: 'REQ-1013',
    product: 'Engine Oil Filter & O-Ring Pack',
    customerName: 'Deepali Joshi',
    customerPhone: '+91 97720 45678',
    customerCity: 'Kota, Rajasthan',
    customerAddress: 'Near Aerodrome Circle, Gumanpura, Kota 324007',
    quantity: 4,
    unitPrice: 350.00,
    productAmount: 1400.00,
    gstTax: 252.00,
    deliveryFee: 250.00,
    platformFee: 425.00,
    totalPayable: 2327.00,
    confirmedDate: '14 Sep 2026, 01:10 PM',
    status: 'Delivered',
    readyForPickupAt: '14 Sep 2026, 03:00 PM',
    paymentStatus: 'Successful',
    fundsStatus: 'Released',
    shipmentStatus: 'Delivered',
    shipmentId: 'SHP-66120',
    awbNumber: 'DLV-482019',
    deliveryStatus: 'Delivered (Verified OTP)',
    discrepancy: 'None',
    settlementStatus: 'Settled to Provider',
    vehicleCategory: 'Commercial Vehicle',
    vehicleModel: 'Tata Ace Gold',
    providerNotice: 'Order delivered successfully. Escrow funds released to provider wallet.'
  },
  {
    id: 14,
    orderCode: 'ORD-1014',
    quotationCode: 'QTN-1014',
    requestCode: 'REQ-1014',
    product: 'Laser Iridium Spark Plugs (Pack of 4)',
    customerName: 'Anil Sharma',
    customerPhone: '+91 98299 98712',
    customerCity: 'Jaipur, Rajasthan',
    customerAddress: 'C-Scheme, Ashok Nagar, Jaipur 302001',
    quantity: 4,
    unitPrice: 750.00,
    productAmount: 3000.00,
    gstTax: 540.00,
    deliveryFee: 250.00,
    platformFee: 425.00,
    totalPayable: 4215.00,
    confirmedDate: '13 Sep 2026, 09:30 AM',
    status: 'Delivered',
    readyForPickupAt: '13 Sep 2026, 11:00 AM',
    paymentStatus: 'Successful',
    fundsStatus: 'Released',
    shipmentStatus: 'Delivered',
    shipmentId: 'SHP-22109',
    awbNumber: 'SFX-330192',
    deliveryStatus: 'Delivered (Verified OTP)',
    discrepancy: 'None',
    settlementStatus: 'Settled to Provider',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Hyundai i20 N Line',
    providerNotice: 'Order delivered successfully. Funds released to provider account.'
  }
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

  // Pagination State
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;

  // KPIs
  kpis = {
    all: 0,
    confirmed: 0,
    ready_for_pickup: 0,
    shipped: 0,
    out_for_delivery: 0,
    delivered: 0
  };

  // Details Modal State
  isDetailsModalOpen = false;
  selectedOrder: ConfirmedOrderItem | null = null;

  // Pickup Confirmation Modal State
  isConfirmPickupModalOpen = false;
  orderToPickup: ConfirmedOrderItem | null = null;

  readonly timelineSteps = ORDER_TIMELINE_STEPS;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  // ==========================================
  // PAGINATION CONTROLS
  // ==========================================

  get totalRecords(): number {
    return this.filteredOrders.length;
  }

  get paginationFrom(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  updatePagination(): void {
    const total = this.filteredOrders.length;
    this.totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedOrders = this.filteredOrders.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.updatePagination();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 250, behavior: 'smooth' });
    }
  }

  onPageSizeChange(newSize: any): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.updatePagination();
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
  // DATA MANAGEMENT & MOCK API
  // ==========================================

  loadOrders(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }

    setTimeout(() => {
      this.isLoading = false;
      this.isRefreshing = false;

      let stored = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) stored = JSON.parse(raw);
        } catch (_) {}
      }

      if (stored && Array.isArray(stored) && stored.length > 0) {
        // Ensure there is always at least one Confirmed order so user can test Ready for Pickup modal
        const hasConfirmed = stored.some((o: ConfirmedOrderItem) => o.status === 'Confirmed');
        if (!hasConfirmed) {
          const freshConfirmed: ConfirmedOrderItem = JSON.parse(JSON.stringify(INITIAL_MOCK_ORDERS[4]));
          freshConfirmed.id = Date.now();
          freshConfirmed.orderCode = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
          freshConfirmed.status = 'Confirmed';
          stored.unshift(freshConfirmed);
        }
        this.orders = stored;
      } else {
        this.orders = JSON.parse(JSON.stringify(INITIAL_MOCK_ORDERS));
        this.persistOrders();
      }

      this.computeKpis();
      this.applyFilter(true);
    }, isRefresh ? 400 : 250);
  }

  private persistOrders(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders));
      } catch (_) {}
    }
  }

  computeKpis(): void {
    this.kpis.all = this.orders.length;
    this.kpis.confirmed = this.orders.filter(o => o.status === 'Confirmed').length;
    this.kpis.ready_for_pickup = this.orders.filter(o => o.status === 'Ready for Pickup').length;
    this.kpis.shipped = this.orders.filter(o => o.status === 'Shipped').length;
    this.kpis.out_for_delivery = this.orders.filter(o => o.status === 'Out for Delivery').length;
    this.kpis.delivered = this.orders.filter(o => o.status === 'Delivered').length;
  }

  setTab(tab: OrderFilterTab): void {
    this.activeTab = tab;
    this.applyFilter(true);
  }

  onSearchChange(): void {
    this.applyFilter(true);
  }

  applyFilter(resetPage = false): void {
    if (resetPage) {
      this.currentPage = 1;
    }

    let result = [...this.orders];

    if (this.activeTab === 'confirmed') {
      result = result.filter(o => o.status === 'Confirmed');
    } else if (this.activeTab === 'ready_for_pickup') {
      result = result.filter(o => o.status === 'Ready for Pickup');
    } else if (this.activeTab === 'shipped') {
      result = result.filter(o => o.status === 'Shipped');
    } else if (this.activeTab === 'out_for_delivery') {
      result = result.filter(o => o.status === 'Out for Delivery');
    } else if (this.activeTab === 'delivered') {
      result = result.filter(o => o.status === 'Delivered');
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(item =>
        item.product.toLowerCase().includes(q) ||
        item.orderCode.toLowerCase().includes(q) ||
        item.quotationCode.toLowerCase().includes(q) ||
        item.requestCode.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        (item.vehicleModel && item.vehicleModel.toLowerCase().includes(q))
      );
    }

    this.filteredOrders = result;
    this.updatePagination();
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
    this.isConfirmPickupModalOpen = false;
    this.orderToPickup = null;
  }

  confirmReadyForPickup(): void {
    if (!this.orderToPickup) return;

    const order = this.orderToPickup;
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
      this.orders[idx].providerNotice = 'Order is marked Ready for Pickup. Courier logistics will arrive for pickup soon.';
    }

    // If details modal was open for this order, update it too
    if (this.selectedOrder && this.selectedOrder.id === order.id) {
      this.selectedOrder.status = 'Ready for Pickup';
      this.selectedOrder.readyForPickupAt = nowStr;
      this.selectedOrder.shipmentStatus = 'Ready for Courier Pickup';
      this.selectedOrder.providerNotice = order.providerNotice;
    }

    this.persistOrders();
    this.computeKpis();
    this.applyFilter();

    this.notificationService.show(
      `Order ${order.orderCode} marked as Ready for Pickup! Courier notified.`,
      'success'
    );

    this.isConfirmPickupModalOpen = false;
    this.orderToPickup = null;
  }

  // Status Badge CSS Classes
  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Ready for Pickup':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Shipped':
        return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }

  // Timeline Step Index
  getOrderStepIndex(status: OrderStatus): number {
    switch (status) {
      case 'Confirmed':
        return 0; // Order Confirmed
      case 'Ready for Pickup':
        return 1; // Ready for Pickup
      case 'Shipped':
        return 2; // Shipped
      case 'Out for Delivery':
        return 3; // Out for Delivery
      case 'Delivered':
        return 5; // Delivered / 24-Hour Settlement
      default:
        return 0;
    }
  }

  isStepCompleted(stepIdx: number, status: OrderStatus): boolean {
    const current = this.getOrderStepIndex(status);
    return stepIdx <= current;
  }

  // ==========================================
  // DETAILS MODAL
  // ==========================================

  openDetailsModal(order: ConfirmedOrderItem): void {
    this.selectedOrder = order;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedOrder = null;
  }

  resetAllMockData(): void {
    this.orders = JSON.parse(JSON.stringify(INITIAL_MOCK_ORDERS));
    this.persistOrders();
    this.computeKpis();
    this.applyFilter(true);
    this.notificationService.show('Orders mock data reset to initial state.', 'info');
  }

  copyText(text: string, label = 'Copied'): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.notificationService.show(`${label} to clipboard!`, 'success');
    }
  }
}
