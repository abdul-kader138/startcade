import { Module } from '@nestjs/common';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { PhotosModule } from './photos/photos.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { WalletModule } from './websoket/wallet/wallet.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ ConfigModule.forRoot({
    isGlobal: true,
  }),AuthModule, PhotosModule, ArticlesModule,NewsletterModule,WalletModule,PrismaModule],
})

export class AppModule {}
