import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseQuotationsComponent } from './purchase-quotations.component';

describe('PurchaseQuotationsComponent', () => {
  let component: PurchaseQuotationsComponent;
  let fixture: ComponentFixture<PurchaseQuotationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseQuotationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseQuotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
