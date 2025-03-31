import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MpClickableTitleComponent } from './mp-clickable-title.component';
import { By } from '@angular/platform-browser';

describe('MpClickableTitleComponent', () => {
  let component: MpClickableTitleComponent;
  let fixture: ComponentFixture<MpClickableTitleComponent>;

  beforeEach( () => {
     TestBed.configureTestingModule({
      imports: [MpClickableTitleComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MpClickableTitleComponent);
    component = fixture.componentInstance;
  });

  describe('Template Rendering', () => {
    it('should display the correct label', () => {
      // Arrange: Set input properties
      component.label = 'Test Title';
      fixture.detectChanges();
      
      // Act: Get the span element
      const spanElement = fixture.debugElement.query(By.css('span'));
      
      // Assert: Verify the text content
      expect(spanElement.nativeElement.textContent).toBe('Test Title');
    });

    it('should apply the correct color and font size', () => {
      // Arrange: Set input properties
      component.color = 'red';
      component.fontSize = '20px';
      fixture.detectChanges();
      
      // Act: Get the span element
      const spanElement = fixture.debugElement.query(By.css('span'));
      
      // Assert: Verify the styles
      expect(spanElement.styles['color']).toBe('red');
      expect(spanElement.styles['font-size']).toBe('20px');
    });
  });

  describe('onClick Method', () => {
    it('should emit clicked event when clicked', () => {
      // Arrange: Spy on the event emitter
      jest.spyOn(component.clicked, 'emit');
      fixture.detectChanges();
      
      // Act: Simulate click event
      const spanElement = fixture.debugElement.query(By.css('span'));
      spanElement.triggerEventHandler('click', null);
      
      // Assert: Expect the event emitter to be called
      expect(component.clicked.emit).toHaveBeenCalled();
    });
  });
});
