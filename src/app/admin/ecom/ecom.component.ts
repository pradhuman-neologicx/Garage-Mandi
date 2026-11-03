import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

export type EcomAdminTab = 'orders' | 'settlements';

export type OrderStatus =
  | 'confirmed'
  | 'ready_for_pickup'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface AdminOrderNote {
  id: number;
  author: string;
  role: string;
  text: string;
  createdAt: string;
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
    financialStatus: 'funds_held' | 'released' | 'settled' | 'refunded';
    refundAmount?: number;
    refundReason?: string;
    refundedAt?: string;
  };

  status: OrderStatus;
  createdAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;

  shipment?: {
    id: string;
    courierPartner: string;
    awbNumber: string;
    status: string;
    dispatchedAt?: string;
  } | null;

  notes: AdminOrderNote[];
}

export interface SellerSettlement {
  id: number;
  settlementNumber: string;
  orderId: number;
  orderNumber: string;
  orderDate: string;
  deliveredAt?: string;
  sellerId: number;
  sellerName: string;
  workshopName: string;
  sellerPhone: string;
  sellerBank: {
    bankName: string;
    accountNumber: string;
    ifsc: string;
    upiId: string;
  };
  productName: string;
  productTotal: number;
  platformFeeDeducted: number;
  payoutAmount: number;
  status: 'eligible' | 'settled' | 'held' | 'disputed';
  holdReason?: string;
  eligibleAt?: string;
  settledAt?: string;
  payoutDetails?: {
    payoutMode: 'IMPS/NEFT' | 'UPI' | 'Razorpay Route' | 'Bank Transfer';
    utrNumber: string;
    processedBy: string;
    notes?: string;
    processedAt: string;
  };
}

const STORAGE_ORDERS_KEY = 'gm_admin_ecom_mock_orders_v1';
const STORAGE_SETTLEMENTS_KEY = 'gm_admin_ecom_mock_settlements_v1';

