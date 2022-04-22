import { ForbiddenException } from "@nestjs/common";

export const databaseUniqueConstraintError = (error: any) => {
  if (error?.code === 'P2002') {
    throw new ForbiddenException('Email already in use');
  }
  throw error;
}