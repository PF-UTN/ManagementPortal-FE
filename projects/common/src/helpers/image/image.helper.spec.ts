import { take } from 'rxjs/operators';

import { fetchFileFromUrl$ } from './image.helper';

describe('fetchFileFromUrl$', () => {
  let mockBlob: Blob;

  beforeAll(() => {
    mockBlob = new Blob(['test content'], { type: 'text/plain' });
  });

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      blob: jest.fn().mockResolvedValue(mockBlob),
    } as unknown as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch the file and return a File object with default filename and type', (done) => {
    fetchFileFromUrl$('http://example.com/file.txt')
      .pipe(take(1))
      .subscribe({
        next: (file) => {
          expect(file).toBeInstanceOf(File);
          expect(file.name).toBe('file.txt');
          expect(file.type).toBe('text/plain');
        },
        error: done.fail,
        complete: done,
      });
  });

  it('should use the provided filename', (done) => {
    fetchFileFromUrl$('http://example.com/file.txt', 'custom-name.txt')
      .pipe(take(1))
      .subscribe({
        next: (file) => {
          expect(file.name).toBe('custom-name.txt');
        },
        error: done.fail,
        complete: done,
      });
  });

  it('should use the provided mimeType', (done) => {
    fetchFileFromUrl$(
      'http://example.com/file.txt',
      undefined,
      'application/json',
    )
      .pipe(take(1))
      .subscribe({
        next: (file) => {
          expect(file.type).toBe('application/json');
        },
        error: done.fail,
        complete: done,
      });
  });

  it('should emit an error if fetch fails', (done) => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error'),
    );

    fetchFileFromUrl$('http://example.com/file.txt')
      .pipe(take(1))
      .subscribe({
        next: () => done.fail('Expected error'),
        error: (err) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe('Network error');
          done();
        },
        complete: () => done.fail('Expected error'),
      });
  });

  it('should infer filename as "file" if URL has no path', (done) => {
    fetchFileFromUrl$('http://example.com')
      .pipe(take(1))
      .subscribe({
        next: (file) => {
          expect(file.name).toBe('file');
        },
        error: done.fail,
        complete: done,
      });
  });
});
