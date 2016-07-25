import electron from 'electron'
const app = electron.app
const BrowserWindow = electron.BrowserWindow

let mainWindow

app.on('ready', () => {
  mainWindow = new BrowserWindow({width: 400, height: 400})
  mainWindow.loadURL(`file://${__dirname}/renderer/index.html`)
  mainWindow.on('closed', () => mainWindow = null)
  mainWindow.setMenu(null)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})