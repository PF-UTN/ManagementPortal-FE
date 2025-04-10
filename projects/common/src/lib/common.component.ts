import { Component } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'mp-Common',
  standalone: true,
  imports: [],
  template: ``,
  styles: ``
})
export class CommonComponent {
  isProduction = environment.production;
}
