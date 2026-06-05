import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingBillIntegration } from './pending-bill-integration';

describe('PendingBillIntegration', () => {
  let component: PendingBillIntegration;
  let fixture: ComponentFixture<PendingBillIntegration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingBillIntegration],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingBillIntegration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
