export interface IOAuthApp {
  clientId: string;
  clientSecret: string;
  appName: string;
  redirectUris: string[];
  allowedScopes: string[];
}

export interface ITokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface IUserInfo {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  country: string;
  avatar: string;
  email: string;
  isEmailVerified: boolean;
  phone: string;
  verified: boolean;
}

export interface IAppInfo {
  id: string;
  app_name: string;
  business_name: string;
  country: string;
  status: string;
  support_email: string;
}
