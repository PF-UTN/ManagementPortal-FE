import { NavBarService } from '@Common';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [
        { provide: NavBarService, useValue: mockDeep<NavBarService>() },
        { provide: ActivatedRoute, useValue: mockDeep<ActivatedRoute>() },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    fixture = TestBed.createComponent(AppComponent);

    app = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the app', () => {
    //AAA
    expect(app).toBeTruthy();
  });
});
