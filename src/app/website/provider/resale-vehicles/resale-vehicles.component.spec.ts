import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResaleVehiclesComponent } from './resale-vehicles.component';

describe('ResaleVehiclesComponent', () => {
  let component: ResaleVehiclesComponent;
  let fixture: ComponentFixture<ResaleVehiclesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResaleVehiclesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResaleVehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
