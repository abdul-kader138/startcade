import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor() {
    Logger.log('🚀 Initializing SteamStrategy');
    Logger.log('STEAM_API_KEY:', process.env.STEAM_API_KEY);
    Logger.log('STEAM_RETURN_URL:', process.env.STEAM_RETURN_URL);
    Logger.log('STEAM_REALM:', process.env.STEAM_REALM);

    super({
      apiKey: process.env.STEAM_API_KEY!,
      returnURL: process.env.STEAM_RETURN_URL!,
      realm: process.env.STEAM_REALM!,
    });
  }

  async validate(
    identifier: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    try {
      if (!profile.id) {
        throw new Error('Missing provider ID (Steam profile.id not returned)');
      }

      const user = {
        id: profile.id,
        username: profile.displayName,
        avatar: profile.photos?.[2]?.value ?? null,
        firstName: profile.displayName,
        lastName: '',
        profile,
      };

      return done(null, user);
    } catch (error) {
      Logger.error('Steam Login Callback Error', error.stack || error.message);
      return done(error, false); // Pass error to the guard
    }
  }
}
