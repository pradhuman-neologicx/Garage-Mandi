import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EcomService } from '../../core/services/ecom.service';
import { NotificationService } from '../../core/services/notificationnew.service';

export interface PlatformFeeData {
  percent: string | number;
  flat: string | number;
  updated_by?: string | null;
  updated_at?: string | null;
}

@Component({
  selector: 'app-commission',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './commission.component.html',
  styleUrl: './commission.component.scss'
})
export class CommissionComponent implements OnInit {
  isLoading: boolean = false;
  isSaving: boolean = false;

  platformFeeData: PlatformFeeData = {
    percent: '0.00',
    flat: '0.00',
    updated_by: null,
    updated_at: null
  };

  feeForm!: FormGroup;

  // Interactive calculator sample amount
  sampleAmount: number = 5000;

  constructor(
    private fb: FormBuilder,
    private ecomService: EcomService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getPlatformFee();
  }

  private initForm(): void {
    this.feeForm = this.fb.group({
      percent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      flat: [0, [Validators.required, Validators.min(0)]]
    });
  }

  getPlatformFee(): void {
    this.isLoading = true;
    this.ecomService.GetPlatformFee().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.data) {
          this.platformFeeData = res.data;
          this.feeForm.patchValue({
            percent: parseFloat(String(res.data.percent ?? 0)),
            flat: parseFloat(String(res.data.flat ?? 0))
          });
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.message || 'Failed to fetch platform fee configuration.';
        this.notificationService.show(msg, 'error', 3000);
      }
    });
  }

  updatePlatformFee(): void {
    if (this.feeForm.invalid) {
      this.feeForm.markAllAsTouched();
      this.notificationService.show('Please enter valid fee values (percent 0-100%, flat min 0).', 'error', 3000);
      return;
    }

    const val = this.feeForm.value;
    const payload = {
      percent: Number(val.percent),
      flat: Number(val.flat)
    };

    this.isSaving = true;
    this.ecomService.UpdatePlatformFee(payload).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        const successMsg = res?.message || 'Platform fee configuration updated successfully.';
        this.notificationService.show(successMsg, 'success', 3000);
        if (res && res.data) {
          this.platformFeeData = res.data;
        } else {
          this.getPlatformFee();
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        const errorMsg = err?.error?.message || err?.message || 'Failed to update platform fee.';
        this.notificationService.show(errorMsg, 'error', 3000);
      }
    });
  }

  resetForm(): void {
    this.feeForm.patchValue({
      percent: parseFloat(String(this.platformFeeData.percent ?? 0)),
      flat: parseFloat(String(this.platformFeeData.flat ?? 0))
    });
    this.notificationService.show('Form values reset to active settings.', 'info', 2000);
  }

  // Live calculator helpers
  get previewPercentFee(): number {
    const p = Number(this.feeForm?.get('percent')?.value || 0);
    return Math.round(((this.sampleAmount * p) / 100) * 100) / 100;
  }

  get previewFlatFee(): number {
    return Number(this.feeForm?.get('flat')?.value || 0);
  }

  get previewTotalFee(): number {
    return Math.round((this.previewPercentFee + this.previewFlatFee) * 100) / 100;
  }

  get previewFinalTotal(): number {
    return Math.round((this.sampleAmount + this.previewTotalFee) * 100) / 100;
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'Not updated yet';
    try {
      return new Date(dateStr).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return dateStr;
    }
  }
}
