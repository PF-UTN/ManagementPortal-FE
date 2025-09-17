import { BackArrowComponent, TitleComponent } from '@Common-UI';

import { Component } from '@angular/core';

@Component({
  selector: 'lib-create-maintenance-plan',
  standalone: true,
  imports: [BackArrowComponent, TitleComponent],
  templateUrl: './create-maintenance-plan.component.html',
  styleUrl: './create-maintenance-plan.component.scss',
})
export class CreateMaintenancePlanComponent {}
