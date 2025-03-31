import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MpTitleComponent } from './mp-title.component';

describe('MpTitleComponent', () => {
  let component: MpTitleComponent;
  let fixture: ComponentFixture<MpTitleComponent>;

  beforeEach( () => {
   TestBed.configureTestingModule({
      imports: [MpTitleComponent], // Importing standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(MpTitleComponent);
    component = fixture.componentInstance;
  });

  describe('Template Rendering', () => {
    it('should render the label text', () => {
      // Arrange: Set the label input
      component.label = 'Test Title';
      fixture.detectChanges();

      // Act: Query the rendered element
      const h1Element: HTMLHeadingElement = fixture.nativeElement.querySelector('h1');

      // Assert: Verify the displayed text
      expect(h1Element.textContent).toBe('Test Title');
    });

    it('should apply the correct color style', () => {
      // Arrange: Set the color input
      component.color = 'blue';
      fixture.detectChanges();

      // Act: Query the rendered element
      const h1Element: HTMLHeadingElement = fixture.nativeElement.querySelector('h1');

      // Assert: Verify the applied style
      expect(h1Element.style.color).toBe('blue');
    });

    it('should apply the correct font-size style', () => {
      // Arrange: Set the font size input
      component.fontSize = '24px';
      fixture.detectChanges();

      // Act: Query the rendered element
      const h1Element: HTMLHeadingElement = fixture.nativeElement.querySelector('h1');

      // Assert: Verify the applied font size
      expect(h1Element.style.fontSize).toBe('24px');
    });
  });
});
