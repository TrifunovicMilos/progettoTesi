import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDocenteComponent } from './report-docente.component';

describe('ReportDocenteComponent', () => {
  let component: ReportDocenteComponent;
  let fixture: ComponentFixture<ReportDocenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDocenteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportDocenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
