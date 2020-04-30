const { app, BrowserWindow } = require("electron");

function createWindow() {
  // 创建浏览器窗口
  let win = new BrowserWindow({
    width: 1500,
    height: 1200,

    webPreferences: {
      nodeIntegration: true,
    },
  });

  // 加载index.html文件
  //win.loadURL("http://localhost:8080/");

  win.webContents.openDevTools();
  win.webContents.executeJavaScript(`
  let basePath = process.cwd();
  window.rtcService = require(basePath + '/rtcService.js').rtcService;
  `);
  win.loadFile("./index.html");
}

app.whenReady().then(createWindow);
