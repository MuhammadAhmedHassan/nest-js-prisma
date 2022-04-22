export type SignTokenPayload = { userId: number; email: string };
export type UserJwtPayload = {
  userId: number;
  email: string;
  iat: number;
  exp: number;
};
