import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderSubscriptionComponent } from './provider-subscription.component';

describe('ProviderSubscriptionComponent', () => {
  let component: ProviderSubscriptionComponent;
  let fixture: ComponentFixture<ProviderSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderSubscriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
