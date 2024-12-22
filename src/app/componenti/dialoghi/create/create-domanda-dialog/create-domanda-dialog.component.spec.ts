import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDomandaDialogComponent } from './create-domanda-dialog.component';

describe('CreateDomandaDialogComponent', () => {
  let component: CreateDomandaDialogComponent;
  let fixture: ComponentFixture<CreateDomandaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDomandaDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDomandaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
