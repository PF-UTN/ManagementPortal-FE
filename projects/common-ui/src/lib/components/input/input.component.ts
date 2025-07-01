/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  Self,
  input,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'mp-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
  ],
  standalone: true,
})
export class InputComponent
  implements ControlValueAccessor, OnInit, AfterViewInit
{
  @Input() label!: string;
  type = input<string>('text');
  @Input() icon?: string;
  @Input() iconAction?: () => void;
  iconPosition = input<'suffix' | 'prefix'>('suffix');
  @Input() errorMessages?: { [key: string]: string };
  @Input() hint?: string;
  appearance = input<'outline' | 'fill'>('outline');
  readonly = input<boolean>(false);
  placeholder = input<string>('');
  showPasswordToggle = input<boolean>(false);
  textarea = input<boolean>(false);
  rows = input<number>(3);
  displayWith = input<(value: any) => string>();
  @Input() matAutocomplete?: MatAutocomplete;

  @Output() input = new EventEmitter<Event>();
  @Output() change = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();

  hidePassword = true;

  constructor(@Self() @Optional() private ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    this.errorMessages = {
      required: 'Este campo es requerido.',
      maxlength: 'El valor no puede superar los {requiredLength} caracteres.',
      minlength: 'Debe tener al menos {requiredLength} caracteres.',
      invalidEmail: 'Email no válido.',
      ...this.errorMessages,
    };
  }

  ngAfterViewInit(): void {
    if (this.iconPosition() === 'suffix' && !this.iconAction && this.control) {
      this.iconAction = () => {
        this.control.reset();
        this.control.markAsPristine();
        this.control.markAsUntouched();
        this.control.updateValueAndValidity();
      };
    }
  }

  get control() {
    return this.ngControl?.control as FormControl<any>;
  }

  onChange: (_: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(): void {}

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  get inputType(): string {
    const type = this.type();
    if (type === 'password' && this.showPasswordToggle()) {
      return this.hidePassword ? 'password' : 'text';
    }
    return type;
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    let val = input.value;

    if (this.type() === 'number') {
      val = val.replace(/[^0-9.,-]/g, '').replace(',', '.');
      this.control?.setValue(val === '' ? null : +val);
    } else {
      this.control?.setValue(val);
    }

    this.onChange(this.control?.value);
    this.input.emit(event);
  }

  get errorKeys(): string[] {
    return this.control?.errors ? Object.keys(this.control.errors) : [];
  }

  getErrorMessage(key: string): string {
    if (!this.errorMessages || !this.control?.errors) return '';
    let msg = this.errorMessages[key] || '';

    const errorObj = this.control.errors[key];
    if (errorObj && typeof errorObj === 'object') {
      Object.keys(errorObj).forEach((param) => {
        msg = msg.replace(`{${param}}`, errorObj[param]);
      });
    }
    return msg;
  }
}
