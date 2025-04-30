import { Client } from '../../../../common/src/models/client.model';
import { User } from '../../../../common/src/models/user.model';

export const mockClient: Client = {
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan.perez@example.com',
  password: 'Password123',
  confirmPassword: 'Password123',
  phone: '123456789',
  birthDate: new Date('1990-01-01'),
  country: 'Argentina',
  province: 'Santa Fe',
  town: 'Rosario',
  street: 'Calle Falsa',
  streetNumber: 123,
  taxCategory: 1,
  documentType: 2,
  documentNumber: '20-12345678-9',
  companyName: 'Mi Empresa',
};

export const mockUser: User = {
  email: 'juan.perez@example.com',
  password: 'password123',
};

export const mockInvalidUser: User = {
  email: 'invalid@example.com',
  password: 'wrongPassword',
};

export const mockAuthResponse = { token: 'mockJWTToken' };
