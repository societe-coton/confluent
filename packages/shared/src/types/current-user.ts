import type { UserRole } from '../schemas/user.schema';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
