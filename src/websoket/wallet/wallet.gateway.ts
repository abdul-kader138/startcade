// src/gateway/wallet.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
  
  @WebSocketGateway({ cors: true })
  export class WalletGateway {
    @WebSocketServer()
    server: Server;
  
    // 🚀 Call this from your service when the balance changes
    emitWalletUpdate(userId: string, newBalance: number) {
      this.server.emit('walletUpdated', {
        userId,
        balance: newBalance,
      });
    }
  }
  