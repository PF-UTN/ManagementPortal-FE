import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';

import { ButtonComponent } from './button.component';

@Component({
  template: `<mp-button
    [disabled]="isDisabled"
    [loading]="isLoading"
    (onClick)="clicked = true"
    >Test</mp-button
  >`,
})
class HostComponent {
  isDisabled = false;
  isLoading = false;
  clicked = false;
}

describe('ButtonComponent', () => {
  let hostFixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatButtonModule, ButtonComponent],
      declarations: [HostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(HostComponent);
    host = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  describe('Template Rendering', () => {
    it('should have disabled attribute when disabled', () => {
      // Arrange
      host.isDisabled = true;
      hostFixture.detectChanges();
      // Act
      const button = hostFixture.debugElement.query(
        By.css('button'),
      ).nativeElement;
      // Assert
      expect(button.disabled).toBeTruthy();
    });
  });

  describe('onClick Method', () => {
    it('should emit clickEvent event when clicked', () => {
      // Arrange
      host.isDisabled = false;
      host.isLoading = false;
      hostFixture.detectChanges();
      const button = hostFixture.debugElement.query(
        By.css('button'),
      ).nativeElement;
      // Act
      button.click();
      // Assert
      expect(host.clicked).toBe(true);
    });

    it('should not emit click event when disabled', () => {
      // Arrange
      host.isDisabled = true;
      host.isLoading = false;
      hostFixture.detectChanges();
      host.clicked = false;
      const button = hostFixture.debugElement.query(
        By.css('button'),
      ).nativeElement;
      // Act
      button.click();
      // Assert
      expect(host.clicked).toBe(false);
    });

    it('should not emit click event when loading', () => {
      // Arrange
      host.isDisabled = false;
      host.isLoading = true;
      hostFixture.detectChanges();
      host.clicked = false;
      const button = hostFixture.debugElement.query(
        By.css('button'),
      ).nativeElement;
      // Act
      button.click();
      // Assert
      expect(host.clicked).toBe(false);
    });
  });
});
