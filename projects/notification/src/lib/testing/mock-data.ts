import { UserNotification } from '../models';

export const mockNotifications: UserNotification[] = [
  {
    id: 1,
    timestamp: new Date('2025-10-08T10:00:00Z'),
    message: 'Notificación de prueba 1',
    viewed: false,
  },
  {
    id: 2,
    timestamp: new Date('2025-10-08T11:00:00Z'),
    message: 'Notificación de prueba 2',
    viewed: true,
  },
];
