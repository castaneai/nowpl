import { ipcRenderer } from 'electron'
import { NowPlayingTrackInfo } from '../main'

window.onload = () => {
    ipcRenderer.on('twitter-auth-reply', (event, arg) => {
        console.log(arg)
    })
    ipcRenderer.send('twitter-auth')

    const tweetButtonElement = document.getElementById('tweet-button')
    let nowPlayingTrack: NowPlayingTrackInfo

    tweetButtonElement.addEventListener('click', () => {
        if (!nowPlayingTrack) {
            console.error('nowplaying track not found')
            return
        }
        const message = `#nowplaying ${nowPlayingTrack.name} - ${nowPlayingTrack.artist}`
        console.log(message)
        ipcRenderer.send('twitter-post', message)
    })

    const trackNameElement = document.getElementById('track-name')
    const artworkImageElement = document.getElementById('artwork')

    ipcRenderer.on('itunes-get-track-reply', (event, arg) => {
        nowPlayingTrack = arg as NowPlayingTrackInfo
        trackNameElement.innerHTML = `${nowPlayingTrack.name} - ${nowPlayingTrack.artist}`
        artworkImageElement.style.backgroundImage = `url(${nowPlayingTrack.artworkUrl})`
    })
    ipcRenderer.send('itunes-get-track')
}
