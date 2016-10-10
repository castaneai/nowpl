import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import { UserStorage } from './user-storage'
import { Twitter } from './twitter'
import * as ITunesWin from 'itunes-win'
const tempfile = require('tempfile')
import * as fs from 'fs'

export interface NowPlayingTrackInfo {
  name: string
  artist: string
  artworkUrl: string
}

let twitter: Twitter
let nowPlayingArtworkImagePath: string

ipcMain.on('itunes-get-track', (event, arg) => {
  ITunesWin.getCurrentTrack((err, track) => {
    if (err) {
      return
    }
    const image = nativeImage.createFromBuffer(track.artwork.data)
    const tempFilePath = tempfile('.png')
    fs.writeFile(tempFilePath, image.toPNG(), (err) => {
      if (err) {
        return
      }
      track.artwork.data = null
      nowPlayingArtworkImagePath = tempFilePath
      const trackInfo: NowPlayingTrackInfo = {
        name: track.name,
        artist: track.artist,
        artworkUrl: `file:///${nowPlayingArtworkImagePath.split('\\').join('/')}`
      }
      event.sender.send('itunes-get-track-reply', trackInfo)
    })
  })
})

ipcMain.on('twitter-auth', (event, arg) => {
  UserStorage.getTwitterCredentials()
  .then(credentials => {
    twitter = new Twitter(credentials)
  }, err => {
    // TODO: display error.
    console.error(err)
  })
})

ipcMain.on('twitter-post', (event, arg) => {
  const message = arg as string
  twitter.postTweetWithImage(message, nowPlayingArtworkImagePath)
})

let mainWindow: Electron.BrowserWindow

app.on('ready', () => {
  mainWindow = new BrowserWindow({width: 400, height: 400, frame: false})
  mainWindow.loadURL(`file://${__dirname}/renderer/index.html`)
  mainWindow.webContents.openDevTools()
  mainWindow.on('closed', (): void => mainWindow = null)
  mainWindow.setMenu(null)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
