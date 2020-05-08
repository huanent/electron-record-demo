const path = require("path");
const fs = require("fs");
const basePath = process.cwd();
console.log(process)
let rtcServicePath = path.join(basePath, "rtcService.js");

if (!fs.existsSync(rtcServicePath)) {
  rtcServicePath = path.join(process.resourcesPath, "app", "rtcService.js");
}

if (!fs.existsSync(rtcServicePath)) {
  rtcServicePath = path.join(process.resourcesPath, "app.asar", "rtcService.js");
}

window.rtcService = require(rtcServicePath).rtcService;
if (window.onRtcAvailable) window.onRtcAvailable();
