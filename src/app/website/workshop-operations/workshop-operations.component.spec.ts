import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopOperationsComponent } from './workshop-operations.component';

describe('WorkshopOperationsComponent', () => {
  let component: WorkshopOperationsComponent;
  let fixture: ComponentFixture<WorkshopOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkshopOperationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkshopOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
