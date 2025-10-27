import { environment } from '@Common';
import { NotificationService } from '@Notification';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const notificationServiceMock = {
      getNotifications: jest.fn().mockReturnValue(of([])),
    } as unknown as jest.Mocked<NotificationService>;

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: NotificationService,
          useValue: notificationServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    notificationService = TestBed.inject(NotificationService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call NotificationService.getNotifications on init', () => {
    expect(notificationService.getNotifications).toHaveBeenCalledTimes(1);
  });

  it('should render the Looker Studio iframe', () => {
    // Arrange

    // Act
    const iframe: HTMLIFrameElement | null =
      fixture.nativeElement.querySelector('iframe');

    // Assert
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain(environment.lookerUrl);
  });
});
