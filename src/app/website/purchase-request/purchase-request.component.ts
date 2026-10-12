import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';

export interface Quotation {
  id: string;
  sellerName: string;
  sellerType: string;
  rating: number;
  verified: boolean;
  unitPrice: number;
  quantity: number;
  deliveryFee: number;
  platformFee: number;
  validity: string;
  validUntil: string;
  notes: string;
}

export interface PurchaseRequest {
  id: string;
  product: string;
  category: string;
  quantity: number;
  requestDate: string;
  status: 'Quote Received' | 'Awaiting Quotation' | 'Awaiting Acceptance' | 'Awaiting Payment' | 'Order Confirmed';
  statusMessage: string;
  note?: string;
  currentStep: number;
  quotations: Quotation[];
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

  // Main list
  purchaseRequests: PurchaseRequest[] = [
    {
      id: 'REQ-1001',
      product: 'Brake Pad Set',
      category: 'Four Wheeler • Braking System',
      quantity: 2,
      requestDate: '15 Sep 2026',
      status: 'Quote Received',
      statusMessage: 'Seller quotation received. Review the quotation.',
      note: 'Front & rear high-performance ceramic brake pads for Honda City 2021 model.',
      currentStep: 3,
      quotations: [
        {
          id: 'QUO-1001',
          sellerName: 'ABC Auto Parts',
          sellerType: 'Automotive Parts Seller',
          rating: 4.8,
          verified: true,
          unitPrice: 4250,
          quantity: 2,
          deliveryFee: 250,
          platformFee: 425,
          validity: '24 Hours',
          validUntil: '16 Sep 2026, 03:30 PM',
          notes: 'OEM Grade Ceramic Brake Pad Set. 100% genuine with 6 months manufacturer warranty.'
        },
        {
          id: 'QUO-1002',
          sellerName: 'XYZ Automotive',
          sellerType: 'Certified Garage & Auto Spares',
          rating: 4.6,
          verified: true,
          unitPrice: 4375,
          quantity: 2,
          deliveryFee: 200,
          platformFee: 425,
          validity: '24 Hours',
          validUntil: '16 Sep 2026, 04:15 PM',
          notes: 'Bosch Genuine Spares with free brake fluid bottle on confirmation.'
        }
      ]
    },
    {
      id: 'REQ-1002',
      product: 'Clutch Plate',
      category: 'Four Wheeler • Transmission',
      quantity: 1,
      requestDate: '14 Sep 2026',
      status: 'Awaiting Quotation',
      statusMessage: 'Waiting for seller quotation.',
      note: 'Heavy-duty clutch plate assembly for Hyundai Creta 1.5 Diesel 2020.',
      currentStep: 2,
      quotations: []
    },
    {
      id: 'REQ-1003',
      product: 'LED Headlight Assembly',
      category: 'Four Wheeler • Electrical & Lighting',
      quantity: 2,
      requestDate: '12 Sep 2026',
      status: 'Quote Received',
      statusMessage: 'Seller quotation received. Review the quotation.',
      note: 'Pair of projector LED headlights for Maruti Suzuki Swift 2022.',
      currentStep: 3,
      quotations: [
        {
          id: 'QUO-1003',
          sellerName: 'Speedline Spares & Lighting',
          sellerType: 'OEM Lighting Distributor',
          rating: 4.9,
          verified: true,
          unitPrice: 5800,
          quantity: 2,
          deliveryFee: 300,
          platformFee: 450,
          validity: '24 Hours',
          validUntil: '16 Sep 2026, 06:00 PM',
          notes: 'Lumax OEM Certified lights. Plug-and-play harness included.'
        }
      ]
    },
    {
      id: 'REQ-1004',
      product: 'Engine Oil & Filter Combo',
      category: 'Two Wheeler • Engine & Lubrication',
      quantity: 1,
      requestDate: '10 Sep 2026',
      status: 'Order Confirmed',
      statusMessage: 'Order confirmed and payment processed successfully.',
      note: 'Motul 7100 10W-50 4T 2.5L + OEM Oil Filter for Royal Enfield Hunter 350.',
      currentStep: 6,
      quotations: [
        {
          id: 'QUO-1004',
          sellerName: 'Metro Bikers Spares',
          sellerType: 'Two-Wheeler Spare Specialist',
          rating: 4.7,
          verified: true,
          unitPrice: 1950,
          quantity: 1,
          deliveryFee: 100,
          platformFee: 150,
          validity: 'Order Completed',
          validUntil: 'Completed on 11 Sep 2026',
          notes: 'Dispatched via Express Courier.'
        }
      ]
    },
    {
      id: 'REQ-1005',
      product: 'Rear Shock Absorber Pair',
      category: 'Four Wheeler • Suspension & Steering',
      quantity: 2,
      requestDate: '08 Sep 2026',
      status: 'Awaiting Quotation',
      statusMessage: 'Waiting for seller quotation.',
      note: 'Gas-filled rear shock absorbers for Maruti Baleno 2019.',
      currentStep: 2,
      quotations: []
    }
  ];

  // Stepper timeline definition
  steps = [
    { id: 1, label: 'Request Submitted' },
    { id: 2, label: 'Awaiting Quotation' },
    { id: 3, label: 'Quotation Received' },
    { id: 4, label: 'Awaiting Acceptance' },
    { id: 5, label: 'Awaiting Payment' },
    { id: 6, label: 'Order Confirmed' }
  ];

