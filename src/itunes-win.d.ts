declare module 'itunes-win' {
    export interface Track {
        name: string
        artist: string
        artwork: Artwork
    }
    export interface Artwork {
        format: ArtworkFormat
        data: Buffer
    }
    export type ArtworkFormat = 'PNG' | 'JPEG' | 'GIF'

    export function getCurrentTrack(callback: (err: Error, track: Track) => void): void
}