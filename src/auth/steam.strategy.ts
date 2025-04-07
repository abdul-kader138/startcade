import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-steam';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {

  constructor() {
      super( {
        apiKey: process.env.STEAM_API_KEY!,
        returnURL: process.env.STEAM_RETURN_URL!,
        realm: process.env.STEAM_REALM!,
      });
      
    }

  async validate(identifier: string, profile: any, done: Function): Promise<any> {
    const user = {
      id: profile.id,
      username: profile.displayName,
      avatar: profile.photos?.[2]?.value, 
      firstName: profile.displayName, 
      lastName: '',                   
      profile,
    };
    done(null, user);
  }
}
