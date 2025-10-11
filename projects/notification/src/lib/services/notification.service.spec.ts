import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { NotificationService } from './notification.service';
import { mockNotifications } from '../testing/mock-data';

const baseUrl = 'https://dev-management-portal-be.vercel.app/notification';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNotifications', () => {
    it('should send a GET request and return notifications', () => {
      service.getNotifications().subscribe((response) => {
        expect(response).toEqual(mockNotifications);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockNotifications);
    });

    it('should handle HTTP errors', () => {
      const mockError = new ErrorEvent('Network error');

      service.getNotifications().subscribe({
        next: () => fail('Expected an error, but got a successful response'),
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.error(mockError);
    });
  });

  describe('markAsViewed', () => {
    it('should send a PATCH request and refresh notifications', () => {
      const notificationId = 1;
      service.markAsViewed(notificationId).subscribe((response) => {
        expect(response).toEqual(mockNotifications);
      });

      const reqPatch = httpMock.expectOne(
        `${baseUrl}/${notificationId}/mark-as-viewed`,
      );
      expect(reqPatch.request.method).toBe('PATCH');
      expect(reqPatch.request.body).toEqual({});
      reqPatch.flush({});

      const reqGet = httpMock.expectOne(baseUrl);
      expect(reqGet.request.method).toBe('GET');
      reqGet.flush(mockNotifications);
    });

    it('should handle HTTP errors', () => {
      const notificationId = 1;
      const mockError = new ErrorEvent('Network error');

      service.markAsViewed(notificationId).subscribe({
        next: () => fail('Expected an error, but got a successful response'),
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });

      const reqPatch = httpMock.expectOne(
        `${baseUrl}/${notificationId}/mark-as-viewed`,
      );
      expect(reqPatch.request.method).toBe('PATCH');
      reqPatch.error(mockError);
    });
  });

  describe('markAllAsViewed', () => {
    it('should send a PATCH request and refresh notifications', () => {
      service.markAllAsViewed().subscribe((response) => {
        expect(response).toEqual(mockNotifications);
      });

      const reqPatch = httpMock.expectOne(`${baseUrl}/mark-all-as-viewed`);
      expect(reqPatch.request.method).toBe('PATCH');
      expect(reqPatch.request.body).toEqual({});
      reqPatch.flush({});

      const reqGet = httpMock.expectOne(baseUrl);
      expect(reqGet.request.method).toBe('GET');
      reqGet.flush(mockNotifications);
    });

    it('should handle HTTP errors', () => {
      const mockError = new ErrorEvent('Network error');

      service.markAllAsViewed().subscribe({
        next: () => fail('Expected an error, but got a successful response'),
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });

      const reqPatch = httpMock.expectOne(`${baseUrl}/mark-all-as-viewed`);
      expect(reqPatch.request.method).toBe('PATCH');
      reqPatch.error(mockError);
    });
  });

  describe('deleteNotification', () => {
    it('should send a DELETE request and refresh notifications', () => {
      const notificationId = 1;
      service.deleteNotification(notificationId).subscribe((response) => {
        expect(response).toEqual(mockNotifications);
      });

      const reqDelete = httpMock.expectOne(`${baseUrl}/${notificationId}`);
      expect(reqDelete.request.method).toBe('DELETE');
      expect(reqDelete.request.body).toBeNull();
      reqDelete.flush({});

      const reqGet = httpMock.expectOne(baseUrl);
      expect(reqGet.request.method).toBe('GET');
      reqGet.flush(mockNotifications);
    });

    it('should handle HTTP errors', () => {
      const notificationId = 1;
      const mockError = new ErrorEvent('Network error');

      service.deleteNotification(notificationId).subscribe({
        next: () => fail('Expected an error, but got a successful response'),
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });

      const reqDelete = httpMock.expectOne(`${baseUrl}/${notificationId}`);
      expect(reqDelete.request.method).toBe('DELETE');
      reqDelete.error(mockError);
    });
  });
});
