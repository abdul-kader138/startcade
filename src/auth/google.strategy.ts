import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, StrategyOptions } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const options: StrategyOptions = {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
    };

    super(options);
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const { id, name, emails, photos } = profile;
  
    return {
      id,
      email: emails?.[0].value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0].value,
    };
  }
  
}
