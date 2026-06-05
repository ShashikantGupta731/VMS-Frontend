import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OdometerCorrection } from './odometer-correction';

describe('OdometerCorrection', () => {
  let component: OdometerCorrection;
  let fixture: ComponentFixture<OdometerCorrection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OdometerCorrection],
    }).compileComponents();

    fixture = TestBed.createComponent(OdometerCorrection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
