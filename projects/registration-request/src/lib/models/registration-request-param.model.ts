export interface RegistrationRequestParams {
  page: number;
  pageSize: number;
  searchText?: string;
  filters?: {
    status?: string[];
  };
}
