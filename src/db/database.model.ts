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
