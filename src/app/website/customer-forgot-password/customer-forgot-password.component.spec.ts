import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerForgotPasswordComponent } from './customer-forgot-password.component';

describe('CustomerForgotPasswordComponent', () => {
  let component: CustomerForgotPasswordComponent;
  let fixture: ComponentFixture<CustomerForgotPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerForgotPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
