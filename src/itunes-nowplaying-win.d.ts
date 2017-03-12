declare module 'itunes-nowplaying-win' {
    export interface Track {
        name: string
        artist: string
        artworkCount: number
        artworkFormat: ArtworkFormat
    }
    export type ArtworkFormat = 'PNG' | 'JPEG' | 'GIF'

    export function getNowplaying(callback: (err: Error, track: Track) => void): void
    export function saveNowplayingArtworkToFile(path: string, callback: (err: Error) => void): void
}