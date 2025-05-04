import { RolesEnum } from './roles.contant';

export const RoleHierarchy: Record<string, string[]> = {
  Admin: [RolesEnum.Admin, RolesEnum.Employee, RolesEnum.Client],
  Employee: [RolesEnum.Employee],
  Client: [RolesEnum.Client],
};
