import { app, BrowserWindow } from 'electron'

let mainWindow: Electron.BrowserWindow

app.on('ready', () => {
  mainWindow = new BrowserWindow({width: 400, height: 400, frame: false})
  mainWindow.loadURL(`file://${__dirname}/renderer/index.html`)
  // mainWindow.webContents.openDevTools()
  mainWindow.on('closed', (): void => mainWindow = null)
  mainWindow.setMenu(null)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
