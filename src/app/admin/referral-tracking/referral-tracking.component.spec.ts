import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralTrackingComponent } from './referral-tracking.component';

describe('ReferralTrackingComponent', () => {
  let component: ReferralTrackingComponent;
  let fixture: ComponentFixture<ReferralTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferralTrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferralTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
