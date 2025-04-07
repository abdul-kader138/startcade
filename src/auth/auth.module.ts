import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { MailerModule } from 'src/mailer/mailer.module';
import { FacebookStrategy } from './facebook.strategy';
import { GitHubStrategy } from './github.strategy';
import { GoogleStrategy } from './google.strategy';
import { SteamStrategy } from './steam.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'ugbff00TxyqwAmcOFzIyMfoZ',
      signOptions: { expiresIn: '1h' },
    }),
    MailerModule
  ],
  providers: [AuthService, JwtStrategy,FacebookStrategy,GitHubStrategy,GoogleStrategy,SteamStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
