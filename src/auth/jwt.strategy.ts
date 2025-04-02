import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import Lang from '../lang/lang';

const prisma = new PrismaClient();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.jwt,
      ]),
      secretOrKey: process.env.JWT_SECRET || 'ugbff00TxyqwAmcOFzIyMfoZ',
    });
  }

  async validate(payload: { id: number }) {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });
    if (!user) {
      throw new UnauthorizedException(Lang.user_not_found_message);
    }
    return user;
  }
}
