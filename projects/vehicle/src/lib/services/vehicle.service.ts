import { environment } from '@Common';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CreateMaintenanceItemRequest } from '../models/maintenance-item-create.model';
import { SearchMaintenanceItemResponse } from '../models/maintenance-item-response.model';
import { UpdateMaintenanceItemRequest } from '../models/maintenance-item-update.model';
import { MaintenanceCreate } from '../models/maintenance-perform.model';
import { MaintenancePlanCreate } from '../models/maintenance-plan-create.model';
import { SearchMaintenancePlanResponse } from '../models/maintenance-plan-response.model';
import { MaintenanceRepairParams } from '../models/maintenance-repair-param.model';
import { SearchMaintenanceRepairResponse } from '../models/maintenance-response.model';
import { SearchVehicleResponse } from '../models/search-vehicle-response.model';
import { SupplierSearchResponseModel } from '../models/supplier-search-response-model';
import { VehicleCreate } from '../models/vehicle-create.model';
import { VehicleListItem } from '../models/vehicle-item.model';
import { VehicleParams } from '../models/vehicle-params.model';
import { VehicleUpdate } from '../models/vehicle-update.model';
@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private readonly baseUrl = environment.apiBaseUrl + '/vehicle';
  constructor(private readonly http: HttpClient) {}

  postSearchVehiclesAsync(
    params: VehicleParams,
  ): Observable<SearchVehicleResponse> {
    const url = `${this.baseUrl}/search`;
    return this.http.post<SearchVehicleResponse>(url, params);
  }

  deleteVehicleAsync(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<void>(url);
  }

  createVehicleAsync(vehicle: VehicleCreate): Observable<void> {
    const url = `${this.baseUrl}`;
    return this.http.post<void>(url, vehicle);
  }

  updateVehicleAsync(id: number, vehicle: VehicleUpdate): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<void>(url, vehicle);
  }

  postSearchMaintenancePlanItemVehicle(
    vehicleId: number,
    param: MaintenanceRepairParams,
  ): Observable<SearchMaintenancePlanResponse> {
    const url = `${this.baseUrl}/${vehicleId}/maintenance-plan-item/search`;
    return this.http.post<SearchMaintenancePlanResponse>(url, param);
  }

  postSearchMaintenanceVehicle(
    vehicleId: number,
    param: MaintenanceRepairParams,
  ): Observable<SearchMaintenanceRepairResponse> {
    const url = `${this.baseUrl}/${vehicleId}/maintenance/search`;
    return this.http.post<SearchMaintenanceRepairResponse>(url, param);
  }

  postSearchRepairVehicle(
    vehicleId: number,
    param: MaintenanceRepairParams,
  ): Observable<SearchMaintenanceRepairResponse> {
    const url = `${this.baseUrl}/${vehicleId}/repair/search`;
    return this.http.post<SearchMaintenanceRepairResponse>(url, param);
  }

  getVehicleById(id: number): Observable<VehicleListItem> {
    return this.http.get<VehicleListItem>(`${this.baseUrl}/${id}`);
  }

  downloadVehicleList(params: VehicleParams) {
    const url = `${this.baseUrl}/download`;
    return this.http.post(url, params, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  downloadMaintenanceHistory(vehicleId: number) {
    const url = `${this.baseUrl}/${vehicleId}/maintenance/download`;
    return this.http.post(url, null, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  postSearchMaintenanceItem(param: MaintenanceRepairParams) {
    const url = `${this.baseUrl}/maintenance-item/search`;
    return this.http.post<SearchMaintenanceItemResponse>(url, param);
  }

  createMaintenancePlanItem(payload: MaintenancePlanCreate) {
    const url = `${this.baseUrl}/maintenance-plan-item`;
    return this.http.post(url, payload);
  }

  postCreateMaintenanceItemAsync(
    request: CreateMaintenanceItemRequest,
  ): Observable<void> {
    const url = `${this.baseUrl}/maintenance-item`;
    return this.http.post<void>(url, request);
  }

  putUpdateMaintenanceItemAsync(
    idMaintenanceItem: number,
    request: UpdateMaintenanceItemRequest,
  ): Observable<void> {
    const url = `${this.baseUrl}/maintenance-item/${idMaintenanceItem}`;
    return this.http.put<void>(url, request);
  }

  createMaintenanceAsync(
    vehicleId: number,
    payload: MaintenanceCreate,
  ): Observable<void> {
    const url = `${this.baseUrl}/${vehicleId}/maintenance`;
    return this.http.post<void>(url, payload);
  }

  searchServiceSuppliers(
    params: MaintenanceRepairParams,
  ): Observable<SupplierSearchResponseModel> {
    const url = `${environment.apiBaseUrl}/service-supplier/search`;
    return this.http.post<SupplierSearchResponseModel>(url, params);
  }
}
