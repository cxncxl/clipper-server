import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from './db/database.service';
import { existsSync } from 'fs';

import * as models from 'src/db/database.model';
import { ClipperWorker } from './clipper/clipper.worker';

@Injectable()
export class AppService implements OnModuleInit {
    private clipper: ClipperWorker;

    constructor(
        private readonly db: DatabaseService,
    ) {
        this.clipper = new ClipperWorker();
    }

    onModuleInit() {
        setInterval(() => this.clipper.run(
            this.db.getProcessQueue.bind(this.db),
            this.insertClip.bind(this),
            this.markInputProcessed.bind(this),
        ), 3 * 1000);
    }

    /**
     * save just uploaded file as input
     */
    public async saveInitialInput(
        filePath: string,
    ) {
        if (!existsSync(filePath))
            throw new FileNotExistsException();

        await this.db.inputs.create({
            file_path: filePath,
        });
    }

    public getInputs(where: Partial<models.Input>) {
        return this.db.inputs.get(where);
    }

    public getClips(where: Partial<models.Clip>) {
        return this.db.clips.get(where);
    }

    public async getClipById(id: number): Promise<models.Clip | undefined> {
        const candidates = await this.db.clips.get({
            id,
        });

        if (candidates.length < 1) return;

        return candidates[0];
    }

    private async insertClip(
        path: string,
        title: string,
        from: number,
    ) {
        await this.db.clips.create({
            from_input: from,
            file_path: path,
            title,
            uploaded: false,
        });
    }

    private async markInputProcessed(
        id: number,
    ) {
        await this.db.inputs.update({
            id,
            processed: true,
        });
    }

}

export class FileNotExistsException extends Error {}
