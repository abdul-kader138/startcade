import { Module } from '@nestjs/common';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { PhotosModule } from './photos/photos.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { WalletModule } from './websoket/wallet/wallet.module';

@Module({
  imports: [AuthModule, PhotosModule, ArticlesModule,NewsletterModule,WalletModule],
})
export class AppModule {}
