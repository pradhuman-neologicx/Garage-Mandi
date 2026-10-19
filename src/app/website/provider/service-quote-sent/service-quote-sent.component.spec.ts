import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceQuoteSentComponent } from './service-quote-sent.component';

describe('ServiceQuoteSentComponent', () => {
  let component: ServiceQuoteSentComponent;
  let fixture: ComponentFixture<ServiceQuoteSentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceQuoteSentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceQuoteSentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
