import { User } from '../models/user.model';
export interface RegistrationRequestListItem {
  id: number;
  requestDate: string;
  status: string;
  user: User;
}
