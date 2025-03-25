import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationRequestListComponent } from './registration-request-list.component';

describe('RegistrationRequestListComponent', () => {
  let component: RegistrationRequestListComponent;
  let fixture: ComponentFixture<RegistrationRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationRequestListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
