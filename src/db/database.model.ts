/**
 * db model for input file
 * i.e. movies, podcasts, etc
 */
export type Input = {
    id: number;
    file_path: string;
    file_name: string;
    processed: boolean;
}

/**
 * db model for clip
 */
export type Clip = {
    id: number;
    file_path: string;
    from_input: number;
    title: string;
    uploaded: boolean;
}

export type TagSet = {
    id: number;
    tags: string;
    active: boolean;
}

export type UploadQueue = {
    id: number;
    /**
     * clip id
     */
    clip: number;
    /**
     * cred id
     */
    account: number;
    /**
     * tags id
     */
    tags: number;

    uploaded: boolean;
    /**
     * unix timestamp
     */
    uploaded_at: number;
}

/**
 * db model for platfrom (yt, tiktok, etc) auth creds
 */
export type PlatfromAuth = {
    id: number;
    email: string;
    access_token: string;
    refresh_token: string;
    /**
     * unix timestamp
     */
    expires_at: number;
}
