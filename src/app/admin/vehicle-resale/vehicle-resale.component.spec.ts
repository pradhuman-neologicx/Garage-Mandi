import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleResaleComponent } from './vehicle-resale.component';

describe('VehicleResaleComponent', () => {
  let component: VehicleResaleComponent;
  let fixture: ComponentFixture<VehicleResaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VehicleResaleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleResaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
