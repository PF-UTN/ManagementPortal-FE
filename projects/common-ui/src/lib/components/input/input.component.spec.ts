import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { InputComponent } from './input.component';

@Component({
  template: `
    <form [formGroup]="form">
      <mp-input
        label="Test Label"
        formControlName="test"
        [errorMessages]="{
          required: 'Required!',
          minlength: 'Min {requiredLength}',
        }"
        [showPasswordToggle]="true"
        type="password"
        [icon]="'close'"
      ></mp-input>
    </form>
  `,
})
class TestHostComponent {
  form = new FormGroup({
    test: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });
}

describe('InputComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let inputComponent: InputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        InputComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        NoopAnimationsModule,
      ],
      declarations: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;

    fixture.detectChanges();

    const inputDebug = fixture.debugElement.query(By.directive(InputComponent));
    inputComponent = inputDebug.componentInstance;
  });

  it('should create the host component', () => {
    // Assert
    expect(hostComponent).toBeTruthy();
  });

  it('should render the label', () => {
    // Assert
    const label = fixture.nativeElement.querySelector('mat-label');
    expect(label.textContent).toContain('Test Label');
  });

  it('should show error message when control is touched and invalid', () => {
    // Arrange
    const control = hostComponent.form.get('test');

    // Act
    control?.markAsTouched();
    control?.updateValueAndValidity();
    fixture.detectChanges();

    // Assert
    const error = fixture.nativeElement.querySelector('mat-error');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Required!');
  });

  it('should not show error message when control is valid', () => {
    // Arrange
    const control = hostComponent.form.get('test');
    control?.setValue('valid');
    control?.markAsTouched();
    control?.updateValueAndValidity();

    // Act
    fixture.detectChanges();

    // Assert
    const error = fixture.nativeElement.querySelector('mat-error');
    expect(error).toBeNull();
  });

  it('should toggle password visibility', () => {
    // Arrange
    inputComponent.hidePassword = true;

    // Act
    inputComponent.togglePasswordVisibility();

    // Assert
    expect(inputComponent.hidePassword).toBe(false);
  });

  it('should return correct inputType for password', () => {
    // Arrange
    inputComponent.hidePassword = true;
    jest.spyOn(inputComponent, 'type').mockReturnValue('password');
    jest.spyOn(inputComponent, 'showPasswordToggle').mockReturnValue(true);

    // Act
    const type1 = inputComponent.inputType;
    inputComponent.hidePassword = false;
    const type2 = inputComponent.inputType;

    // Assert
    expect(type1).toBe('password');
    expect(type2).toBe('text');
  });

  it('should return correct inputType for text', () => {
    // Arrange
    jest.spyOn(inputComponent, 'type').mockReturnValue('text');
    jest.spyOn(inputComponent, 'showPasswordToggle').mockReturnValue(false);

    // Act
    const type = inputComponent.inputType;

    // Assert
    expect(type).toBe('text');
  });

  it('should emit input event and call onChange on input', () => {
    // Arrange
    const mockInput = document.createElement('input');
    mockInput.value = 'test value';
    const event = new Event('input');
    Object.defineProperty(event, 'target', {
      writable: false,
      value: mockInput,
    });

    const spy = jest.spyOn(inputComponent.input, 'emit');
    const onChangeSpy = jest.spyOn(inputComponent, 'onChange');

    // Act
    inputComponent.onInput(event);

    // Assert
    expect(spy).toHaveBeenCalledWith(event);
    expect(onChangeSpy).toHaveBeenCalled();
  });

  it('should return errorKeys array', () => {
    // Arrange
    const control = hostComponent.form.get('test');
    control?.setValue('');
    control?.markAsTouched();
    control?.updateValueAndValidity();

    // Act
    const keys = inputComponent.errorKeys;

    // Assert
    expect(Array.isArray(keys)).toBe(true);
    expect(keys).toContain('required');
  });

  it('should return formatted error message with params', () => {
    // Arrange
    const control = hostComponent.form.get('test');
    control?.setValue('a');
    control?.markAsTouched();
    control?.updateValueAndValidity();

    // Act
    const msg = inputComponent.getErrorMessage('minlength');

    // Assert
    expect(msg).toContain('Min');
  });

  it('should register onChange and onTouched', () => {
    // Arrange
    const fn = jest.fn();

    // Act
    inputComponent.registerOnChange(fn);
    inputComponent.registerOnTouched(fn);

    // Assert
    expect(inputComponent.onChange).toBe(fn);
    expect(inputComponent.onTouched).toBe(fn);
  });

  it('should set the maxlength attribute on the input', () => {
    // Arrange
    inputComponent.maxlength = 8;
    inputComponent.label = 'Test';
    inputComponent.ngOnInit();
    fixture.detectChanges();

    // Act
    const inputEl: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    // Assert
    expect(inputEl.getAttribute('maxlength')).toBe('8');
  });
});
