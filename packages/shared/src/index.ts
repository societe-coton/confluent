export type UserRole = 'entrepreneur' | 'financeur' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
