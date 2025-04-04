import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
        clientID: process.env.FACEBOOK_APP_ID as string,
        clientSecret: process.env.FACEBOOK_APP_SECRET as string,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL as string,
        profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      });
      
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { id, emails, name, photos } = profile;

    return {
      facebookId: id,
      email: emails?.[0]?.value,
      first_name: `${name?.givenName}`,
      last_name: `${name?.familyName}`,
      avatar: photos?.[0]?.value,
    };
  }
}
