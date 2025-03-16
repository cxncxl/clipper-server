import {
    Controller,
    Get,
    HttpException,
    Param,
    Post,
    Query,
    Res,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Response } from 'express';

@Controller()
export class AppController {
    constructor(
      private readonly service: AppService,
    ) {}

    @Post('inputs')
    @UseInterceptors(
        FileInterceptor('file'),
    )
    public async uploadInput(
        @UploadedFile() file: Express.Multer.File,
    ) {
        const path = join('public', 'inputs', file.originalname);

        writeFileSync(
            path,
            file.buffer,
        );

        await this.service.saveInitialInput(path);
    }

    @Get('inputs')
    public async getInputs(
        @Query('processed') processed?: string,
    ) {
        return await this.service.getInputs({
            processed: !!processed && processed === 'true',
        });
    }

    @Get('clips')
    public async getClips(
        @Query('from') from?: string,
        @Query('uploaded') uploaded?: string,
    ) {
        let _from: number;

        if (from) {
            _from = parseInt(from);
            if (isNaN(_from)) throw new HttpException({
                error: 'from must be number',
            }, 400);
        }

        return await this.service.getClips({
            from_input: _from,
            uploaded: !!uploaded && uploaded === 'true',
        });
    }

    @Get('clips/:id')
    public async getClip(
        @Res() res: Response,
        @Param('id') id?: string,
    ) {
        if (!id) throw new HttpException({
            error: 'id must be specified',
        }, 400);

        const _id = parseInt(id);

        if (isNaN(_id)) throw new HttpException({
            error: 'id must be number',
        }, 400);

        const clip = await this.service.getClipById(_id);

        if (!existsSync(clip.file_path)) throw new HttpException({
            error: 'not found',
        }, 404);

        const file = createReadStream(clip.file_path);
        file.pipe(res);
    }
}
