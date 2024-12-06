import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateExamDialogComponent } from './create-exam-dialog.component';

describe('CreateExamDialogComponent', () => {
  let component: CreateExamDialogComponent;
  let fixture: ComponentFixture<CreateExamDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateExamDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateExamDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
