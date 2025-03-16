import { Injectable } from '@nestjs/common';
import { Clip, Gemini } from 'clipper-service/src/llm/gemini';
import { Ffmpeg } from 'clipper-service/src/video/ffmpeg';
import { Whisper } from 'clipper-service/src/whisper/whisper';
import { existsSync, readFileSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ClipperService {
    private gemini: Gemini;
    private ffmpeg: Ffmpeg;

    constructor() {
        this.gemini = new Gemini();
        this.ffmpeg = new Ffmpeg();
    }

    public async transcribe(path: string, removeWhenDone = false) {
        const filename = path.split('.')[0];

        await Whisper.transcript(path);

        await new Promise(resolve => setTimeout(resolve, 30000));

        const outPath = join(process.env.ROOT, `${filename}.wav.csv`);

        if (!existsSync(
            outPath,
        )) {
            throw new ClipperWhisperException('transcript file wasn\'t created');
        }

        const transcript = readFileSync(outPath).toString();

        if (!transcript || transcript.length < 0) {
            throw new ClipperWhisperException(
                'transcript is empty',
            );
        }

        try {
            unlinkSync(`${filename}.wav`);
        }
        catch (e) {}

        try {
            unlinkSync(`${filename}.wav.csv`);
        }
        catch (e) {}

        if (removeWhenDone === true) {
        try {
            unlinkSync(path);
        }
        catch (e) {}
        }

        return transcript;
    }

    public async split(transcript: string) {
        const pieces = await this.gemini.runAnalyze(transcript);

        if (!pieces || pieces.length < 1)
            throw new ClipperGeminiException('pieces are empty');

        return pieces;
    }

    public async cropAll(sourcePath: string, pieces: Clip[], outDir: string) {
        if (!existsSync(sourcePath)) throw new ClipperException(
            `file ${sourcePath} does not exist`,
        );

        if (!existsSync(outDir)) {
            try {
                mkdirSync(outDir);
            }
            catch (e) {
                throw new ClipperException(
                    `failed to create dir ${outDir}`,
                );
            }
        }

        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];

            try {
                await this.ffmpeg.crop(
                    sourcePath,
                    piece.start,
                    piece.end,
                    join(outDir, `${i}.mp4`),
                );
            }
            catch (e) {
                console.error(e);
            }
        }
    }
}

export class ClipperException extends Error {}
export class ClipperWhisperException extends Error {}
export class ClipperGeminiException extends Error {}
