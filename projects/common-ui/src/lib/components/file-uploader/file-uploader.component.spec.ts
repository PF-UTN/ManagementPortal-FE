import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploaderComponent } from './file-uploader.component';

describe('FileUploaderComponent', () => {
  let component: FileUploaderComponent;
  let fixture: ComponentFixture<FileUploaderComponent>;

  const createObjectURLRespone = 'mock-url';
  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => createObjectURLRespone);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploaderComponent, CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with initialFiles if provided', () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    component.initialFiles = [file];
    component.ngOnInit();

    expect(component.selectedFiles()).toEqual([file]);
    expect(component.previews()).toHaveLength(1);
    expect(component.filesSelected.emit).toBeDefined();
  });

  it('should add valid files on file selection', () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const event = {
      target: { files: [file] },
    } as unknown as Event;

    jest.spyOn(component.filesSelected, 'emit');

    component.onFileSelected(event);

    expect(component.selectedFiles()).toContain(file);
    expect(component.previews()[0]).toBe(createObjectURLRespone);
    expect(component.filesSelected.emit).toHaveBeenCalledWith(
      component.selectedFiles(),
    );
  });

  it('should reject files exceeding max size', () => {
    const file = new File([new ArrayBuffer(6 * 1024 * 1024)], 'big.png', {
      type: 'image/png',
    });
    const event = { target: { files: [file] } } as unknown as Event;

    jest.spyOn(component.filesSelected, 'emit');

    component.onFileSelected(event);

    expect(component.selectedFiles()).toHaveLength(0);
    expect(component.errorMessage).toContain('excede 5MB');
    expect(component.filesSelected.emit).not.toHaveBeenCalled();
  });

  it('should reject files with invalid type based on accept', () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    component.accept = '.png,.jpg';
    const event = { target: { files: [file] } } as unknown as Event;

    jest.spyOn(component.filesSelected, 'emit');

    component.onFileSelected(event);

    expect(component.selectedFiles()).toHaveLength(0);
    expect(component.errorMessage).toContain('no es un tipo permitido');
    expect(component.filesSelected.emit).not.toHaveBeenCalled();
  });

  it('should remove a file', () => {
    const file1 = new File(['a'], 'a.png', { type: 'image/png' });
    const file2 = new File(['b'], 'b.png', { type: 'image/png' });
    component.selectedFiles.set([file1, file2]);
    component.previews.set(['blob:a', 'blob:b']);

    jest.spyOn(component.filesSelected, 'emit');

    component.removeFile(0);

    expect(component.selectedFiles()).toEqual([file2]);
    expect(component.previews()).toEqual(['blob:b']);
    expect(component.filesSelected.emit).toHaveBeenCalledWith(
      component.selectedFiles(),
    );
  });
});
