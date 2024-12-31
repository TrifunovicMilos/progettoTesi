import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressiStudenteComponent } from './progressi-studente.component';

describe('ProgressiStudenteComponent', () => {
  let component: ProgressiStudenteComponent;
  let fixture: ComponentFixture<ProgressiStudenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressiStudenteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressiStudenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
