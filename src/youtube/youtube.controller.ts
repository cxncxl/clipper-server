import { Controller, Get, Query } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { DatabaseService } from 'src/db/database.service';

@Controller('youtube')
export class YoutubeController {
    constructor(
        private readonly service: YoutubeService,
        private readonly db: DatabaseService,
    ) {}

    @Get('callback')
    public async authCallback(
        @Query('code') code: string,
    ) {
        const auth = await this.service.generateToken(code);

        await this.db.youtube_credentials.create(auth);
    }
}
