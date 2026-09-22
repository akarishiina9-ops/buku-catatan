import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './note.entity.js';
import { NotesService } from './notes.service.js';
import { NotesController } from './notes.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Note]), PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}