import { User } from './user.model';
export interface RegistrationRequestListItem {
    id: number;
    requestDate: string;
    status: string;
    user: User; 
}
 
