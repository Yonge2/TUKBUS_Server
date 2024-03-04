import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChattingsService } from './chattings.service';
import { CreateChattingDto } from './dto/create-chatting.dto';
import { UpdateChattingDto } from './dto/update-chatting.dto';

@Controller('chattings')
export class ChattingsController {
  constructor(private readonly chattingsService: ChattingsService) {}

  @Post()
  create(@Body() createChattingDto: CreateChattingDto) {
    return this.chattingsService.create(createChattingDto);
  }

  @Get()
  findAll() {
    return this.chattingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chattingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChattingDto: UpdateChattingDto) {
    return this.chattingsService.update(+id, updateChattingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chattingsService.remove(+id);
  }
}
