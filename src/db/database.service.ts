import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import * as models from './database.model';

@Injectable()
export class DatabaseService {
    constructor(
        private db: PrismaClient,
    ) {}

    public inputs = {
        get: (
            where?: Partial<models.Input>,
        ): Promise<models.Input[]> => {
            return this.db.inputs.findMany({
                where,
            });
        },

        create: (
            input: Partial<models.Input>,
        ) => {
            if (!input.file_path)
                throw new InvalidInputDbException(
                    'required field `file_path` is missing on given object',
                );

            return this.db.inputs.create({
                data: {
                    file_path: input.file_path,
                    file_name: input.file_name,
                    processed: false,
                },
            });
        },

        update: (
            input: Partial<models.Input>,
        ) => {
            if (!input.id)
                throw new InvalidInputDbException(
                    'id missing on given record',
                );

            return this.db.inputs.update({
                data: input,
                where: {
                    id: input.id,
                },
            });
        },

        delete: (
            input: Partial<models.Input>,
        ) => {
            throw new InvalidDbOperation('delete not supported on inputs');
        }
    };

    public clips = {
        get: (
            where?: Partial<models.Clip>,
        ): Promise<models.Clip[]> => {
            return this.db.clips.findMany({
                where,
            });
        },

        create: (
            clip: Partial<models.Clip>,
        ) => {
            if (!clip.file_path) throw new InvalidInputDbException(
                'required field `file_path` is missing in given Clip object',
            );

            if (!clip.from_input) throw new InvalidInputDbException(
                'required field `from_input` is missing in given Clip object',
            );

            if (!clip.title) throw new InvalidInputDbException(
                'required field `title` is missing in given Clip object',
            );


            return this.db.clips.create({
                data: {
                    file_path: clip.file_path,
                    from_input: clip.from_input,
                    title: clip.title,
                    uploaded: false,
                },
            });
        },

        update: (
            clip: Partial<models.Clip>,
        ) => {
            return this.db.clips.update({
                data: clip,
                where: {
                    id: clip.id,
                },
            });
        },

        delete: (
            clip: Partial<models.Clip>,
        ) => {
            if (!clip.id) throw new InvalidInputDbException(
                'no id in provided Clip object',
            );

            return this.db.clips.delete({
                where: {
                    id: clip.id,
                },
            });
        }
    };

    public getProcessQueue() {
        return this.inputs.get({
            processed: false,
        });
    }

    public getUploadQueue() {
        return this.clips.get({
            uploaded: false,
        });
    }
}

export class InvalidDbOperation extends Error {}
export class InvalidInputDbException extends Error {}
