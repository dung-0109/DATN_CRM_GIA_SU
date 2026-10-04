import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { ClassesController } from './classes.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [CrmController, ClassesController],
  providers: [CrmService, PrismaService],
  exports: [CrmService],
})
export class CrmModule {}
