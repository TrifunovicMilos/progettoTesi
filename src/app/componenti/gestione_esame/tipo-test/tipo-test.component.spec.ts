import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoTestComponent } from './tipo-test.component';

describe('TipoTestComponent', () => {
  let component: TipoTestComponent;
  let fixture: ComponentFixture<TipoTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
