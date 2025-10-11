import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LateralDrawerNotificationsComponent } from './components/lateral-drawer-notifications/lateral-drawer-notifications.component';

const routes: Routes = [
  {
    path: 'notificaciones',
    component: LateralDrawerNotificationsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationRoutingModule {}
