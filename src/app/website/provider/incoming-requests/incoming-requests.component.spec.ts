import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingRequestsComponent } from './incoming-requests.component';

describe('IncomingRequestsComponent', () => {
  let component: IncomingRequestsComponent;
  let fixture: ComponentFixture<IncomingRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomingRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomingRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
