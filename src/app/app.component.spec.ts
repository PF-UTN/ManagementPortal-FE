import { NavBarService } from '@Common';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: NavBarService, useValue: mockDeep<NavBarService>() },
        { provide: ActivatedRoute, useValue: mockDeep<ActivatedRoute>() },
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
