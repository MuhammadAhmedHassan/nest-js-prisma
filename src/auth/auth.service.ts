import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { databaseUniqueConstraintError } from 'src/utils/utils';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignTokenPayload } from './strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    // generate the password hash
    const hash = await argon.hash(dto.password);

    // save the new user in db
    const user = await this.prisma.user
      .create({
        data: { email: dto.email, password: hash },
      })
      .catch(databaseUniqueConstraintError);

    // return token
    return this.signToken({ userId: user.id, email: user.email });
  }

  async login(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('User not found');

    const match = await argon.verify(user.password, dto.password);
    if (!match) throw new ForbiddenException('Invalid password');

    // return the token
    return this.signToken({ userId: user.id, email: user.email });
  }

  async signToken(payload: SignTokenPayload) {
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });
    return { accessToken: token };
  }
}
