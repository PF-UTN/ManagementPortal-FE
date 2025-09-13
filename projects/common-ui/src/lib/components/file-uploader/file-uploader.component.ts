import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'mp-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
  imports: [CommonModule],
  standalone: true,
})
export class FileUploaderComponent implements OnInit {
  @Input() accept: string = '';
  @Input() multiple: boolean = false;
  @Input() maxSizeMB: number = 5;
  @Input() placeholder: string = 'Seleccionar archivo(s)';

  @Input() initialFiles: File[] = [];

  @Output() filesSelected = new EventEmitter<File[]>();

  selectedFiles = signal<File[]>([]);
  previews = signal<string[]>([]);
  errorMessage: string | null = null;

  ngOnInit() {
    if (this.initialFiles.length > 0) {
      this.selectedFiles.set(this.initialFiles);
      this.previews.set(
        this.initialFiles.map((file) =>
          file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        ),
      );
      this.filesSelected.emit(this.selectedFiles());
    }
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    const validFiles = files.filter((file) => this.isValidFile(file));

    if (validFiles.length > 0) {
      this.addFiles(validFiles);
      this.errorMessage = null;
      this.filesSelected.emit(this.selectedFiles());
    }

    input.value = ''; // reset input
  }

  /** Check if a single file passes all validations */
  private isValidFile(file: File): boolean {
    return this.isValidSize(file) && this.isValidType(file);
  }

  /** Validate file size */
  private isValidSize(file: File): boolean {
    if (file.size / 1024 / 1024 > this.maxSizeMB) {
      this.errorMessage = `${file.name} excede ${this.maxSizeMB}MB y fue omitido.`;
      return false;
    }
    return true;
  }

  /** Validate file type against `accept` input */
  private isValidType(file: File): boolean {
    if (!this.accept) return true;

    const acceptedTypes = this.accept
      .split(',')
      .map((a) => a.trim().toLowerCase());
    const isValid = acceptedTypes.some((ext) => {
      if (ext.startsWith('.')) {
        return file.name.toLowerCase().endsWith(ext);
      } else {
        return file.type === ext;
      }
    });

    if (!isValid) {
      this.errorMessage = `${file.name} no es un tipo permitido (${this.accept})`;
    }

    return isValid;
  }

  /** Add valid files to selectedFiles and generate previews */
  private addFiles(files: File[]): void {
    if (this.multiple) {
      this.selectedFiles.update((current) => [...current, ...files]);
    } else {
      this.selectedFiles.set([...files]);
    }

    this.previews.set(
      this.selectedFiles().map((file) =>
        file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      ),
    );
  }

  removeFile(index: number): void {
    this.selectedFiles.update((files) => {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      return newFiles;
    });

    this.previews.update((previews) => {
      const newPreviews = [...previews];
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    this.filesSelected.emit(this.selectedFiles());
  }
}
