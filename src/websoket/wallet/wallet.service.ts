import { Injectable } from '@nestjs/common';
import { WalletGateway } from './wallet.gateway';

@Injectable()
export class WalletService {
  constructor(private readonly walletGateway: WalletGateway) {}

  async updateBalance(userId: string, newAmount: number) {
    // 1. Update DB logic here...
    // 2. Emit new balance to frontend
    this.walletGateway.emitWalletUpdate(userId, newAmount);
  }
}
