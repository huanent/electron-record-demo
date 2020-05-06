const path = require("path");
let rtcServicePath = path.join(__dirname, "rtcService.js");
window.rtcService = require(rtcServicePath).rtcService;
if (window.onRtcAvailable) window.onRtcAvailable();
