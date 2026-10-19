import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../core/services/customer.service';
import { RazorpayService, RazorpaySuccessResponse } from '../../core/services/razorpay.service';
import { NotificationService } from '../../core/services/notificationnew.service';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-provider-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './provider-subscription.component.html',
  styleUrl: './provider-subscription.component.scss'
})
export class ProviderSubscriptionComponent implements OnInit {
  // Current active subscription (or null if none)
  currentSubscription: any = null;
  activeSubscriptions: any[] = [];
  selectedSubToCancel: any = null;
  mySubscriptions: any[] = [];
  subscriptionHistory: any[] = [];

  // Available plans from API
  plans: any[] = [];
  selectedPlans: Set<number> = new Set();

  // Loading & submission flags
  isLoading = true;
  isSubmitting = false;
  isVerifyingPayment = false;

  // Modals
  showExecutiveModal = false;
  executiveCode = '';
  showCancelRenewalModal = false;
  showSuccessReceiptModal = false;
  showGracePayModal = false;
  showHistoryDetailModal = false;
  selectedHistoryItem: any = null;
  copiedTxn = false;
  selectedPaymentMethod: 'card' | 'qr' = 'card';
  lastActivatedSubscription: any = null;

  constructor(
    private customerService: CustomerService,
    private razorpayService: RazorpayService,
    private notificationService: NotificationService,
    private location: Location,
    private router: Router
  ) {}

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/workshop-operations']);
    }
  }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;

    // Clean up any stale localStorage test items
    try {
      localStorage.removeItem('gm_provider_current_subscription');
      localStorage.removeItem('gm_provider_subscription_history');
    } catch (e) {}

    // 1. Fetch current subscription from backend
    this.customerService.getProviderSubscriptions().subscribe({
      next: (res: any) => {
        if (res && (res.status === 200 || res.status === true) && res.data) {
          const subObj = Array.isArray(res.data) ? res.data[0] : res.data;
          if (subObj && (subObj.subscription_id || subObj.subscription_number || subObj.id || (subObj.active_subscriptions && subObj.active_subscriptions.length > 0))) {
            if (subObj.active_subscriptions && Array.isArray(subObj.active_subscriptions) && subObj.active_subscriptions.length > 0) {
              this.activeSubscriptions = subObj.active_subscriptions.map((s: any) => {
                const actions = s.actions || (s.subscription_id === subObj.subscription_id ? subObj.actions : null) || {
                  can_cancel_auto_renew: s.auto_renew !== false && s.mandate_status !== 'cancelled',
                  can_pay_manually: false,
                  can_update_payment_method: false,
                  can_purchase: subObj.actions?.can_purchase ?? false
                };
                return this.normalizeSubscription({ ...s, actions });
              });
              this.currentSubscription = this.activeSubscriptions[0];
            } else {
              this.currentSubscription = this.normalizeSubscription(subObj);
              this.activeSubscriptions = [this.currentSubscription];
            }
            this.mySubscriptions = this.activeSubscriptions;

            // Populate history directly from API
            if (subObj.history && Array.isArray(subObj.history)) {
              this.subscriptionHistory = subObj.history.map((h: any) => {
                const parentPlans = Array.isArray(subObj.plans) ? subObj.plans : [];
                const gracePlans = Array.isArray(subObj.grace?.amount_due?.plans) ? subObj.grace.amount_due.plans : [];

                const detailedPlans = (Array.isArray(h.plans) ? h.plans : []).map((hp: any) => {
                  const hpId = Number(hp.plan_id || hp.id);
                  const matchedPlan = parentPlans.find((p: any) => Number(p.plan_id || p.id) === hpId) ||
                                      gracePlans.find((p: any) => Number(p.plan_id || p.id) === hpId);

                  const pPrice = hp.price !== undefined ? Number(hp.price) : (matchedPlan?.price !== undefined ? Number(matchedPlan.price) : null);
                  const pGst = hp.gst_amount !== undefined ? Number(hp.gst_amount) : (matchedPlan?.gst_amount !== undefined ? Number(matchedPlan.gst_amount) : null);
                  const pTotal = hp.total_amount !== undefined ? Number(hp.total_amount) : (matchedPlan?.total_amount !== undefined ? Number(matchedPlan.total_amount) : null);
                  const pName = hp.plan_name || hp.name || matchedPlan?.plan_name || 'Subscription Plan';

                  return {
                    ...hp,
                    plan_id: hpId,
                    plan_name: pName,
                    price: pPrice,
                    gst_amount: pGst,
                    total_amount: pTotal,
                    vehicle_category: hp.vehicle_category || matchedPlan?.vehicle_category || subObj.vehicle_category,
                    description: hp.description || matchedPlan?.description,
                    features: hp.features || matchedPlan?.features || [],
                    icon: this.getPlanIcon(pName)
                  };
                });

                const planNames = detailedPlans.length > 0
                  ? detailedPlans.map((p: any) => p.plan_name).join(' + ')
                  : (h.plan_names || 'Subscription Plan');

                return {
                  ...h,
                  id: h.transaction_id || h.subscription_number || (h.subscription_id ? String(h.subscription_id) : ''),
                  transaction_id: h.transaction_id || '',
                  subscription_number: h.subscription_number || '',
                  subscription_id: h.subscription_id,
                  event_type: h.activity ? (h.activity.charAt(0).toUpperCase() + h.activity.slice(1)) : '',
                  activity: h.activity || '',
                  plans: detailedPlans,
                  plan_names: planNames,
                  subscription_amount: Number(h.subscription_amount || 0),
                  gst_amount: Number(h.gst_amount || 0),
                  round_off_amount: h.round_off_amount !== undefined ? h.round_off_amount : (subObj.amount_paid?.round_off_amount || null),
                  total_amount: Number(h.total_amount || 0),
                  amount: Number(h.total_amount || 0),
                  period_start: h.period_start,
                  period_end: h.period_end,
                  payment_date: h.payment_date || h.period_start,
                  payment_status: h.payment_status ? (h.payment_status.charAt(0).toUpperCase() + h.payment_status.slice(1)) : '',
                  payment_method: h.payment_method ? (h.payment_method.charAt(0).toUpperCase() + h.payment_method.slice(1)) : '',
                  status: h.status || ''
                };
              });
            }
          }
        }
        this.loadAvailablePlans();
      },
      error: (err) => {
        console.warn('Subscriptions API returned error or empty:', err);
        this.currentSubscription = null;
        this.activeSubscriptions = [];
        this.mySubscriptions = [];
        this.subscriptionHistory = [];
        this.loadAvailablePlans();
      }
    });
  }

  loadAvailablePlans() {
    this.customerService.getSubscriptionPlans().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && (res.status === 200 || res.status === true || res.success)) {
          const rawData = Array.isArray(res.data) ? res.data : (res.data?.data || []);

          this.plans = rawData.map((plan: any) => {
            const categoryName = typeof plan.vehicle_category === 'object'
              ? plan.vehicle_category?.name
              : (plan.vehicle_category || plan.category || plan.type || 'Two Wheeler');

            const basePrice = plan.amount !== undefined ? Number(plan.amount) : (plan.price !== undefined ? Number(plan.price) : 0);
            const gst = plan.gst !== undefined ? Number(plan.gst) : Number((basePrice * ((plan.gst_percent || 18) / 100)).toFixed(2));
            const finalAmount = plan.final_amount !== undefined ? Number(plan.final_amount) : Math.round(basePrice + gst);
            const features = plan.included_info?.features || 
              (typeof plan.features === 'string' ? plan.features.split(',').map((f: string) => f.trim()) : (Array.isArray(plan.features) ? plan.features : []));

            return {
              ...plan,
              id: Number(plan.id),
              name: plan.title || plan.name,
              price: basePrice,
              amount: basePrice,
              gst: gst,
              gst_percent: plan.gst_percent !== undefined ? Number(plan.gst_percent) : 18,
              final_amount: finalAmount,
              category: categoryName,
              icon: plan.icon || this.getPlanIcon(plan.title || plan.name || categoryName),
              description: plan.description,
              features: features
            };
          });
        } else {
          this.plans = [];
        }
      },
      error: (err) => {
        console.error('Error fetching subscription plans:', err);
        this.isLoading = false;
        this.plans = [];
      }
    });
  }

  normalizeSubscription(sub: any): any {
    const rawStatus = (sub.status || '').toLowerCase().trim();
    let mappedStatus = 'Active';
    if (rawStatus === 'grace' || rawStatus === 'grace period' || rawStatus === 'grace_period') {
      mappedStatus = 'Grace Period';
    } else if (rawStatus === 'expired') {
      mappedStatus = 'Expired';
    } else if (rawStatus === 'cancelled' || rawStatus === 'canceled') {
      mappedStatus = 'Cancelled';
    } else if (rawStatus === 'active') {
      mappedStatus = 'Active';
    } else if (sub.status) {
      mappedStatus = sub.status;
    }

    // Auto Renewal status
    let autoRenewal = 'Enabled';
    if (sub.auto_renew !== undefined) {
      autoRenewal = sub.auto_renew ? 'Enabled' : 'Disabled';
    } else if (sub.mandate_status) {
      autoRenewal = (sub.mandate_status === 'confirmed' || sub.mandate_status === 'active') ? 'Enabled' : 'Disabled';
    } else if (sub.auto_renewal !== undefined) {
      autoRenewal = sub.auto_renewal;
    }

    // Plans list
    const rawPlans = sub.plans || (sub.plan ? [sub.plan] : []);
    const normalizedPlans = rawPlans.map((p: any) => {
      const pName = p.plan_name || p.title || p.name || 'Plan';
      const pPrice = p.price !== undefined ? Number(p.price) : Number(p.amount || 0);
      const pGst = p.gst_amount !== undefined ? Number(p.gst_amount) : Number(p.gst || 0);
      const pTotal = p.total_amount !== undefined ? Number(p.total_amount) : (pPrice + pGst);
      return {
        ...p,
        id: Number(p.plan_id || p.id),
        name: pName,
        title: pName,
        category: p.vehicle_category || sub.vehicle_category || 'Service Plan',
        price: pPrice,
        amount: pPrice,
        gst: pGst,
        gst_percent: p.gst_percent !== undefined ? Number(p.gst_percent) : 18,
        final_amount: pTotal,
        total_amount: pTotal,
        features: p.features || [],
        icon: this.getPlanIcon(pName)
      };
    });

    const planIds = sub.plan_ids || normalizedPlans.map((p: any) => Number(p.id));
    const planNames = normalizedPlans.map((p: any) => p.name).join(' + ');

    // Amounts
    const subtotal = sub.amount_paid?.subscription_amount !== undefined
      ? Number(sub.amount_paid.subscription_amount)
      : (sub.amount !== undefined ? Number(sub.amount) : (sub.subtotal || 0));

    const gst = sub.amount_paid?.gst_amount !== undefined
      ? Number(sub.amount_paid.gst_amount)
      : (sub.gst !== undefined ? Number(sub.gst) : 0);

    const totalAmount = sub.amount_paid?.total_amount !== undefined
      ? Number(sub.amount_paid.total_amount)
      : (sub.total_amount !== undefined ? Number(sub.total_amount) : (sub.final_amount || (subtotal + gst)));

    // Grace info
    const graceDaysRemaining = sub.grace?.days_remaining !== undefined
      ? sub.grace.days_remaining
      : (sub.days_remaining !== undefined ? sub.days_remaining : null);

    const graceAmountDue = sub.grace?.amount_due?.total_amount !== undefined
      ? Number(sub.grace.amount_due.total_amount)
      : totalAmount;

    const canCancel = sub.actions?.can_cancel_auto_renew !== undefined
      ? sub.actions.can_cancel_auto_renew
      : (autoRenewal === 'Enabled' && sub.mandate_status !== 'cancelled');

    return {
      id: sub.subscription_number || (sub.subscription_id ? String(sub.subscription_id) : (sub.id || '')),
      subscription_id: sub.subscription_id,
      subscription_number: sub.subscription_number,
      status: mappedStatus,
      raw_status: sub.status,
      auto_renewal: autoRenewal,
      plans: normalizedPlans,
      plan_ids: planIds,
      plan_names: planNames,
      vehicle_category: sub.vehicle_category,
      vehicle_category_id: sub.vehicle_category_id,
      subscription_starts_at: sub.started_at || sub.current_period_start || sub.subscription_starts_at,
      current_period_start: sub.current_period_start || sub.started_at,
      current_period_end: sub.current_period_end || sub.end_date,
      next_renewal_date: sub.next_renewal_at || sub.next_renewal_date,
      grace_ends_at: sub.grace_ends_at || sub.grace?.grace_ends_at,
      renewal_message: sub.renewal_message,
      payment_failure_reason: sub.grace?.payment_failure_reason,
      subtotal: subtotal,
      gst: gst,
      total_amount: totalAmount,
      grace_amount_due: graceAmountDue,
      grace_days_remaining: graceDaysRemaining,
      actions: {
        can_cancel_auto_renew: canCancel,
        can_pay_manually: sub.actions?.can_pay_manually ?? false,
        can_update_payment_method: sub.actions?.can_update_payment_method ?? false,
        can_purchase: sub.actions?.can_purchase ?? true,
        ...(sub.actions || {})
      },
      is_first_purchase: false
    };
  }

  get hasActiveSubscription(): boolean {
    return this.activeSubscriptions.some(s => s.status === 'Active' || s.status === 'Grace Period') ||
           (!!this.currentSubscription && (this.currentSubscription.status === 'Active' || this.currentSubscription.status === 'Grace Period'));
  }

  get isAnyGracePeriod(): boolean {
    return this.activeSubscriptions.some(s => s.status === 'Grace Period') ||
           (!!this.currentSubscription && this.currentSubscription.status === 'Grace Period');
  }

  get graceSubscription(): any {
    return this.activeSubscriptions.find(s => s.status === 'Grace Period') || 
           (this.currentSubscription?.status === 'Grace Period' ? this.currentSubscription : null);
  }

  get isAnyAutoRenewalEnabled(): boolean {
    return this.activeSubscriptions.some(s => (s.status === 'Active' || s.status === 'Grace Period') && s.auto_renewal === 'Enabled') ||
           (!!this.currentSubscription && (this.currentSubscription.status === 'Active' || this.currentSubscription.status === 'Grace Period') && this.currentSubscription.auto_renewal === 'Enabled');
  }

  get isExpired(): boolean {
    return !this.hasActiveSubscription && (
      this.activeSubscriptions.some(s => s.status === 'Expired') ||
      (!!this.currentSubscription && this.currentSubscription.status === 'Expired')
    );
  }

  get activePlanIds(): Set<number> {
    const ids = new Set<number>();
    for (const sub of this.activeSubscriptions) {
      if (sub.status === 'Active' || sub.status === 'Grace Period') {
        if (Array.isArray(sub.plans)) {
          for (const p of sub.plans) {
            const pid = Number(p.plan_id || p.id);
            if (pid) ids.add(pid);
          }
        }
      }
    }
    if (ids.size === 0 && this.currentSubscription && (this.currentSubscription.status === 'Active' || this.currentSubscription.status === 'Grace Period')) {
      if (Array.isArray(this.currentSubscription.plans)) {
        for (const p of this.currentSubscription.plans) {
          const pid = Number(p.plan_id || p.id);
          if (pid) ids.add(pid);
        }
      }
    }
    return ids;
  }

  isPlanActive(planId: any): boolean {
    return this.activePlanIds.has(Number(planId));
  }

  get totalActivePlansCount(): number {
    return this.activePlanIds.size;
  }

  get canPurchaseMorePlans(): boolean {
    if (this.currentSubscription?.actions?.can_purchase === false) {
      return false;
    }
    return this.totalActivePlansCount < 2;
  }

  get availableCategories(): string[] {
    const cats = new Set<string>();
    this.plans.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }

  getPlanIcon(text: string = ''): string {
    const val = (text || '').toLowerCase();
    if (val.includes('two') || val.includes('2') || val.includes('bike') || val.includes('motorcycle')) {
      return 'fa-motorcycle';
    }
    if (val.includes('four') || val.includes('4') || val.includes('car')) {
      return 'fa-car';
    }
    if (val.includes('commercial') || val.includes('truck') || val.includes('heavy')) {
      return 'fa-truck';
    }
    return 'fa-wrench';
  }

  /**
   * BR-04 & BR-07: Plan Selection & Cross-Category Restriction
   * - Max 2 plans allowed.
   * - Must belong to the SAME vehicle category.
   * - Cross-category combinations are NOT permitted.
   */
  togglePlan(plan: any) {
    const planId = Number(plan.id);

    // If plan is already subscribed and active
    if (this.isPlanActive(planId)) {
      this.notificationService.show('You already have an active subscription for this plan.', 'info');
      return;
    }

    // If maximum active plans reached overall
    if (this.totalActivePlansCount >= 2 && !this.selectedPlans.has(planId)) {
      this.notificationService.show('You already have the maximum of 2 active plans.', 'info');
      return;
    }

    if (this.currentSubscription?.actions?.can_purchase === false && !this.selectedPlans.has(planId)) {
      this.notificationService.show('You already have the maximum active subscriptions allowed.', 'info');
      return;
    }

    // If already selected, deselect it
    if (this.selectedPlans.has(planId)) {
      this.selectedPlans.delete(planId);
      return;
    }

    // Check category against existing active subscription
    const existingActiveCategory = this.activeSubscriptions[0]?.vehicle_category || this.currentSubscription?.vehicle_category;
    if (existingActiveCategory && plan.category && existingActiveCategory.toLowerCase() !== plan.category.toLowerCase()) {
      this.notificationService.show(
        `Cross-category combinations are not permitted. Your active plan is in ${existingActiveCategory} (BR-07).`,
        'error'
      );
      return;
    }

    // Check max selected plans limit (active plans count + selected plans size cannot exceed 2)
    if (this.totalActivePlansCount + this.selectedPlans.size >= 2) {
      this.notificationService.show(
        'You can select a maximum of 2 plans in total (BR-04).',
        'error'
      );
      return;
    }

    // Check if another plan is already selected in current selection
    if (this.selectedPlans.size > 0) {
      const selectedPlanObjects = this.plans.filter(p => this.selectedPlans.has(p.id));
      const existingCategory = selectedPlanObjects[0]?.category;

      // BR-07: Cross-Category Restriction
      if (existingCategory && existingCategory !== plan.category) {
        this.selectedPlans.clear();
        this.selectedPlans.add(planId);
        this.notificationService.show(
          `Switched to ${plan.category} plans. Cross-category combinations are not permitted (BR-07).`,
          'info'
        );
        return;
      }
    }

    this.selectedPlans.add(planId);
  }

  isSelected(planId: any): boolean {
    return this.selectedPlans.has(Number(planId));
  }

  get selectedPlansList(): any[] {
    return this.plans.filter(p => this.selectedPlans.has(Number(p.id)));
  }

  get subtotal(): number {
    return this.selectedPlansList.reduce((sum, p) => sum + (Number(p.amount) || Number(p.price) || 0), 0);
  }

  get gstAmount(): number {
    return this.selectedPlansList.reduce((sum, p) => sum + (Number(p.gst) || 0), 0);
  }

  get totalAmount(): number {
    return this.selectedPlansList.reduce((sum, p) => sum + (Number(p.final_amount) || (Number(p.amount) + Number(p.gst)) || 0), 0);
  }

  // --- Purchase & Activation Flow (UC-04) ---
  openModal() {
    if (this.selectedPlans.size > 0) {
      this.showExecutiveModal = true;
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    this.showExecutiveModal = false;
    document.body.style.overflow = 'auto';
    this.executiveCode = '';
  }

  selectPaymentMethod(method: 'card' | 'qr') {
    this.selectedPaymentMethod = method;
  }

  subscribe(withCode: boolean) {
    if (this.selectedPlans.size === 0) return;
    this.isSubmitting = true;
    const planIds = Array.from(this.selectedPlans);
    const mandateMethod = this.selectedPaymentMethod === 'qr' ? 'upi' : 'card';
    const payload: any = { 
      plan_ids: planIds,
      mandate_method: mandateMethod 
    };
    if (planIds.length === 1) {
      payload.plan_id = planIds[0];
    }
    if (withCode && this.executiveCode.trim()) {
      payload.executive_code = this.executiveCode.trim();
    }

    this.customerService.subscriptionCheckout(payload).subscribe({
      next: (res: any) => {
        const paymentId = res?.data?.payment_id;
        const rzpData = res?.data?.razorpay;

        if (rzpData && (rzpData.subscription_id || rzpData.order_id) && rzpData.key) {
          this.razorpayService.pay({
            ...rzpData
          })
            .then((rzpSuccess: RazorpaySuccessResponse) => {
              this.closeModal();
              this.isVerifyingPayment = true;
              this.isSubmitting = true;

              const verifyPayload: any = {
                payment_id: paymentId,
                razorpay_payment_id: rzpSuccess.razorpay_payment_id,
                razorpay_signature: rzpSuccess.razorpay_signature
              };
              if (rzpSuccess.razorpay_subscription_id || rzpData.subscription_id) {
                verifyPayload.razorpay_subscription_id = rzpSuccess.razorpay_subscription_id || rzpData.subscription_id;
              }
              if (rzpSuccess.razorpay_order_id || rzpData.order_id) {
                verifyPayload.razorpay_order_id = rzpSuccess.razorpay_order_id || rzpData.order_id;
              }

              this.customerService.verifySubscriptionPayment(verifyPayload).subscribe({
                next: (verifyRes: any) => {
                  this.isVerifyingPayment = false;
                  this.isSubmitting = false;
                  this.selectedPlans.clear();
                  const msg = verifyRes?.message || 'Subscription activated successfully!';
                  this.notificationService.show(msg, 'success');
                  this.fetchData();
                },
                error: (verifyErr: any) => {
                  this.isVerifyingPayment = false;
                  this.isSubmitting = false;
                  console.error('Payment verification failed:', verifyErr);
                  const errMsg = verifyErr?.message || verifyErr?.error?.message || 'Payment verification failed.';
                  this.notificationService.show(errMsg, 'error');
                }
              });
            })
            .catch((rzpErr: any) => {
              this.isVerifyingPayment = false;
              this.isSubmitting = false;
              if (paymentId) {
                this.customerService.cancelSubscriptionPayment(paymentId).subscribe({
                  next: () => {},
                  error: () => {}
                });
              }
              if (rzpErr?.dismissed) {
                this.notificationService.show('Payment cancelled.', 'info');
              } else {
                const errMsg = rzpErr?.description || rzpErr?.message || 'Payment failed.';
                this.notificationService.show(errMsg, 'error');
              }
            });
          return;
        }

        const redirectUrl = res?.data?.payment_url || res?.data?.url || res?.data?.short_url;
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }

        this.isSubmitting = false;
        this.closeModal();
        this.selectedPlans.clear();
        this.fetchData();
        this.notificationService.show(res?.message || 'Subscription activated successfully!', 'success');
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Subscription checkout failed:', err);
        const errMsg = err?.message || err?.error?.message || 'Failed to initiate checkout. Please try again.';
        this.notificationService.show(errMsg, 'error');
      }
    });
  }

  closeSuccessModal() {
    this.showSuccessReceiptModal = false;
    document.body.style.overflow = 'auto';
  }

  // --- Auto-Renewal Cancellation Flow (UC-06) ---
  openCancelRenewalModal(sub?: any) {
    this.selectedSubToCancel = sub || this.currentSubscription;
    this.showCancelRenewalModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeCancelRenewalModal() {
    this.showCancelRenewalModal = false;
    this.selectedSubToCancel = null;
    document.body.style.overflow = 'auto';
  }

  confirmCancelAutoRenewal() {
    const targetSub = this.selectedSubToCancel || this.currentSubscription;
    if (!targetSub) return;

    this.isSubmitting = true;
    const payload: any = {};
    if (targetSub.subscription_id) {
      payload.subscription_id = targetSub.subscription_id;
    }
    if (targetSub.subscription_number) {
      payload.subscription_number = targetSub.subscription_number;
    }

    this.customerService.cancelAutoRenewal(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.closeCancelRenewalModal();

        targetSub.auto_renewal = 'Disabled';
        if (targetSub.actions) {
          targetSub.actions.can_cancel_auto_renew = false;
        }

        // Refresh actual data from API
        this.fetchData();

        const msg = res?.message || 'Auto-Renewal has been disabled. Your subscription remains active with full access until the current period ends.';
        this.notificationService.show(msg, 'success');
      },
      error: (err: any) => {
        this.isSubmitting = false;
        const errMsg = err?.message || err?.error?.message || 'Failed to cancel auto-renewal. Please try again.';
        this.notificationService.show(errMsg, 'error');
      }
    });
  }

  enableAutoRenewal() {
    if (!this.currentSubscription) return;

    this.currentSubscription.auto_renewal = 'Enabled';
    this.notificationService.show('Auto-Renewal has been re-enabled for your subscription.', 'success');
  }

  // --- Grace Period & Manual Payment Recovery (UC-08) ---
  openGracePayModal() {
    this.showGracePayModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeGracePayModal() {
    this.showGracePayModal = false;
    document.body.style.overflow = 'auto';
  }

  processGraceManualPayment() {
    this.isSubmitting = true;
    const mandateMethod = this.selectedPaymentMethod === 'qr' ? 'upi' : 'card';

    this.customerService.renewalCheckout({ mandate_method: mandateMethod }).subscribe({
      next: (res: any) => {
        const paymentId = res?.data?.payment_id;
        const rzpData = res?.data?.razorpay;

        if (rzpData && (rzpData.subscription_id || rzpData.order_id) && rzpData.key) {
          this.razorpayService.pay({
            ...rzpData
          })
            .then((rzpSuccess: RazorpaySuccessResponse) => {
              this.closeGracePayModal();
              this.isVerifyingPayment = true;
              this.isSubmitting = true;

              // Payment completed in Razorpay popup! Verify signature with backend
              const verifyPayload: any = {
                payment_id: paymentId,
                razorpay_payment_id: rzpSuccess.razorpay_payment_id,
                razorpay_signature: rzpSuccess.razorpay_signature
              };
              if (rzpSuccess.razorpay_subscription_id || rzpData.subscription_id) {
                verifyPayload.razorpay_subscription_id = rzpSuccess.razorpay_subscription_id || rzpData.subscription_id;
              }
              if (rzpSuccess.razorpay_order_id || rzpData.order_id) {
                verifyPayload.razorpay_order_id = rzpSuccess.razorpay_order_id || rzpData.order_id;
              }

              this.customerService.verifySubscriptionPayment(verifyPayload).subscribe({
                next: (verifyRes: any) => {
                  this.isVerifyingPayment = false;
                  this.isSubmitting = false;
                  const msg = verifyRes?.message || 'Renewal payment verified and subscription activated successfully!';
                  this.notificationService.show(msg, 'success');
                  this.fetchData();
                },
                error: (verifyErr: any) => {
                  this.isVerifyingPayment = false;
                  this.isSubmitting = false;
                  console.error('Payment verification failed:', verifyErr);
                  const errMsg = verifyErr?.message || verifyErr?.error?.message || 'Payment verification failed. Please contact support with payment ID: ' + rzpSuccess.razorpay_payment_id;
                  this.notificationService.show(errMsg, 'error');
                }
              });
            })
            .catch((rzpErr: any) => {
              this.isVerifyingPayment = false;
              this.isSubmitting = false;
              // Notify backend that this payment was cancelled/dismissed
              if (paymentId) {
                this.customerService.cancelSubscriptionPayment(paymentId).subscribe({
                  next: () => {},
                  error: (e: any) => console.warn('Cancel payment call failed:', e)
                });
              }

              if (rzpErr?.dismissed) {
                this.notificationService.show('Payment cancelled. You can retry when ready.', 'info');
              } else {
                console.error('Razorpay payment error:', rzpErr);
                const errMsg = rzpErr?.description || rzpErr?.message || 'Payment failed. Please try again.';
                this.notificationService.show(errMsg, 'error');
              }
            });
          return;
        }

        // If backend response contains gateway redirect link
        const redirectUrl = res?.data?.payment_url || res?.data?.url || res?.data?.short_url;
        if (redirectUrl) {
          this.isSubmitting = false;
          window.location.href = redirectUrl;
          return;
        }

        // Fallback for direct success
        this.isSubmitting = false;
        this.closeGracePayModal();
        this.fetchData();
        const msg = res?.message || 'Renewal payment processed successfully!';
        this.notificationService.show(msg, 'success');
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Renewal checkout failed:', err);
        const errMsg = err?.message || err?.error?.message || 'Failed to initiate renewal checkout. Please try again.';
        this.notificationService.show(errMsg, 'error');
      }
    });
  }

  scrollToPlans() {
    window.scrollTo({ top: 350, behavior: 'smooth' });
  }

  // --- History Detail Modal Handlers ---
  openHistoryDetailModal(item: any) {
    this.selectedHistoryItem = item;
    this.showHistoryDetailModal = true;
    try {
      document.body.style.overflow = 'hidden';
    } catch (e) {}
  }

  closeHistoryDetailModal() {
    this.showHistoryDetailModal = false;
    this.selectedHistoryItem = null;
    try {
      document.body.style.overflow = 'auto';
    } catch (e) {}
  }

  copyToClipboard(text: string) {
    if (!text) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.copiedTxn = true;
        this.notificationService.show('Transaction ID copied to clipboard', 'success');
        setTimeout(() => this.copiedTxn = false, 2000);
      }).catch(() => {
        this.fallbackCopy(text);
      });
    } else {
      this.fallbackCopy(text);
    }
  }

  private fallbackCopy(text: string) {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.copiedTxn = true;
      this.notificationService.show('Copied to clipboard', 'success');
      setTimeout(() => this.copiedTxn = false, 2000);
    } catch (e) {
      this.notificationService.show(text, 'info');
    }
  }
}
