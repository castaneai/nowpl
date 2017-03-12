import { ipcRenderer } from 'electron'
import { NowPlayingTrack, NowPlayingTweet } from '../main'
const fileUrl = require('file-url')  // using require because error

function createTweetMessage(track: NowPlayingTrack) {
	return `#nowplaying ${track.name} by ${track.artist}`
}

ipcRenderer.on('log', (event, arg) => {
	console.log(arg)
})

let nowPlayingTrack: NowPlayingTrack

window.onload = () => {
	const tweetButtonElement = document.getElementById('tweet-button')
	const trackNameElement = document.getElementById('track-name')
	const artworkImageElement = document.getElementById('artwork')

	ipcRenderer.on('twitter-auth-reply', (event, arg) => {
		ipcRenderer.send('itunes-get-track')
	})

	ipcRenderer.on('itunes-get-track-reply', (event, arg) => {
		nowPlayingTrack = arg as NowPlayingTrack
		console.log('get track success')
		console.log(nowPlayingTrack)
		trackNameElement.innerHTML = createTweetMessage(nowPlayingTrack)
		artworkImageElement.style.backgroundImage = `url(${fileUrl(nowPlayingTrack.artworkPath)})`
	})

	tweetButtonElement.addEventListener('click', () => {
		if (!nowPlayingTrack) {
			console.log('nowplaying track not found')
			return
		}
		const tweet: NowPlayingTweet = {
			message: createTweetMessage(nowPlayingTrack),
			artworkPath: nowPlayingTrack.artworkPath,
		}
		ipcRenderer.send('twitter-post', tweet)
	})

	// first, twitter auth
	ipcRenderer.send('twitter-auth')
}
