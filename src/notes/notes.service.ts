import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity.js';
import { CreateNoteDto } from './dto/create-note.dto.js';
import { UpdateNoteDto } from './dto/update-note.dto.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepo: Repository<Note>,
  ) {}

  async create(userId: string, dto: CreateNoteDto) {
    const note = this.noteRepo.create({
      ...dto,
      tags: dto.tags ?? [],
      userId,
    });
    return this.noteRepo.save(note);
  }

  async findAll(userId: string, query: PaginationDto) {
    const { page, limit, search, tag } = query;

    const qb = this.noteRepo
      .createQueryBuilder('note')
      .where('note.userId = :userId', { userId });

    if (search) {
      qb.andWhere('(note.title ILIKE :search OR note.content ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (tag) {
      qb.andWhere(':tag = ANY(note.tags)', { tag });
    }

    const [data, total] = await qb
      .orderBy('note.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const note = await this.noteRepo.findOne({ where: { id, userId } });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async update(userId: string, id: string, dto: UpdateNoteDto) {
    const note = await this.findOne(userId, id);
    Object.assign(note, dto);
    return this.noteRepo.save(note);
  }

  async remove(userId: string, id: string) {
    const note = await this.findOne(userId, id);
    await this.noteRepo.remove(note);
    return { id };
  }
}