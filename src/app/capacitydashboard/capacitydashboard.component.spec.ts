import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacitydashboardComponent } from './capacitydashboard.component';

describe('CapacitydashboardComponent', () => {
  let component: CapacitydashboardComponent;
  let fixture: ComponentFixture<CapacitydashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CapacitydashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CapacitydashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