  // Selected state for detail view
  selectedRequest: PurchaseRequest | null = null;

  // Modals state
  isQuotationModalOpen: boolean = false;
  selectedQuotation: Quotation | null = null;

  isFinalConfirmationOpen: boolean = false;
  finalQuantity: number = 1;
  customerDeclarationAccepted: boolean = false;

  availableProducts: string[] = [
    'Brake Pad Set',
    'Clutch Plate',
    'LED Headlight Assembly',
    'Engine Oil & Filter Combo',
    'Rear Shock Absorber Pair',
    'Front Brake Disc Rotor',
    'Air Filter Element',
    'Spark Plug Set (4 Pcs)',
    'Car Battery 12V 35Ah',
    'Timing Belt Kit',
    'Wiper Blades (Pair)',
    'Fuel Filter',
    'Alternator Belt',
    'Radiator Coolant (3L)'
  ];

  isCreateModalOpen: boolean = false;
  newRequest = {
    product: '',
    quantity: 1
  };

  // Toast / notification
  toastMessage: string = '';
  showToast: boolean = false;

  // Order Confirmed modal state
  isOrderSuccessModalOpen: boolean = false;
  confirmedOrderData: any = null;

  ngOnInit(): void {
    // Select first request by default for responsive split view or deep inspection
    if (this.purchaseRequests.length > 0) {
      this.selectedRequest = this.purchaseRequests[0];
    }
  }

  // Filtered requests getter
  get filteredRequests(): PurchaseRequest[] {
    return this.purchaseRequests.filter(req => {
      const matchesFilter =
        this.activeFilter === 'ALL' ||
        (this.activeFilter === 'QUOTE_RECEIVED' && req.status === 'Quote Received') ||
        (this.activeFilter === 'AWAITING_QUOTATION' && req.status === 'Awaiting Quotation') ||
        (this.activeFilter === 'CONFIRMED' && req.status === 'Order Confirmed');

      const query = this.searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        req.id.toLowerCase().includes(query) ||
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
    return this.purchaseRequests.filter(r => r.status === 'Quote Received').length;
  }

  get awaitingQuotationCount(): number {
    return this.purchaseRequests.filter(r => r.status === 'Awaiting Quotation').length;
  }

  get confirmedCount(): number {
    return this.purchaseRequests.filter(r => r.status === 'Order Confirmed').length;
  }

  // Select request
  selectRequest(req: PurchaseRequest): void {
    this.selectedRequest = req;
    // Scroll to detail on mobile
    if (window.innerWidth < 1024) {
      const el = document.getElementById('request-details-panel');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
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

  // Dynamic calculations for final confirmation
  get productAmount(): number {
    if (!this.selectedQuotation) return 0;
    return this.selectedQuotation.unitPrice * this.finalQuantity;
  }

  get gstTax(): number {
    // 19.43% GST / Tax as per mobile screenshot (8500 -> 1651.50)
    return Math.round((this.productAmount * 0.194294) * 100) / 100;
  }

  get deliveryFee(): number {
    return this.selectedQuotation?.deliveryFee || 250;
  }

  get platformFee(): number {
    // 5% convenience fee
    return Math.round((this.productAmount * 0.05) * 100) / 100;
  }

  get finalPayableAmount(): number {
    return this.productAmount + this.gstTax + this.deliveryFee + this.platformFee;
  }

  // Proceed to Payment / Order Confirm
  continueToPayment(): void {
    if (!this.customerDeclarationAccepted) {
      this.displayToast('Please confirm the customer declaration first.');
      return;
    }

    if (this.selectedRequest && this.selectedQuotation) {
      // Update request state
      this.selectedRequest.status = 'Order Confirmed';
      this.selectedRequest.currentStep = 6;
      this.selectedRequest.statusMessage = 'Order confirmed and payment processed successfully.';

      this.confirmedOrderData = {
        requestId: this.selectedRequest.id,
        sellerName: this.selectedQuotation.sellerName,
        product: this.selectedRequest.product,
        quantity: this.finalQuantity,
        totalAmount: this.finalPayableAmount,
        orderDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };

      this.isFinalConfirmationOpen = false;
      this.isOrderSuccessModalOpen = true;
      this.displayToast('Payment successful! Order confirmed.');
    }
  }

  closeOrderSuccessModal(): void {
    this.isOrderSuccessModalOpen = false;
  }

  // Create Request Modal
  openCreateModal(): void {
    this.newRequest = {
      product: '',
      quantity: 1
    };
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  submitCreateRequest(): void {
    if (!this.newRequest.product) {
      this.displayToast('Please select a product from the dropdown.');
      return;
    }

    if (!this.newRequest.quantity || this.newRequest.quantity < 1) {
      this.displayToast('Please enter a valid quantity.');
      return;
    }

    const nextId = 'REQ-' + (1000 + this.purchaseRequests.length + 1);
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const createdReq: PurchaseRequest = {
      id: nextId,
      product: this.newRequest.product,
      category: 'Spare Parts Inquiry',
      quantity: this.newRequest.quantity,
      requestDate: today,
      status: 'Awaiting Quotation',
      statusMessage: 'Waiting for seller quotation.',
      currentStep: 2,
      quotations: []
    };

    this.purchaseRequests.unshift(createdReq);
    this.selectedRequest = createdReq;
    this.isCreateModalOpen = false;
    this.displayToast(`Purchase request ${nextId} created successfully!`);
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
