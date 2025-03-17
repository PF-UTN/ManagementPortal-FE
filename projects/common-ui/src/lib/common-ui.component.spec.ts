import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonUiComponent } from './common-ui.component';

describe('CommonUiComponent', () => {
  let component: CommonUiComponent;
  let fixture: ComponentFixture<CommonUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonUiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommonUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