const INITIAL_MOCK_ORDERS: AdminOrder[] = [
  {
    id: 5,
    orderNumber: 'GMO-261102-I8DCKE',
    purchaseRequestId: 10,
    purchaseRequestRef: 'GPR-261102-L3QT8D',
    quotationId: 12,
    quotationRef: 'GQT-261102-VZVGWL',
    quotationVersion: 1,
    productName: 'Tail Light (LED Assembly)',
    vehicleCategory: 'Two Wheeler',
    vehicleModel: 'Hero Splendor Plus',
    quantity: 1,
    unitPrice: 10.0,
    productAmount: 10.0,
    gstPercent: 18.0,
    gstAmount: 1.8,
    productTotal: 11.8,
    deliveryFee: 40.0,
    platformFee: 0.24,
    finalAmount: 52.04,
    sellerPayoutAmount: 11.8,
    customer: {
      id: 97,
      name: 'Ashi Sharma',
      phone: '+91 96325 89653',
      email: 'ashi.sharma@example.com',
      city: 'Bharatpur',
      state: 'Rajasthan',
      pincode: '456465',
      address: 'Plot 12, Gandhi Nagar, Near Main Bus Stand, Bharatpur, Rajasthan - 456465'
    },
    seller: {
      id: 135,
      name: 'Ramesh Sharma',
      workshopName: 'Sharma Auto Spare Parts',
      phone: '+91 98290 12345',
      city: 'Jaipur',
      state: 'Rajasthan',
      bankName: 'State Bank of India',
      accountNumber: 'XXXXXX4512',
      ifsc: 'SBIN0001420',
      upiId: 'sharmaauto@sbi'
    },
    payment: {
      method: 'Razorpay UPI',
      paymentId: 'pay_TvChUtCfrHoD03',
      orderId: 'order_TvCh1h0ZENUzSN',
      paidAt: '02 Nov 2026, 11:43 am',
      status: 'paid',
      financialStatus: 'funds_held'
    },
    status: 'confirmed',
    createdAt: '02 Nov 2026, 11:41 am',
    shipment: null,
    notes: [
      {
        id: 1,
        author: 'System',
        role: 'Auto',
        text: 'Payment received via Razorpay. ₹52.04 held in escrow. Provider notified.',
        createdAt: '02 Nov 2026, 11:43 am'
      }
    ]
  },
  {
    id: 6,
    orderNumber: 'GMO-261031-7CZVHS',
    purchaseRequestId: 2,
    purchaseRequestRef: 'GPR-261030-SEWCCO',
    quotationId: 5,
    quotationRef: 'GQT-261031-7CZVHS',
    quotationVersion: 1,
    productName: 'Front Brake Pad Kit (Ceramic)',
    vehicleCategory: 'Two Wheeler',
    vehicleModel: 'Honda Activa 6G',
    quantity: 2,
    unitPrice: 200.0,
    productAmount: 400.0,
    gstPercent: 18.0,
    gstAmount: 72.0,
    productTotal: 472.0,
    deliveryFee: 40.0,
    platformFee: 9.44,
    finalAmount: 521.44,
    sellerPayoutAmount: 472.0,
    customer: {
      id: 104,
      name: 'Rohit Verma',
      phone: '+91 98765 43210',
      email: 'rohit.v@example.com',
      city: 'Karol Bagh',
      state: 'Delhi',
      pincode: '334001',
      address: 'House 54, Block C, Karol Bagh, New Delhi - 334001'
    },
    seller: {
      id: 142,
      name: 'Sunil Meena',
      workshopName: 'Meena Motors & Spares',
      phone: '+91 97840 98765',
      city: 'Jaipur',
      state: 'Rajasthan',
      bankName: 'HDFC Bank',
      accountNumber: 'XXXXXX9821',
      ifsc: 'HDFC0000240',
      upiId: 'meenamotors@hdfcbank'
    },
    payment: {
      method: 'Razorpay NetBanking',
      paymentId: 'pay_RuX9082341M',
      orderId: 'order_RuX11223399',
      paidAt: '31 Oct 2026, 02:20 pm',
      status: 'paid',
      financialStatus: 'funds_held'
    },
    status: 'ready_for_pickup',
    createdAt: '31 Oct 2026, 02:15 pm',
    shipment: {
      id: 'SHP-9021',
      courierPartner: 'Delhivery Surface',
      awbNumber: 'DLV-9872145',
      status: 'Ready for Courier Pickup'
    },
    notes: [
      {
        id: 1,
        author: 'Sunil Meena',
        role: 'Provider',
        text: 'Packed securely in branded bubble wrap box. Awaiting pickup.',
        createdAt: '31 Oct 2026, 04:30 pm'
      }
    ]
  },
  {
    id: 7,
    orderNumber: 'GMO-261028-KL9871',
    purchaseRequestId: 15,
    purchaseRequestRef: 'GPR-261028-A4B7C9',
    quotationId: 19,
    quotationRef: 'GQT-261028-U9982X',
    quotationVersion: 2,
    productName: 'Radiator Assembly & Cooling Fan',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Maruti Suzuki Swift (2022)',
    quantity: 1,
    unitPrice: 6800.0,
    productAmount: 6800.0,
    gstPercent: 18.0,
    gstAmount: 1224.0,
    productTotal: 8024.0,
    deliveryFee: 250.0,
    platformFee: 160.48,
    finalAmount: 8434.48,
    sellerPayoutAmount: 8024.0,
    customer: {
      id: 88,
      name: 'Vikram Rathore',
      phone: '+91 95870 34567',
      email: 'vikram.r@example.com',
      city: 'Udaipur',
      state: 'Rajasthan',
      pincode: '313001',
      address: 'Fatehpura Main Road, Near Saheliyon Ki Bari, Udaipur, Rajasthan - 313001'
    },
    seller: {
      id: 110,
      name: 'Anil Choudhary',
      workshopName: 'Apex Car Spares Hub',
      phone: '+91 94140 77889',
      city: 'Jodhpur',
      state: 'Rajasthan',
      bankName: 'ICICI Bank',
      accountNumber: 'XXXXXX3319',
      ifsc: 'ICIC0000104',
      upiId: 'apexspares@icici'
    },
    payment: {
      method: 'Razorpay Card',
      paymentId: 'pay_Jk8890214Z',
      orderId: 'order_Jk99112233',
      paidAt: '28 Oct 2026, 10:15 am',
      status: 'paid',
      financialStatus: 'funds_held'
    },
    status: 'shipped',
    createdAt: '28 Oct 2026, 10:10 am',
    shipment: {
      id: 'SHP-8812',
      courierPartner: 'BlueDart Express',
      awbNumber: 'BD-8821903',
      status: 'In Transit - Destination Hub',
      dispatchedAt: '29 Oct 2026, 11:00 am'
    },
    notes: [
      {
        id: 1,
        author: 'Admin Support',
        role: 'Admin',
        text: 'Logistics dispatched via BlueDart Air cargo.',
        createdAt: '29 Oct 2026, 11:30 am'
      }
    ]
  },
  {
    id: 8,
    orderNumber: 'GMO-261020-DL5531',
    purchaseRequestId: 22,
    purchaseRequestRef: 'GPR-261020-M1N2P3',
    quotationId: 28,
    quotationRef: 'GQT-261020-Q4R5S6',
    quotationVersion: 1,
    productName: 'Clutch Plate & Pressure Plate Kit',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Hyundai Creta 1.5 Diesel',
    quantity: 1,
    unitPrice: 4500.0,
    productAmount: 4500.0,
    gstPercent: 18.0,
    gstAmount: 810.0,
    productTotal: 5310.0,
    deliveryFee: 180.0,
    platformFee: 106.2,
    finalAmount: 5596.2,
    sellerPayoutAmount: 5310.0,
    customer: {
      id: 76,
      name: 'Pooja Yadav',
      phone: '+91 94145 67812',
      email: 'pooja.y@example.com',
      city: 'Kota',
      state: 'Rajasthan',
      pincode: '324005',
      address: 'Sector 2, Talwandi, Kota, Rajasthan - 324005'
    },
    seller: {
      id: 155,
      name: 'Rajendra Solanki',
      workshopName: 'Royal Garage & Spares',
      phone: '+91 98291 55443',
      city: 'Kota',
      state: 'Rajasthan',
      bankName: 'HDFC Bank',
      accountNumber: 'XXXXXX8821',
      ifsc: 'HDFC0001234',
      upiId: 'royalspares@okhdfcbank'
    },
    payment: {
      method: 'Razorpay UPI',
      paymentId: 'pay_Kk4400192Q',
      orderId: 'order_Kk77112244',
      paidAt: '20 Oct 2026, 03:40 pm',
      status: 'paid',
      financialStatus: 'released'
    },
    status: 'delivered',
    createdAt: '20 Oct 2026, 03:30 pm',
    deliveredAt: '24 Oct 2026, 01:15 pm',
    shipment: {
      id: 'SHP-7721',
      courierPartner: 'Shadowfax',
      awbNumber: 'SFX-998812',
      status: 'Delivered (OTP Verified)'
    },
    notes: [
      {
        id: 1,
        author: 'Logistics Webhook',
        role: 'System',
        text: 'Delivered successfully with verified recipient OTP.',
        createdAt: '24 Oct 2026, 01:16 pm'
      },
      {
        id: 2,
        author: 'System',
        role: 'Auto',
        text: '24-hour return hold completed. Funds released and eligible for settlement payout.',
        createdAt: '25 Oct 2026, 02:00 pm'
      }
    ]
  },
  {
    id: 9,
    orderNumber: 'GMO-261015-ST1190',
    purchaseRequestId: 31,
    purchaseRequestRef: 'GPR-261015-X1Y2Z3',
    quotationId: 35,
    quotationRef: 'GQT-261015-W4V5U6',
    quotationVersion: 1,
    productName: 'Bosch Spark Plugs (Pack of 4)',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Maruti Suzuki Baleno',
    quantity: 1,
    unitPrice: 1250.0,
    productAmount: 1250.0,
    gstPercent: 18.0,
    gstAmount: 225.0,
    productTotal: 1475.0,
    deliveryFee: 60.0,
    platformFee: 29.5,
    finalAmount: 1564.5,
    sellerPayoutAmount: 1475.0,
    customer: {
      id: 61,
      name: 'Manoj Joshi',
      phone: '+91 94140 54321',
      email: 'm.joshi@example.com',
      city: 'Bikaner',
      state: 'Rajasthan',
      pincode: '334003',
      address: 'B-12, Pawanpuri, Sadul Colony, Bikaner, Rajasthan - 334003'
    },
    seller: {
      id: 135,
      name: 'Ramesh Sharma',
      workshopName: 'Sharma Auto Spare Parts',
      phone: '+91 98290 12345',
      city: 'Jaipur',
      state: 'Rajasthan',
      bankName: 'State Bank of India',
      accountNumber: 'XXXXXX4512',
      ifsc: 'SBIN0001420',
      upiId: 'sharmaauto@sbi'
    },
    payment: {
      method: 'Razorpay UPI',
      paymentId: 'pay_Bb99112288',
      orderId: 'order_Bb55443322',
      paidAt: '15 Oct 2026, 11:15 am',
      status: 'paid',
      financialStatus: 'settled'
    },
    status: 'delivered',
    createdAt: '15 Oct 2026, 11:00 am',
    deliveredAt: '18 Oct 2026, 04:30 pm',
    shipment: {
      id: 'SHP-6611',
      courierPartner: 'Delhivery Surface',
      awbNumber: 'DLV-5544112',
      status: 'Delivered (OTP Verified)'
    },
    notes: [
      {
        id: 1,
        author: 'Finance Admin',
        role: 'Admin',
        text: 'Settlement payout of ₹1,475.00 disbursed via IMPS (UTR: UTR9082319451).',
        createdAt: '20 Oct 2026, 03:00 pm'
      }
    ]
  },
  {
    id: 10,
    orderNumber: 'GMO-261012-CN7789',
    purchaseRequestId: 40,
    purchaseRequestRef: 'GPR-261012-K7L8M9',
    quotationId: 44,
    quotationRef: 'GQT-261012-P1O2I3',
    quotationVersion: 1,
    productName: 'Alternator Pulley & V-Belt',
    vehicleCategory: 'Four Wheeler',
    vehicleModel: 'Tata Nexon Facelift',
    quantity: 1,
    unitPrice: 2100.0,
    productAmount: 2100.0,
    gstPercent: 18.0,
    gstAmount: 378.0,
    productTotal: 2478.0,
    deliveryFee: 120.0,
    platformFee: 49.56,
    finalAmount: 2647.56,
    sellerPayoutAmount: 2478.0,
    customer: {
      id: 52,
      name: 'Kailash Choudhary',
      phone: '+91 98290 88776',
      email: 'kailash.c@example.com',
      city: 'Ajmer',
      state: 'Rajasthan',
      pincode: '305001',
      address: 'Plot 88, Civil Lines, Near Railway Hospital, Ajmer, Rajasthan - 305001'
    },
    seller: {
      id: 160,
      name: 'Mukesh Pareek',
      workshopName: 'Super Car Clinic',
      phone: '+91 97845 11223',
      city: 'Jaipur',
      state: 'Rajasthan',
      bankName: 'Bank of Baroda',
      accountNumber: 'XXXXXX7741',
      ifsc: 'BARB0AJMJAIP',
      upiId: 'supercar@barodampay'
    },
    payment: {
      method: 'Razorpay UPI',
      paymentId: 'pay_Zz11994433',
      orderId: 'order_Zz44332211',
      paidAt: '12 Oct 2026, 09:20 am',
      status: 'refunded',
      financialStatus: 'refunded',
      refundAmount: 2647.56,
      refundReason: 'Customer cancelled order before dispatch',
      refundedAt: '13 Oct 2026, 11:30 am'
    },
    status: 'cancelled',
    createdAt: '12 Oct 2026, 09:15 am',
    cancelledAt: '13 Oct 2026, 11:25 am',
    cancelReason: 'Customer requested cancellation due to personal reasons.',
    shipment: null,
    notes: [
      {
        id: 1,
        author: 'Mukesh Pareek',
        role: 'Provider',
        text: 'Customer notified they no longer need the part.',
        createdAt: '13 Oct 2026, 10:45 am'
      },
      {
        id: 2,
        author: 'Finance Admin',
        role: 'Admin',
        text: 'Full refund of ₹2,647.56 initiated via Razorpay gateway.',
        createdAt: '13 Oct 2026, 11:30 am'
      }
    ]
  }
];

