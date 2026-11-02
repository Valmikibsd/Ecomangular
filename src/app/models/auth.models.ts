export interface LoginDto {
  username: string;
  password: string;
  email?: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  accessToken: string;
  refreshToken: string;
  expiration?: string;
  username?: string;
  role?: string;
}

export interface RefreshDto {
  refreshToken: string;
}
