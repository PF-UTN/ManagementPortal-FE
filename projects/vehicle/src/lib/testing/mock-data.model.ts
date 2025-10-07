import { SearchVehicleResponse } from '../../../../common/src/models/vehicle/search-vehicle-response.model';
import { VehicleListItem } from '../../../../common/src/models/vehicle/vehicle-item.model';

export const mockVehicleListItems: VehicleListItem[] = [
  {
    id: 1,
    licensePlate: 'HJD290',
    brand: 'Toyota',
    model: 'Corolla',
    enabled: true,
    kmTraveled: 21000,
    admissionDate: '2024-07-31T00:00:00.000Z',
  },
  {
    id: 2,
    licensePlate: 'HJD291',
    brand: 'Toyota',
    model: 'Corolla',
    enabled: true,
    kmTraveled: 25000,
    admissionDate: '2024-07-31T00:00:00.000Z',
  },
];

export const mockSearchVehicleResponse: SearchVehicleResponse = {
  total: 10,
  results: mockVehicleListItems,
};
