import { NavBarService } from '@Common';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  let router: Router;
  let events$: Subject<unknown>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [
        { provide: NavBarService, useValue: mockDeep<NavBarService>() },
        { provide: ActivatedRoute, useValue: mockDeep<ActivatedRoute>() },
        { provide: Router, useValue: mockDeep<Router>() },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    router = TestBed.inject(Router);

    // Mock router.events BEFORE component creation
    events$ = new Subject<unknown>();
    Object.defineProperty(router, 'url', {
      configurable: true,
      get: () => '/',
    });
    Object.defineProperty(router, 'events', { get: () => events$ });

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the app', () => {
    // AAA
    expect(app).toBeTruthy();
  });

  it('should set isIndexPage to true if url is /', () => {
    // Arrange
    events$.next(new NavigationEnd(1, '/dashboard', '/'));
    fixture.detectChanges();

    // Act
    const result = app.isIndexPage();

    // Assert
    expect(result).toBe(true);
  });

  it('should set isIndexPage to false if url is not /', () => {
    // Arrange
    Object.defineProperty(router, 'url', {
      configurable: true,
      get: () => '/dashboard',
    });

    events$.next(new NavigationEnd(1, '/', '/dashboard'));
    fixture.detectChanges();

    // Act
    const result = app.isIndexPage();

    // Assert
    expect(result).toBe(false);
  });
});
