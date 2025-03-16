import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { mkdirSync } from 'fs';

import { config as dotenvConfig } from 'dotenv';

async function bootstrap() {
    dotenvConfig();

    try {
        mkdirSync('public');
    }
    catch (e) {}

    try {
        mkdirSync('public/inputs');
    }
    catch (e) {}

    try {
        mkdirSync('public/clips');
    }
    catch (e) {}
    
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
}
bootstrap();
