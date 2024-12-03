import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IMieiEsamiComponent } from './i-miei-esami.component';

describe('IMieiEsamiComponent', () => {
  let component: IMieiEsamiComponent;
  let fixture: ComponentFixture<IMieiEsamiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IMieiEsamiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IMieiEsamiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