const INITIAL_MOCK_SETTLEMENTS: SellerSettlement[] = [
  {
    id: 1,
    settlementNumber: 'SET-261025-001',
    orderId: 8,
    orderNumber: 'GMO-261020-DL5531',
    orderDate: '20 Oct 2026',
    deliveredAt: '24 Oct 2026',
    sellerId: 155,
    sellerName: 'Rajendra Solanki',
    workshopName: 'Royal Garage & Spares',
    sellerPhone: '+91 98291 55443',
    sellerBank: {
      bankName: 'HDFC Bank',
      accountNumber: 'XXXXXX8821',
      ifsc: 'HDFC0001234',
      upiId: 'royalspares@okhdfcbank'
    },
    productName: 'Clutch Plate & Pressure Plate Kit',
    productTotal: 5310.0,
    platformFeeDeducted: 106.2,
    payoutAmount: 5310.0,
    status: 'eligible',
    eligibleAt: '25 Oct 2026, 02:00 pm'
  },
  {
    id: 2,
    settlementNumber: 'SET-261020-002',
    orderId: 9,
    orderNumber: 'GMO-261015-ST1190',
    orderDate: '15 Oct 2026',
    deliveredAt: '18 Oct 2026',
    sellerId: 135,
    sellerName: 'Ramesh Sharma',
    workshopName: 'Sharma Auto Spare Parts',
    sellerPhone: '+91 98290 12345',
    sellerBank: {
      bankName: 'State Bank of India',
      accountNumber: 'XXXXXX4512',
      ifsc: 'SBIN0001420',
      upiId: 'sharmaauto@sbi'
    },
    productName: 'Bosch Spark Plugs (Pack of 4)',
    productTotal: 1475.0,
    platformFeeDeducted: 29.5,
    payoutAmount: 1475.0,
    status: 'settled',
    settledAt: '20 Oct 2026, 03:00 pm',
    payoutDetails: {
      payoutMode: 'IMPS/NEFT',
      utrNumber: 'UTR9082319451',
      processedBy: 'Super Admin',
      notes: 'Cleared regular weekly payout batch #41',
      processedAt: '20 Oct 2026, 03:00 pm'
    }
  },
  {
    id: 3,
    settlementNumber: 'SET-261028-003',
    orderId: 7,
    orderNumber: 'GMO-261028-KL9871',
    orderDate: '28 Oct 2026',
    sellerId: 110,
    sellerName: 'Anil Choudhary',
    workshopName: 'Apex Car Spares Hub',
    sellerPhone: '+91 94140 77889',
    sellerBank: {
      bankName: 'ICICI Bank',
      accountNumber: 'XXXXXX3319',
      ifsc: 'ICIC0000104',
      upiId: 'apexspares@icici'
    },
    productName: 'Radiator Assembly & Cooling Fan',
    productTotal: 8024.0,
    platformFeeDeducted: 160.48,
    payoutAmount: 8024.0,
    status: 'held',
    holdReason: 'Order in transit with BlueDart. Payout releases 24h after delivery.'
  },
  {
    id: 4,
    settlementNumber: 'SET-261031-004',
    orderId: 6,
    orderNumber: 'GMO-261031-7CZVHS',
    orderDate: '31 Oct 2026',
    sellerId: 142,
    sellerName: 'Sunil Meena',
    workshopName: 'Meena Motors & Spares',
    sellerPhone: '+91 97840 98765',
    sellerBank: {
      bankName: 'HDFC Bank',
      accountNumber: 'XXXXXX9821',
      ifsc: 'HDFC0000240',
      upiId: 'meenamotors@hdfcbank'
    },
    productName: 'Front Brake Pad Kit (Ceramic)',
    productTotal: 472.0,
    platformFeeDeducted: 9.44,
    payoutAmount: 472.0,
    status: 'held',
    holdReason: 'Order ready for courier pickup. Payout releases 24h after delivery.'
  }
];

