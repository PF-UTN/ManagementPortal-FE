import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MpSubtitleComponent } from './mp-subtitle.component';


describe('MpSubtitleComponent', () => {
  let component: MpSubtitleComponent;
  let fixture: ComponentFixture<MpSubtitleComponent>;

  beforeEach(() => {
     TestBed.configureTestingModule({
      imports: [MpSubtitleComponent],
    }).compileComponents();
  
    fixture = TestBed.createComponent(MpSubtitleComponent);
    component = fixture.componentInstance;
  });

  describe('Template Rendering', () => {
    it('should render the label text', () => {
      // Arrange: Set the label input
      component.label = 'Test Subtitle';
      fixture.detectChanges();

      // Act: Query the rendered element
      const spanElement: HTMLSpanElement = fixture.nativeElement.querySelector('span');

      // Assert: Verify the displayed text
      expect(spanElement.textContent).toBe('Test Subtitle');
    });

    it('should apply the correct color style', () => {
      // Arrange: Set the color input
      component.color = 'red';
      fixture.detectChanges();

      // Act: Query the rendered element
      const spanElement: HTMLSpanElement = fixture.nativeElement.querySelector('span');

      // Assert: Verify the applied style
      expect(spanElement.style.color).toBe('red');
    });

    it('should apply the correct font-size style', () => {
      // Arrange: Set the font size input
      component.fontSize = '20px';
      fixture.detectChanges();

      // Act: Query the rendered element
      const spanElement: HTMLSpanElement = fixture.nativeElement.querySelector('span');

      // Assert: Verify the applied font size
      expect(spanElement.style.fontSize).toBe('20px');
    });
  });
});
