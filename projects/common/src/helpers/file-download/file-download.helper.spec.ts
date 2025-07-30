import { HttpResponse } from '@angular/common/http';

import { downloadFileFromResponse } from './file-download.helper';

function createMockHttpResponse(
  blob: Blob,
  headerValue: string | null = null,
): HttpResponse<Blob> {
  return {
    body: blob,
    headers: { get: () => headerValue } as unknown,
    status: 200,
    statusText: 'OK',
    url: '/mock',
    ok: true,
    type: 4,
    clone: function () {
      return this;
    },
  } as HttpResponse<Blob>;
}

describe('downloadFileFromResponse', () => {
  let anchorMock: HTMLAnchorElement;
  let downloadValue = '';

  beforeAll(() => {
    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: jest.fn(() => 'blob:url'),
        revokeObjectURL: jest.fn(),
      },
      writable: true,
    });
  });

  beforeEach(() => {
    downloadValue = '';

    anchorMock = {
      click: jest.fn(),
      remove: jest.fn(),
      set href(value: string) {},
      get download() {
        return downloadValue;
      },
      set download(value: string) {
        downloadValue = value;
      },
    } as unknown as HTMLAnchorElement;

    jest.spyOn(document.body, 'appendChild').mockImplementation();
    jest.spyOn(document, 'createElement').mockReturnValue(anchorMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when Content-Disposition header is missing', () => {
    it('should use the default filename', () => {
      // Arrange
      const response = createMockHttpResponse(new Blob(['test']), null);

      // Act
      downloadFileFromResponse(response, 'default.txt');

      // Assert
      expect(anchorMock.download).toBe('default.txt');
    });
  });

  describe('when Content-Disposition header includes a filename', () => {
    it('should use the provided filename', () => {
      // Arrange
      const response = createMockHttpResponse(
        new Blob(['test']),
        'attachment; filename="custom_name.csv"',
      );

      // Act
      downloadFileFromResponse(response, 'fallback.txt');

      // Assert
      expect(anchorMock.download).toBe('custom_name.csv');
    });
  });

  describe('when Content-Disposition contains URL encoded filename', () => {
    it('should decode and use the correct filename', () => {
      // Arrange
      const response = createMockHttpResponse(
        new Blob(['test']),
        'attachment; filename="solicitudes%20registro.xlsx"',
      );

      // Act
      downloadFileFromResponse(response, 'fallback.xlsx');

      // Assert
      expect(anchorMock.download).toBe('solicitudes registro.xlsx');
    });
  });

  describe('browser interactions', () => {
    it('should create an object URL', () => {
      // Arrange
      const response = createMockHttpResponse(new Blob(['test']));

      // Act
      downloadFileFromResponse(response, 'file.txt');

      // Assert
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should append the anchor to document.body', () => {
      // Arrange
      const response = createMockHttpResponse(new Blob(['test']));

      // Act
      downloadFileFromResponse(response, 'file.txt');

      // Assert
      expect(document.body.appendChild).toHaveBeenCalledWith(anchorMock);
    });

    it('should click the anchor to trigger download', () => {
      // Arrange
      const response = createMockHttpResponse(new Blob(['test']));

      // Act
      downloadFileFromResponse(response, 'file.txt');

      // Assert
      expect(anchorMock.click).toHaveBeenCalled();
    });

    it('should remove the anchor after clicking', () => {
      // Arrange
      const response = createMockHttpResponse(new Blob(['test']));

      // Act
      downloadFileFromResponse(response, 'file.txt');

      // Assert
      expect(anchorMock.remove).toHaveBeenCalled();
    });

    it('should revoke the created object URL', () => {
      // Arrange
      const response = createMockHttpResponse(new Blob(['test']));

      // Act
      downloadFileFromResponse(response, 'file.txt');

      // Assert
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
    });
  });
});
