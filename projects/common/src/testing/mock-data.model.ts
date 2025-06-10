import { Client } from '../models/client.model';
import { Town } from '../models/town.model';
import { User } from '../models/user.model';

export const mockClient: Client = {
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan.perez@example.com',
  password: 'Password123*',
  phone: '123456789',
  birthDate: new Date('1990-01-01'),
  documentNumber: '20123456789',
  documentType: 'CUIL',
  companyName: 'Mi Empresa',
  taxCategoryId: 1,
  address: {
    street: 'Calle Falsa',
    streetNumber: 123,
    townId: 1,
  },
};

export const mockTown: Town = {
  id: 1,
  name: 'Ciudad Ficticia',
  zipCode: '12345',
  provinceId: 1,
};

export const mockUser: User = {
  email: 'juan.perez@example.com',
  password: 'password123',
};

export const mockInvalidUser: User = {
  email: 'invalid@example.com',
  password: 'wrongPassword',
};

export const mockAuthResponse = { access_token: 'mockJWTToken' };
