import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';

import { TownService } from './town.service';
import { mockTown } from '../../testing/mock-data.model';

describe('TownService', () => {
  let service: TownService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TownService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockDeep<Router>() },
      ],
    });
    service = TestBed.inject(TownService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should search towns', () => {
    // Arrange
    const mockTowns = [mockTown];

    // Act
    service.searchTowns('Ciudad').subscribe((towns) => {
      expect(towns.length).toBe(1);
      expect(towns).toEqual(mockTowns);
    });

    // Assert
    const req = httpMock.expectOne(
      (req) => req.method === 'GET' && req.url.includes('towns'),
    );
    expect(req.request.params.get('search')).toBe('Ciudad');
    req.flush(mockTowns);
  });
});
