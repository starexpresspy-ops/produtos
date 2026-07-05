export type UserRole = "cliente" | "lojista";

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthProfile extends Profile {
  email: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: AuthProfile;
}
