import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubtitleComponent } from './subtitle.component';

describe('SubtitleComponent', () => {
  let component: SubtitleComponent;
  let fixture: ComponentFixture<SubtitleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SubtitleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubtitleComponent);
    component = fixture.componentInstance;
  });

  describe('Initialization', () => {
    it('should initialize the component', () => {
      // Arrange
      // Act
      // Assert
      expect(component).toBeTruthy();
    });
  });
});
