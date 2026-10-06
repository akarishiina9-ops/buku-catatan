import { Module } from '@nestjs/common';
import { MessageService } from './services/message.service.js';

@Module({
  providers: [MessageService],
  exports: [MessageService],
})
export class CommonModule { }
