import { HttpResponse } from '@angular/common/http';

export function downloadFileFromResponse(
  response: HttpResponse<unknown>,
  defaultFileName: string = 'download.file',
) {
  const blob = response.body as Blob;

  let fileName = defaultFileName;
  const contentDisposition = response.headers?.get('Content-Disposition');
  if (contentDisposition) {
    const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
      contentDisposition,
    );
    if (match && match[1]) {
      fileName = decodeURIComponent(match[1].replace(/['"]/g, ''));
    }
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
