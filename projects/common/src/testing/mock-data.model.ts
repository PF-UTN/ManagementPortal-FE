import {
  SupplierDetail,
  SupplierCreateUpdateResponse,
  Supplier,
} from '@Supplier';

import { Client } from '../models/client.model';
import { Town } from '../models/town.model';
import { User } from '../models/user.model';

export const mockClient: Client = {
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan.perez@example.com',

  password: 'Password123*', // NOSONAR
  phone: '123456789',
  birthdate: new Date('1990-01-01'),
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
  password: 'password123', // NOSONAR
};

export const mockInvalidUser: User = {
  email: 'invalid@example.com',
  password: 'wrongPassword', // NOSONAR
};

export const mockAuthResponse = { access_token: 'mockJWTToken' };

export const mockSupplier: Supplier = {
  businessName: 'Test',
  documentType: 'CUIT',
  documentNumber: '12345678901',
  email: 'test@test.com',
  phone: '123456789',
  address: {
    street: 'Main',
    streetNumber: 123,
    townId: 1,
  },
};

export const mockSupplierCreateUpdateResponse: SupplierCreateUpdateResponse = {
  id: 1,
  businessName: 'Proveedor Ejemplo S.A.',
  documentType: 'CUIT',
  documentNumber: '20123456789',
  email: 'proveedor@ejemplo.com',
  phone: '+541112345678',
  addressId: 100,
};

export const mockSupplierWithTown: SupplierDetail = {
  id: 1000,
  businessName: 'Test',
  documentType: 'CUIT',
  documentNumber: '12345678901',
  email: 'test@test.com',
  phone: '123456789',
  address: {
    street: 'Main',
    streetNumber: 123,
    townId: 1,
    town: {
      id: 1,
      name: 'Buenos Aires',
      zipCode: '3000',
      provinceId: 2,
    },
  },
};

export const mockProductDetail = {
  id: 1,
  name: 'Producto Test',
  description: 'Descripción de prueba',
  category: { name: 'Categoría Test' },
  price: 100.5,
  stock: {
    quantityAvailable: 10,
    quantityOrdered: 5,
    quantityReserved: 2,
  },
  weight: 1.25,
  supplier: {
    businessName: 'Proveedor Test',
    email: 'proveedor@test.com',
    phone: '123456789',
  },
  enabled: true,
  imageUrl: null,
};

export const mockCart = {
  cartId: '1',
  items: [{ product: mockProductDetail, quantity: 2 }],
};
