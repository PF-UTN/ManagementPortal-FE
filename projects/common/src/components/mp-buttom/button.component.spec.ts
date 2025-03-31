import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatButtonModule, ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Template Rendering', () => {
    it('should render the button with the correct label', () => {
      // Arrange: Set a specific label
      component.label = 'Submit';
      fixture.detectChanges();

      // Act: Get the button element
      const button = fixture.nativeElement.querySelector('button');

      // Assert: Check if the button label matches the expected text
      expect(button.textContent.trim()).toBe('Submit');
    });

    it('should have the correct type attribute', () => {
      // Arrange: Set the button type
      component.type = 'submit';
      fixture.detectChanges();

      // Act: Get the button element
      const button = fixture.nativeElement.querySelector('button');

      // Assert: Verify the button type attribute
      expect(button.getAttribute('type')).toBe('submit');
    });

    it('should have disabled attribute when disabled', () => {
      // Arrange: Set the button to disabled
      component.disabled = true;
      fixture.detectChanges();

      // Act: Get the button element
      const button = fixture.nativeElement.querySelector('button');

      // Assert: Check if the button is disabled
      expect(button.disabled).toBeTruthy();
    });
  });

  describe('onClick Method', () => {
    it('should emit clicked event when clicked', () => {
      // Arrange: Spy on the clicked event emitter
      jest.spyOn(component.clicked, 'emit');
      const button = fixture.debugElement.query(By.css('button')).nativeElement;

      // Act: Simulate a button click
      button.click();

      // Assert: Verify if the clicked event was emitted
      expect(component.clicked.emit).toHaveBeenCalled();
    });

    it('should not emit clicked event when disabled', () => {
      // Arrange: Set the button to disabled and spy on the clicked event emitter
      component.disabled = true;
      fixture.detectChanges();
      jest.spyOn(component.clicked, 'emit');
      const button = fixture.debugElement.query(By.css('button')).nativeElement;

      // Act: Simulate a button click
      button.click();

      // Assert: Ensure the clicked event was NOT emitted
      expect(component.clicked.emit).not.toHaveBeenCalled();
    });
  });
});
