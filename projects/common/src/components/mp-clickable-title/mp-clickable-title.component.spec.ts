import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpClickableTitleComponent } from './mp-clickable-title.component';

describe('MpClickableTitleComponent', () => {
  let component: MpClickableTitleComponent;
  let fixture: ComponentFixture<MpClickableTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MpClickableTitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MpClickableTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
