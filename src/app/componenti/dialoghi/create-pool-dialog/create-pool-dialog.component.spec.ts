import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePoolDialogComponent } from './create-pool-dialog.component';

describe('CreatePoolDialogComponent', () => {
  let component: CreatePoolDialogComponent;
  let fixture: ComponentFixture<CreatePoolDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePoolDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePoolDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
