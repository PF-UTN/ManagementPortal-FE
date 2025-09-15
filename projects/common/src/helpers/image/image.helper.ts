import { Observable } from 'rxjs';

/**
 * Fetch a file from a URL and convert it to a File object
 * @param url The file URL
 * @param filename Optional filename (defaults to last part of URL)
 * @param mimeType Optional mime type (will try to infer from response)
 * @returns Observable<File>
 */
export function fetchFileFromUrl$(
  url: string,
  filename?: string,
  mimeType?: string,
): Observable<File> {
  return new Observable<File>((observer) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const name = filename ?? url.split('/').pop() ?? 'file';
        const type = mimeType ?? blob.type ?? 'application/octet-stream';
        const file = new File([blob], name, { type });
        observer.next(file);
        observer.complete();
      })
      .catch((err) => observer.error(err));
  });
}
