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
    const requestBody = { searchText: 'Ciudad', page: 1, pageSize: 1 };

    // Act
    service.searchTowns(requestBody).subscribe((response) => {
      expect(response.results.length).toBe(1);
      expect(response.results).toEqual(mockTowns);
    });

    // Assert
    const req = httpMock.expectOne(
      (req) => req.method === 'POST' && req.url.includes('town'),
    );

    expect(req.request.body.searchText).toBe('Ciudad');
    expect(req.request.body.page).toBe(1);
    expect(req.request.body.pageSize).toBe(1);

    req.flush({ total: 1, results: mockTowns });
  });
});
