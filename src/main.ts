import { app, BrowserWindow, ipcMain } from 'electron'
import { UserStorage } from './user-storage'

ipcMain.on('twitter-auth', (event, args) => {
  UserStorage.getTwitterCredentials()
  .then(credentials => {
    event.sender.send('twitter-auth-reply', credentials)
  }, err => {
    // TODO: display error.
    console.error(err)
  })
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