@Component({
  selector: 'app-ecom',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ecom.component.html',
  styleUrl: './ecom.component.scss'
})
export class EcomComponent implements OnInit {
  activeTab: EcomAdminTab = 'orders';
  isLoading = false;
  isRefreshing = false;

  // ==========================================================
  // ORDERS DATA & STATE
  // ==========================================================
  orders: AdminOrder[] = [];
  filteredOrders: AdminOrder[] = [];
  pagedOrders: AdminOrder[] = [];
  orderSearchQuery = '';
  orderStatusFilter = 'all';
  orderCurrentPage = 1;
  orderPageSize = 6;
  orderTotalPages = 1;

  // ==========================================================
  // SETTLEMENTS DATA & STATE
  // ==========================================================
  settlements: SellerSettlement[] = [];
  filteredSettlements: SellerSettlement[] = [];
  pagedSettlements: SellerSettlement[] = [];
  settlementSearchQuery = '';
  settlementStatusFilter = 'all';
  settlementCurrentPage = 1;
  settlementPageSize = 6;
  settlementTotalPages = 1;

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
  cancelReasonInput = 'Customer requested cancellation';
  cancelRemarksInput = '';
  autoRefundCustomer = true;

  // 5. Refund Option Modal
  isRefundModalOpen = false;
  orderToRefund: AdminOrder | null = null;
  refundType: 'full' | 'partial' = 'full';
  refundAmountInput: number = 0;
  refundReasonInput = 'Defective part / Order cancelled';
  refundMethodInput = 'Razorpay Gateway (Original Source)';

