import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the Looker Studio iframe', () => {
    // Arrange

    // Act
    const iframe: HTMLIFrameElement | null =
      fixture.nativeElement.querySelector('iframe');

    // Assert
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain(
      'https://lookerstudio.google.com/embed/reporting/7e884610-5c4b-465c-82c4-5b4c2eea7dd0/page/IphaF',
    );
  });
});
