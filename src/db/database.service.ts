import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import * as models from './database.model';

/**
 * todo: replace inner objects with abstract class realizations
 */
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

    public youtube_credentials = {
        get: (
            where: Partial<models.PlatfromAuth>,
        ) => {
            return this.db.youtube_credentials.findMany({
                where,
            });
        },

        create: (
            creds: Partial<models.PlatfromAuth>,
        ) => {
            return this.db.youtube_credentials.create({
                data: {
                    access_token: creds.access_token,
                    refresh_token: creds.refresh_token,
                    email: creds.email,
                    expires_at: creds.expires_at,
                },
            });
        }
    };

    public tags = {
        get: (
            where: Partial<models.TagSet>,
        ) => {
            return this.db.tags.findMany({
                where,
            });
        },

        create: (
            tags: Partial<models.TagSet>,
        ) => {
            return this.db.tags.create({
                data: {
                    tags: tags.tags,
                    active: tags.active,
                },
            });
        },

        update: (
            tags: Partial<models.TagSet>,
        ) => {
            if (!tags.id) throw new InvalidInputDbException(
                'no id in tags object',
            );

            return this.db.tags.update({
                where: {
                    id: tags.id,
                },
                data: tags,
            });
        },

        delete: (
            tags: Partial<models.TagSet>,
        ) => {
            if (!tags.id) throw new InvalidInputDbException(
                'no id in tags object',
            );

            return this.db.tags.delete({
                where: {
                    id: tags.id,
                },
            });
        }
    };

    public upload_queue = {
        get: (
            where: Partial<models.UploadQueue>,
        ) => {
            return this.db.upload_queue.findMany({
                where,
            });
        },

        create: (
            entry: Partial<models.UploadQueue>,
        ) => {
            return this.db.upload_queue.create({
                data: {
                    clip: entry.clip,
                    account: entry.account,
                    tags: entry.tags,
                    uploaded: false,
                    uploaded_at: null,
                },
            });
        },

        update: (
            entry: Partial<models.UploadQueue>,
        ) => {
            if (!entry.id) throw new InvalidInputDbException(
                'no id in given upload_queue object',
            );

            return this.db.upload_queue.update({
                where: {
                    id: entry.id,
                },
                data: entry,
            });
        },

        delete: (
            entry: Partial<models.UploadQueue>,
        ) => {
            if (!entry.id) throw new InvalidInputDbException(
                'no id in given upload_queue object',
            );

            return this.db.upload_queue.delete({
                where: {
                    id: entry.id,
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
        return this.upload_queue.get({
            uploaded: false,
        });
    }

    public async getLastUploadedDateForAccount(account: models.PlatfromAuth) {
        const rows = await this.upload_queue.get({
            account: account.id,
            uploaded: true,
        });

        // sort by uploaded_date desc
        const row = rows.sort((a, b) => b.uploaded_at - a.uploaded_at)[0];

        return new Date(row.uploaded_at!);
    }
}

export class InvalidDbOperation extends Error {}
export class InvalidInputDbException extends Error {}
