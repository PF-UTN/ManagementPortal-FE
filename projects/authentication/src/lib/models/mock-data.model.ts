import { Client } from './client.model';
import { User } from './user.model';

export const mockClient: Client = {
  name: 'Juan',
  lastname: 'Pérez',
  email: 'juan.perez@example.com',
  password: 'Password123',
  confirmPassword: 'Password123',
  phone: '123456789',
  birthdate: new Date('1990-01-01'),
  country: 'Argentina',
  province: 'Santa Fe',
  town: 'Rosario',
  street: 'Calle Falsa',
  streetNumber: 123,
  taxCategory: 1,
  taxIdType: 2,
  tax: '20-12345678-9',
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
