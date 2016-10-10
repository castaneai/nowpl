import * as ITunesWin from 'itunes-win'

/** アートワーク画像のmime typeを取得 */
const getArtworkMimeType = (artwork: ITunesWin.Artwork) => {
        switch (artwork.format) {
            case 'JPEG': return 'image/jpeg'
            case 'PNG': return 'image/png'
            case 'GIF': return 'image/gif'
            default: throw new Error(`invalid artwork format: ${artwork.format}`)
        }
    }

/** アートワーク画像をData URI形式で取得 */
const getArtworkDataURI = (artwork: ITunesWin.Artwork) => `data:${getArtworkMimeType(artwork)};base64,${artwork.data.toString('base64')}`

window.onload = () => {
    const trackNameElement = document.querySelector('#track-name')
    const artworkImageElements = document.querySelectorAll('.artwork') as NodeListOf<HTMLElement>

    ITunesWin.getCurrentTrack((err, track) => {
        if (err === null) {
            trackNameElement.innerHTML = `${track.name} - ${track.artist}`
            const imageDataURI = getArtworkDataURI(track.artwork)
            for (let i = 0; i < artworkImageElements.length; i++) {
                artworkImageElements[i].style.backgroundImage = `url(${imageDataURI})`
            }
        }
    })
}
