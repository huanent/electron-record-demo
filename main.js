const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

function createWindow() {
  // 创建浏览器窗口
  let win = new BrowserWindow({
    width: 1500,
    height: 1200,

    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.webContents.openDevTools();
  const injectPath = path.join(__dirname, "/inject.js");
  const jsCode = fs.readFileSync(injectPath, "utf8");
  win.webContents.executeJavaScript(jsCode);
  //win.loadURL("http://localhost:8080/");
  win.loadFile(__dirname + "/index.html");
}

app.whenReady().then(createWindow);
