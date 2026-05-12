import type { UserRole } from '../schemas/user.schema.js';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