  // 6. Seller Payout Modal (Settlements)
  isPayoutModalOpen = false;
  settlementToPayout: SellerSettlement | null = null;
  payoutModeInput: 'IMPS/NEFT' | 'UPI' | 'Razorpay Route' | 'Bank Transfer' = 'IMPS/NEFT';
  payoutUtrInput = '';
  payoutNotesInput = '';

  // 7. Settlement Receipt Modal
  isReceiptModalOpen = false;
  selectedReceipt: SellerSettlement | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadData();
  }

  setMainTab(tab: EcomAdminTab): void {
    this.activeTab = tab;
  }

  // ==========================================================
  // DATA PERSISTENCE & LOADING
  // ==========================================================
  loadData(isRefresh = false): void {
    if (isRefresh) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }

    setTimeout(() => {
      this.isLoading = false;
      this.isRefreshing = false;

      // Load Orders
      let storedOrders: AdminOrder[] | null = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
          if (raw) storedOrders = JSON.parse(raw);
        } catch (_) {}
      }
      this.orders = storedOrders && storedOrders.length > 0
        ? storedOrders
        : JSON.parse(JSON.stringify(INITIAL_MOCK_ORDERS));

      // Load Settlements
      let storedSettlements: SellerSettlement[] | null = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = localStorage.getItem(STORAGE_SETTLEMENTS_KEY);
          if (raw) storedSettlements = JSON.parse(raw);
        } catch (_) {}
      }
      this.settlements = storedSettlements && storedSettlements.length > 0
        ? storedSettlements
        : JSON.parse(JSON.stringify(INITIAL_MOCK_SETTLEMENTS));

      this.applyOrderFilters(true);
      this.applySettlementFilters(true);

      if (isRefresh) {
        this.notificationService.show('Orders and Settlements data refreshed successfully.', 'info');
      }
    }, isRefresh ? 400 : 150);
  }

  private persistOrders(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(this.orders));
      } catch (_) {}
    }
  }

  private persistSettlements(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_SETTLEMENTS_KEY, JSON.stringify(this.settlements));
      } catch (_) {}
    }
  }

  // ==========================================================
  // METRICS & STATS
  // ==========================================================
  get totalOrdersCount(): number {
    return this.orders.length;
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

  get pendingSettlementsCount(): number {
    return this.settlements.filter(s => s.status === 'eligible').length;
  }

  get pendingSettlementsAmount(): number {
    return this.settlements
      .filter(s => s.status === 'eligible')
      .reduce((acc, s) => acc + (s.payoutAmount || 0), 0);
  }

  get settledPayoutsAmount(): number {
    return this.settlements
      .filter(s => s.status === 'settled')
      .reduce((acc, s) => acc + (s.payoutAmount || 0), 0);
  }

  // ==========================================================
  // ORDERS FILTERING & PAGINATION
  // ==========================================================
  setOrderStatusFilter(status: string): void {
    this.orderStatusFilter = status;
    this.applyOrderFilters(true);
  }

  applyOrderFilters(resetPage = false): void {
    if (resetPage) {
      this.orderCurrentPage = 1;
    }

    let result = [...this.orders];

    if (this.orderStatusFilter !== 'all') {
      result = result.filter(o => o.status === this.orderStatusFilter);
    }

    if (this.orderSearchQuery && this.orderSearchQuery.trim()) {
      const q = this.orderSearchQuery.trim().toLowerCase();
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
    const start = (this.orderCurrentPage - 1) * this.orderPageSize;
    this.pagedOrders = this.filteredOrders.slice(start, start + this.orderPageSize);
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
  // SETTLEMENTS FILTERING & PAGINATION
  // ==========================================================
  setSettlementStatusFilter(status: string): void {
    this.settlementStatusFilter = status;
    this.applySettlementFilters(true);
  }

  applySettlementFilters(resetPage = false): void {
    if (resetPage) {
      this.settlementCurrentPage = 1;
    }

    let result = [...this.settlements];

    if (this.settlementStatusFilter !== 'all') {
      result = result.filter(s => s.status === this.settlementStatusFilter);
    }

    if (this.settlementSearchQuery && this.settlementSearchQuery.trim()) {
      const q = this.settlementSearchQuery.trim().toLowerCase();
      result = result.filter(s =>
        s.settlementNumber.toLowerCase().includes(q) ||
        s.orderNumber.toLowerCase().includes(q) ||
        s.sellerName.toLowerCase().includes(q) ||
        s.workshopName.toLowerCase().includes(q) ||
        s.sellerPhone.includes(q) ||
        s.productName.toLowerCase().includes(q)
      );
    }

    this.filteredSettlements = result;
    this.settlementTotalPages = Math.max(1, Math.ceil(this.filteredSettlements.length / this.settlementPageSize));
    if (this.settlementCurrentPage > this.settlementTotalPages) {
      this.settlementCurrentPage = this.settlementTotalPages;
    }

    const start = (this.settlementCurrentPage - 1) * this.settlementPageSize;
    this.pagedSettlements = this.filteredSettlements.slice(start, start + this.settlementPageSize);
  }

  goToSettlementPage(page: number): void {
    if (page < 1 || page > this.settlementTotalPages || page === this.settlementCurrentPage) return;
    this.settlementCurrentPage = page;
    const start = (this.settlementCurrentPage - 1) * this.settlementPageSize;
    this.pagedSettlements = this.filteredSettlements.slice(start, start + this.settlementPageSize);
  }

  // ==========================================================
  // MODAL ACTIONS: 1. VIEW DETAILED ORDER
  // ==========================================================
  openDetailsModal(order: AdminOrder): void {
    this.selectedOrder = order;
    this.isDetailsModalOpen = true;
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

    const newNote: AdminOrderNote = {
      id: Date.now(),
      author: 'Admin Support',
      role: 'Admin',
      text: this.newNoteText.trim(),
      createdAt: this.formatCurrentDateTime()
    };

    this.orderForNote.notes.unshift(newNote);

    // Update in list
    const idx = this.orders.findIndex(o => o.id === this.orderForNote!.id);
    if (idx !== -1) {
      this.orders[idx] = this.orderForNote;
    }

    this.persistOrders();
    this.applyOrderFilters();

    this.notificationService.show(`Note added to Order ${this.orderForNote.orderNumber}!`, 'success');
    this.closeNotesModal();
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

      // Check if settlement entry exists, or create new eligible settlement!
      const existingSet = this.settlements.find(s => s.orderId === this.orderForStatus!.id);
      if (existingSet) {
        existingSet.status = 'eligible';
        existingSet.eligibleAt = this.formatCurrentDateTime();
      } else {
        const newSet: SellerSettlement = {
          id: Date.now(),
          settlementNumber: `SET-${this.formatDateCode()}-${Math.floor(100 + Math.random() * 900)}`,
          orderId: this.orderForStatus.id,
          orderNumber: this.orderForStatus.orderNumber,
          orderDate: this.orderForStatus.createdAt,
          deliveredAt: this.orderForStatus.deliveredAt,
          sellerId: this.orderForStatus.seller.id,
          sellerName: this.orderForStatus.seller.name,
          workshopName: this.orderForStatus.seller.workshopName,
          sellerPhone: this.orderForStatus.seller.phone,
          sellerBank: { ...this.orderForStatus.seller },
          productName: this.orderForStatus.productName,
          productTotal: this.orderForStatus.productTotal,
          platformFeeDeducted: this.orderForStatus.platformFee,
          payoutAmount: this.orderForStatus.sellerPayoutAmount,
          status: 'eligible',
          eligibleAt: this.formatCurrentDateTime()
        };
        this.settlements.unshift(newSet);
        this.persistSettlements();
        this.applySettlementFilters();
      }
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

    this.persistOrders();
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
    this.cancelReasonInput = 'Customer requested cancellation';
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
    const nowStr = this.formatCurrentDateTime();

    order.status = 'cancelled';
    order.cancelledAt = nowStr;
    order.cancelReason = this.cancelRemarksInput.trim()
      ? `${this.cancelReasonInput} - ${this.cancelRemarksInput.trim()}`
      : this.cancelReasonInput;

    if (this.autoRefundCustomer) {
      order.payment.status = 'refunded';
      order.payment.financialStatus = 'refunded';
      order.payment.refundAmount = order.finalAmount;
      order.payment.refundReason = `Auto-refund on cancellation: ${order.cancelReason}`;
      order.payment.refundedAt = nowStr;
    }

    order.notes.unshift({
      id: Date.now(),
      author: 'Super Admin',
      role: 'Admin',
      text: `Order Cancelled. Reason: ${order.cancelReason}.${this.autoRefundCustomer ? ` Full refund of ₹${order.finalAmount.toFixed(2)} initiated.` : ''}`,
      createdAt: nowStr
    });

    // If settlement was pending, cancel it too
    const sIdx = this.settlements.findIndex(s => s.orderId === order.id);
    if (sIdx !== -1) {
      this.settlements.splice(sIdx, 1);
      this.persistSettlements();
      this.applySettlementFilters();
    }

    const idx = this.orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      this.orders[idx] = order;
    }

    this.persistOrders();
    this.applyOrderFilters();

    this.notificationService.show(
      `Order ${order.orderNumber} successfully cancelled! ${this.autoRefundCustomer ? 'Refund processed.' : ''}`,
      'success'
    );

    this.closeCancelModal();
  }

  // ==========================================================
  // MODAL ACTIONS: 5. REFUND OPTION
  // ==========================================================
  openRefundModal(order: AdminOrder, event?: Event): void {
    if (event) event.stopPropagation();
    this.orderToRefund = order;
    this.refundType = 'full';
    this.refundAmountInput = order.finalAmount;
    this.refundReasonInput = 'Customer dispute / Defective part';
    this.refundMethodInput = 'Razorpay Gateway (Original Source)';
    this.isRefundModalOpen = true;
  }

  closeRefundModal(): void {
    this.isRefundModalOpen = false;
    this.orderToRefund = null;
  }

  onRefundTypeChange(): void {
    if (!this.orderToRefund) return;
    if (this.refundType === 'full') {
      this.refundAmountInput = this.orderToRefund.finalAmount;
    }
  }

  confirmRefund(): void {
    if (!this.orderToRefund) return;

    const amount = Number(this.refundAmountInput);
    if (isNaN(amount) || amount <= 0 || amount > this.orderToRefund.finalAmount) {
      this.notificationService.show(`Refund amount must be between ₹1 and ₹${this.orderToRefund.finalAmount.toFixed(2)}`, 'error');
      return;
    }

    const order = this.orderToRefund;
    const nowStr = this.formatCurrentDateTime();

    const isFull = amount >= order.finalAmount;
    order.payment.status = isFull ? 'refunded' : 'partially_refunded';
    order.payment.financialStatus = 'refunded';
    order.payment.refundAmount = amount;
    order.payment.refundReason = this.refundReasonInput;
    order.payment.refundedAt = nowStr;

    order.notes.unshift({
      id: Date.now(),
      author: 'Super Admin',
      role: 'Admin',
      text: `${isFull ? 'Full' : 'Partial'} refund of ₹${amount.toFixed(2)} processed via ${this.refundMethodInput}. Reason: ${this.refundReasonInput}`,
      createdAt: nowStr
    });

    const idx = this.orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      this.orders[idx] = order;
    }

    this.persistOrders();
    this.applyOrderFilters();

    this.notificationService.show(
      `Refund of ₹${amount.toFixed(2)} successfully issued for ${order.orderNumber}!`,
      'success'
    );

    this.closeRefundModal();
  }

  // ==========================================================
  // MODAL ACTIONS: 6. SELLER SETTLEMENT PAYOUT
  // ==========================================================
  openPayoutModal(settlement: SellerSettlement, event?: Event): void {
    if (event) event.stopPropagation();
    this.settlementToPayout = settlement;
    this.payoutModeInput = 'IMPS/NEFT';
    this.payoutUtrInput = `UTR${Date.now().toString().slice(-8)}`;
    this.payoutNotesInput = 'Batch Payout via Banking API';
    this.isPayoutModalOpen = true;
  }

  closePayoutModal(): void {
    this.isPayoutModalOpen = false;
    this.settlementToPayout = null;
  }

  confirmPayoutRelease(): void {
    if (!this.settlementToPayout) return;

    if (!this.payoutUtrInput.trim()) {
      this.notificationService.show('Please provide a UTR or Transaction reference number.', 'error');
      return;
    }

    const settlement = this.settlementToPayout;
    const nowStr = this.formatCurrentDateTime();

    settlement.status = 'settled';
    settlement.settledAt = nowStr;
    settlement.payoutDetails = {
      payoutMode: this.payoutModeInput,
      utrNumber: this.payoutUtrInput.trim(),
      processedBy: 'Super Admin',
      notes: this.payoutNotesInput.trim(),
      processedAt: nowStr
    };

    // Also update order financial status to settled
    const order = this.orders.find(o => o.id === settlement.orderId);
    if (order) {
      order.payment.financialStatus = 'settled';
      order.notes.unshift({
        id: Date.now(),
        author: 'Finance Admin',
        role: 'Admin',
        text: `Seller Payout of ₹${settlement.payoutAmount.toFixed(2)} disbursed to ${settlement.workshopName} via ${this.payoutModeInput} (UTR: ${this.payoutUtrInput}).`,
        createdAt: nowStr
      });
      this.persistOrders();
      this.applyOrderFilters();
    }

    const idx = this.settlements.findIndex(s => s.id === settlement.id);
    if (idx !== -1) {
      this.settlements[idx] = settlement;
    }

    this.persistSettlements();
    this.applySettlementFilters();

    this.notificationService.show(
      `Payout of ₹${settlement.payoutAmount.toFixed(2)} transferred to ${settlement.workshopName}! UTR: ${this.payoutUtrInput}`,
      'success'
    );

    this.closePayoutModal();
  }

  // ==========================================================
  // MODAL ACTIONS: 7. SETTLEMENT RECEIPT
  // ==========================================================
  openReceiptModal(settlement: SellerSettlement, event?: Event): void {
    if (event) event.stopPropagation();
    this.selectedReceipt = settlement;
    this.isReceiptModalOpen = true;
  }

  closeReceiptModal(): void {
    this.isReceiptModalOpen = false;
    this.selectedReceipt = null;
  }

  printReceipt(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
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
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  }

  getSettlementStatusBadgeClass(status: string): string {
    switch (status) {
      case 'eligible':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'settled':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'held':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'disputed':
        return 'bg-rose-100 text-rose-800 border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }

  formatStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'ready_for_pickup': return 'Ready for Pickup';
      case 'shipped': return 'Shipped';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }

  formatFinancialLabel(status: string): string {
    switch (status) {
      case 'funds_held': return 'Funds in Escrow';
      case 'released': return 'Eligible for Payout';
      case 'settled': return 'Settled to Seller';
      case 'refunded': return 'Refunded to Customer';
      default: return status;
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

  private formatDateCode(): string {
    const d = new Date();
    const yy = d.getFullYear().toString().slice(-2);
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yy}${mm}${dd}`;
  }
}
