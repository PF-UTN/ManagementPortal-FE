import { SearchVehicleResponse } from '../models/search-vehicle-response.model';
import { VehicleListItem } from '../models/vehicle-item.model';

export const mockVehicleListItems: VehicleListItem[] = [
  {
    id: 1,
    licensePlate: 'HJD290',
    brand: 'Toyota',
    model: 'Corolla',
    enabled: true,
    kmTraveled: 21000,
    admissionDate: new Date('2012-01-01'),
  },
  {
    id: 2,
    licensePlate: 'HJD291',
    brand: 'Toyota',
    model: 'Corolla',
    enabled: true,
    kmTraveled: 25000,
    admissionDate: new Date('2012-07-01'),
  },
];

export const mockSearchVehicleResponse: SearchVehicleResponse = {
  total: 10,
  results: mockVehicleListItems,
};
