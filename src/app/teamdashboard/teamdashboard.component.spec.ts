import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamdashboardComponent } from './teamdashboard.component';

describe('TeamdashboardComponent', () => {
  let component: TeamdashboardComponent;
  let fixture: ComponentFixture<TeamdashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamdashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
