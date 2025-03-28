import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpTitleComponent } from './mp-title.component';

describe('MpTitleComponent', () => {
  let component: MpTitleComponent;
  let fixture: ComponentFixture<MpTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MpTitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MpTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
