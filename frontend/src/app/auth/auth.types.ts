export type AuthSignupCommand = {
  email: string;
  password: string;
};

export type AuthSignupResponseDto = {
  user: { id: string; email: string };
  session: { access_token: string };
};

export type AuthLoginCommand = {
  email: string;
  password: string;
};

export type AuthLoginResponseDto = {
  access_token: string;
  refresh_token: string;
  user: { id: string };
};

export type AuthForgotPasswordCommand = {
  email: string;
};

export type AuthForgotPasswordResponseDto = {
  message: string;
};

export type AuthResetPasswordCommand = {
  access_token: string;
  password: string;
  refresh_token?: string;
};

export type AuthResetPasswordResponseDto = {
  message: string;
};

export type AuthLogoutResponseDto = {
  message: string;
};
