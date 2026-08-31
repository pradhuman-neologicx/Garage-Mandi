import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessCategoriesComponent } from './business-categories.component';

describe('BusinessCategoriesComponent', () => {
  let component: BusinessCategoriesComponent;
  let fixture: ComponentFixture<BusinessCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
