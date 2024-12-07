import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsameNegatoComponent } from './esame-negato.component';

describe('EsameNegatoComponent', () => {
  let component: EsameNegatoComponent;
  let fixture: ComponentFixture<EsameNegatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EsameNegatoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EsameNegatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
