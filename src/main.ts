import { ipcMain } from 'electron'
import { UserStorage } from './user-storage'
import { Twitter } from './twitter'
import * as ITunesNowPlaying from 'itunes-nowplaying-win'
import * as tempfile from 'tempfile'

export interface NowPlayingTrack {
	name: string
	artist: string
	artworkPath: string
}

export interface NowPlayingTweet {
	message: string
	artworkPath: string
}

let twitter: Twitter

ipcMain.on('itunes-get-track', (event, arg) => {
	ITunesNowPlaying.getNowplaying((err, track) => {
		// TODO: error reporting to renderer
		if (err) {
			console.error(err)
			return
		}
		const nowPlayingTrackInfo: NowPlayingTrack = {
			name: track.name,
			artist: track.artist,
			artworkPath: '',
		}
		if (track.artworkCount > 0) {
			const tempArtworkPath = tempfile(`.${track.artworkFormat.toLowerCase()}`)
			ITunesNowPlaying.saveNowplayingArtworkToFile(tempArtworkPath, (errr) => {
				if (errr) {
					console.error(errr)
				}
				if (!errr) {
					nowPlayingTrackInfo.artworkPath = tempArtworkPath
				}
				event.sender.send('itunes-get-track-reply', nowPlayingTrackInfo)
			})
		} else {
			event.sender.send('itunes-get-track-reply', nowPlayingTrackInfo)
		}
	})
})

ipcMain.on('twitter-auth', (event, arg) => {
	UserStorage.getTwitterCredentials().then(credentials => {
		twitter = new Twitter(credentials)
		event.sender.send('twitter-auth-reply', credentials)
	}, err => {
		event.sender.send('twitter-auth-reply', err)
	})
})

ipcMain.on('twitter-post', (event, arg) => {
	const tweet = arg as NowPlayingTweet
	twitter.postTweetWithImage(tweet.message, tweet.artworkPath).then((data) => {
		event.sender.send('log', data)
	}, err => {
		event.sender.send('log', err)
	})
})
