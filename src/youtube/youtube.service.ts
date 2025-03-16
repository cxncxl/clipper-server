import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { OAuth2Client } from 'google-auth-library';
import { youtube } from 'googleapis/build/src/apis/youtube';
import { join } from 'path';

import { Clip, PlatfromAuth, TagSet } from 'src/db/database.model';
import { DatabaseService } from 'src/db/database.service';

/**
 * Helper for stuff related to Youtube like auth, upload video, etc
 */
@Injectable()
export class YoutubeService {
    private readonly creds: any;
    private readonly client: OAuth2Client;

    constructor(
        private readonly db: DatabaseService,
    ) {
        const credsJson = readFileSync(
            join(process.env.ROOT, 'yt-creds.json'),
        );
        this.creds = JSON.parse(credsJson.toString());
        
        this.client = new OAuth2Client(
            this.creds.web.client_id,
            this.creds.web.client_secret,
            this.creds.web.redirect_uris[0],
        );
    }

    public async uploadVideo(
        creds: PlatfromAuth,
        clip: Clip,
        tags: TagSet,
    ) {
        if (!existsSync(
            join(process.env.ROOT, clip.file_path),
        )) {
            throw new YoutubeException(
                'clip does not exist',
            );
        }

        this.client.setCredentials(creds);

        const category = 24; // 'entertainment', see https://developers.google.com/youtube/v3/docs/videoCategories/

        const yt = youtube('v3');

        await yt.videos.insert({
            media: {
                mimeType: 'video/mp4', // todo: maybe will be different in future. for now mp4 is hardcoded in ffmpeg, so hardcoded here
                body: readFileSync(
                    join(process.env.ROOT, clip.file_path),
                ),
            },
            requestBody: {
                snippet: {
                    categoryId: category.toString(),
                    title: clip.title,
                    tags: tags.tags.split(','),
                    description: clip.title,
                },
            },
        }, {});
    }

    public async watchQueue() {
        const queue = await this.db.getUploadQueue();

        for (const row of queue) {
            const accounts = await this.db.youtube_credentials.get({
                id: row.account,
            });

            if (accounts.length < 1) throw new YoutubeException(
                `clip ${row.id} saved in queue with non-existing account`,
            );

            const account = accounts[0];

            const clips = await this.db.clips.get({
                id: row.clip,
            });

            if (clips.length < 1) throw new YoutubeException(
                `row ${row.id} saved with non-existing clip`,
            );

            const clip = clips[0];

            const tags = await this.db.tags.get({
                id: row.tags,
            });

            if (tags.length < 1) throw new YoutubeException(
                `row ${row.id} saved with non-existing tags`,
            );

            const tag = tags[0];

            try {
                await this.uploadVideo(
                    account,
                    clip,
                    tag,
                );

                await this.db.upload_queue.update({
                    id: row.id,
                    uploaded: true,
                    uploaded_at: new Date().getTime(),
                });
            }
            catch (e) {
                throw new YoutubeException(e);
            }


        }
    }

    public async generateToken(code: string): Promise<PlatfromAuth> {
        const token = await this.client.getToken(code);
        this.client.setCredentials(token.tokens);

        const self = await this.client.getTokenInfo(token.tokens.access_token);

        const auth = {
            id: -1,
            access_token: token.tokens.access_token!,
            refresh_token: token.tokens.refresh_token!,
            email: self.email!,
            expires_at: token.tokens.expiry_date!,
        }

        await this.db.youtube_credentials.create(auth);

        return auth;
    }

    public async refreshToken(creds: PlatfromAuth): Promise<PlatfromAuth> {
        if (creds.expires_at > new Date().getTime())
            return creds;

        this.client.setCredentials(creds);
        const refreshed = await this.client.refreshAccessToken();

        return {
            ...creds,
            access_token: refreshed.credentials.access_token!,
            refresh_token: refreshed.credentials.refresh_token!,
            expires_at: refreshed.credentials.expiry_date!,
        };
    }

    public getAuthUrl() {
        const authUrl = this.client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/youtube.upload',
            ],
        });

        return authUrl;
    }
}

class YoutubeException extends Error {}
