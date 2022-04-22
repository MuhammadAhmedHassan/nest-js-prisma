import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserJwtPayload } from '.';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService, // because super is called before this call constructor, and we can't use this in super class constructor
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: UserJwtPayload) {
    // payload that we store while creating the token
    // this function runs if our token is right
    console.log(payload);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    delete user.password;
    return user;
    // if we return null event then it will throw an error
  }
}
