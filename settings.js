const { remote } = require("electron");
const userData = remote.app.getPath("userData");
const path = require("path");
const fs = require("fs");
const settingsPath = path.join(userData, "settings.json");
let _settings = null;

exports.save = function (settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings));
  _settings = settings;
};

exports.load = function () {
  if (!_settings) {
    if (!fs.existsSync(settingsPath)) _settings = {};
    else {
      const data = fs.readFileSync(settingsPath, { encoding: "utf8" });
      _settings = JSON.parse(data);
    }
  }

  return _settings;
};
