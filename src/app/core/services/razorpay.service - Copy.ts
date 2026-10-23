import { Injectable } from '@angular/core';

export interface RazorpayPaymentOptions {
  key: string;
  order_id?: string;
  subscription_id?: string;
  customer_id?: string;
  recurring?: 0 | 1;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: any;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  config?: any;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
}

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {
  private scriptLoaded = false;
  private scriptLoadingPromise: Promise<boolean> | null = null;

  constructor() {}

  /**
   * Dynamically loads Razorpay checkout.js script
   */
  loadScript(): Promise<boolean> {
    if (this.scriptLoaded || (typeof window !== 'undefined' && (window as any).Razorpay)) {
      this.scriptLoaded = true;
      return Promise.resolve(true);
    }

    if (this.scriptLoadingPromise) {
      return this.scriptLoadingPromise;
    }

    this.scriptLoadingPromise = new Promise<boolean>((resolve) => {
      if (typeof document === 'undefined') {
        resolve(false);
        return;
      }

      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        this.scriptLoaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        this.scriptLoadingPromise = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  /**
   * Opens Razorpay checkout modal and returns Promise with success response
   */
  pay(options: RazorpayPaymentOptions): Promise<RazorpaySuccessResponse> {
    return new Promise((resolve, reject) => {
      this.loadScript().then((loaded) => {
        if (!loaded || !(window as any).Razorpay) {
          reject({ message: 'Razorpay SDK could not be loaded. Please check your internet connection.' });
          return;
        }

        const rzpOptions: any = {
          key: options.key,
          ...(options.order_id ? { order_id: options.order_id } : {}),
          ...(options.subscription_id ? { subscription_id: options.subscription_id } : {}),
          currency: options.currency || 'INR',
          name: (options.name && options.name !== 'Laravel') ? options.name : 'Garage Mandi',
          description: options.description || 'Subscription purchase',
            ...(options.customer_id ? { customer_id: options.customer_id } : {}),
          // recurring: options.recurring !== undefined ? options.recurring : 1,
          
          prefill: {
            name: options.prefill?.name || '',
            contact: options.prefill?.contact || '',
            email: options.prefill?.email || ''
          },
          theme: {
            color: options.theme?.color || '#D62828'
          },

          
          handler: (response: RazorpaySuccessResponse) => {
            resolve(response);
          },
          modal: {
            ondismiss: () => {
              if (options.modal?.ondismiss) {
                options.modal.ondismiss();
              }
              reject({ dismissed: true, message: 'Payment cancelled by user.' });
            }
          }
        };

        // if (options.subscription_id && rzpOptions.order_id) {
        //   delete rzpOptions.order_id;
        // }
         if (options.subscription_id) {
          rzpOptions.subscription_id = options.subscription_id;
          delete rzpOptions.order_id;
        } else if (options.order_id) {
          rzpOptions.order_id = options.order_id;
        }
 if (options.amount !== undefined && options.amount !== null && !isNaN(Number(options.amount))) {
          rzpOptions.amount = Number(options.amount);
        } else {
          delete rzpOptions.amount;
        }

        const rzp = new (window as any).Razorpay(rzpOptions);
        rzp.on('payment.failed', (errResponse: any) => {
          reject(errResponse?.error || { message: 'Payment failed' });
        });
        rzp.open();
      }).catch((err) => {
        reject(err);
      });
    });
  }
}
