import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestSparePartComponent } from './request-spare-part.component';

describe('RequestSparePartComponent', () => {
  let component: RequestSparePartComponent;
  let fixture: ComponentFixture<RequestSparePartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestSparePartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestSparePartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
