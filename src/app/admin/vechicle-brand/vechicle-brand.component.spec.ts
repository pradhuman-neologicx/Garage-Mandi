import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VechicleBrandComponent } from './vechicle-brand.component';

describe('VechicleBrandComponent', () => {
  let component: VechicleBrandComponent;
  let fixture: ComponentFixture<VechicleBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VechicleBrandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VechicleBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
