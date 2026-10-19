import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomeVehicleRequestsComponent } from './custome-vehicle-requests.component';

describe('CustomeVehicleRequestsComponent', () => {
  let component: CustomeVehicleRequestsComponent;
  let fixture: ComponentFixture<CustomeVehicleRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomeVehicleRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomeVehicleRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
