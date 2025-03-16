import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { PrismaClient } from '@prisma/client';

@Module({
    exports: [
        DatabaseService,
    ],
    providers: [
        PrismaClient,
        DatabaseService,
    ],
})
export class DatabaseModule {}
