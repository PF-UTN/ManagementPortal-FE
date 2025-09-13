import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EllipsisTextComponent } from './ellipsis-text.component';

describe('EllipsisTextComponent', () => {
  let component: EllipsisTextComponent;
  let fixture: ComponentFixture<EllipsisTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EllipsisTextComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EllipsisTextComponent);
    component = fixture.componentInstance;

    const nativeElement = document.createElement('div');
    Object.defineProperty(nativeElement, 'scrollHeight', {
      get: jest.fn(() => 20),
    });
    Object.defineProperty(nativeElement, 'clientHeight', {
      get: jest.fn(() => 10),
    });
    const parentElement = document.createElement('div');

    Object.defineProperty(nativeElement, 'parentElement', {
      get: jest.fn(() => parentElement),
    });

    component.textContainer = { nativeElement };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('hover behavior', () => {
    it('should set isHovered to true on mouse enter', () => {
      component.onMouseEnter();
      expect(component.isHovered()).toBe(true);
    });

    it('should set isHovered to false on mouse leave', () => {
      component.onMouseEnter();
      component.onMouseLeave();
      expect(component.isHovered()).toBe(false);
    });
  });

  describe('truncation detection', () => {
    it('should set isTruncated to true if scrollHeight > clientHeight', () => {
      component['checkTruncation']();
      expect(component.isTruncated()).toBe(true);
    });

    it('should set isTruncated to false if scrollHeight <= clientHeight', () => {
      const mockNativeElement = {
        scrollHeight: 10,
        clientHeight: 20,
        parentElement: document.createElement('div'),
      } as unknown as HTMLDivElement;

      component.textContainer = { nativeElement: mockNativeElement };

      component['checkTruncation']();
      expect(component.isTruncated()).toBe(false);
    });
  });

  describe('ngAfterViewInit', () => {
    it('should create and observe ResizeObserver if parent exists', () => {
      const observeSpy = jest.fn();
      const disconnectSpy = jest.fn();

      const mockRO = jest.fn().mockImplementation(() => ({
        observe: observeSpy,
        disconnect: disconnectSpy,
      }));
      global.ResizeObserver = mockRO;

      component.ngAfterViewInit();

      expect(mockRO).toHaveBeenCalled();
      expect(observeSpy).toHaveBeenCalledWith(
        component.textContainer.nativeElement.parentElement,
      );
    });
  });

  describe('ngOnDestroy', () => {
    it('should disconnect the ResizeObserver', () => {
      const disconnectSpy = jest.fn();
      component['resizeObserver'] = {
        disconnect: disconnectSpy,
      } as unknown as ResizeObserver;

      component.ngOnDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });
});
