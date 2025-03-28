import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpSubtitleComponent } from './mp-subtitle.component';

describe('MpSubtitleComponent', () => {
  let component: MpSubtitleComponent;
  let fixture: ComponentFixture<MpSubtitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MpSubtitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MpSubtitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
