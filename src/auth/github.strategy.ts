import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
  const { id, username, displayName, emails, photos } = profile;

  const [firstName, ...rest] = displayName?.split(' ') ?? [''];
  const lastName = rest.join(' ');

  const user = {
    id,
    username,
    email: emails?.[0]?.value || null,
    firstName,
    lastName,
    photo: photos?.[0]?.value || null,
  };

  done(null, user);
  }
}
