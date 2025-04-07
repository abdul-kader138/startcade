import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from '@prisma/client/runtime/library';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  getContent(): string {
    return "success";
  }
  
}

