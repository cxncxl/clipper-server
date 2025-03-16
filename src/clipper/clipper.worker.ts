import { Input } from 'src/db/database.model';
import { ClipperService } from './clipper.service';
import { join } from 'path';
import { readFileSync } from 'fs';

export class ClipperWorker {
    private service: ClipperService;

    constructor(
    ) {
        this.service = new ClipperService();
    }

    public async run(
        getQueueCallback: () => Promise<Input[]>,
        insertClipCallback: (
            filePath: string,
            summary: string,
            parent: number,
        ) => Promise<void>,
        markInputProcessedCallback: (id: number) => Promise<void>,
    ) {
        const candidates = await getQueueCallback();

        if (candidates.length < 0) return;

        for (const candidate of candidates) {
            // todo: use statuses (enum) instead of processed
            await markInputProcessedCallback(candidate.id);

            const transcript = await this.service.transcribe(
                candidate.file_path,
            );

            const pieces = await this.service.split(
                transcript,
            );

            await this.service.cropAll(
                join(process.env.ROOT, candidate.file_path),
                pieces,
                join(process.env.ROOT, 'public', 'clips', candidate.id.toString()),
            );

            pieces.forEach((piece, i) => insertClipCallback(
                join(process.env.ROOT, 'public', 'clips', candidate.id.toString(), `${i}.mp4`),
                piece.summary,
                candidate.id,
            ));

            console.log('input ' + candidate.file_path + ' done!');
        }
    }
}
