const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

function createWindow() {
  // 创建浏览器窗口
  let win = new BrowserWindow({
    center: true,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.maximize();

  win.once("ready-to-show", () => {
    win.show();
  });

  win.loadURL("http://localhost:8080/");
  //win.loadFile(__dirname + "/index.html");

  //win.webContents.openDevTools();
  const injectPath = path.join(__dirname, "/inject.js");
  const jsCode = fs.readFileSync(injectPath, "utf8");
  win.webContents.executeJavaScript(jsCode);
}

app.whenReady().then(createWindow);
