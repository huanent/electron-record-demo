const { desktopCapturer, remote } = require("electron");
const fs = require("fs");
const path = require("path");
const fixWebmDuration = require("fix-webm-duration");
const Settings = require("./settings");

async function getSources() {
  const sources = await desktopCapturer.getSources({
    types: ["window", "screen"],
  });
  return sources;
}

async function getStream(id) {
  return await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: id, //"screen:0:0",
      }
    },
  });
}

async function record(stream, filename) {
  let startTime = 0;
  try {
    var audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    stream.addTrack(audio.getAudioTracks()[0]);
  } catch (error) {
    console.log("no audio devices");
  }

  const options = {
    mimeType: "video/webm; codecs=vp9",
    audioBitsPerSecond: 64000,
    videoBitsPerSecond: 600000,
  };
  let mediaRecorder = new MediaRecorder(stream, options);
  const recordedChunks = [];

  mediaRecorder.ondataavailable = (e) => {
    recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = async function () {
    const bb = new Blob(recordedChunks, {
      type: "video/webm; codecs=vp9",
    });

    fixWebmDuration(bb, Date.now() - startTime, async (blob) => {
      var chunkSize = 1024 * 1024; // 每片1M大小
      var offset = 0; // 偏移量

      do {
        var end = offset + chunkSize;
        if (end > blob.size) end = blob.size;
        var chunk = blob.slice(offset, end);
        offset = end;
        const buffer = Buffer.from(await chunk.arrayBuffer());
        let filePath = path.join(getRecordSavePath(), filename + ".webm");
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        fs.appendFile(filePath, buffer, () =>
          console.log(((offset * 100) / blob.size).toFixed(0) + "% video saved")
        );
      } while (offset < blob.size);

      openRecordSaveFolder();
    });
  };

  startTime = Date.now();
  mediaRecorder.start();
  return mediaRecorder;
}

async function selectRecordSavePath() {
  return new Promise(async (rs, rj) => {
    let result = await remote.dialog.showOpenDialog(null, {
      defaultPath: getRecordSavePath(),
      properties: ["openDirectory", "createDirectory", "promptToCreate"],
    });

    if (result.canceled || !result.filePaths.length) rs(undefined);
    else {
      let path = result.filePaths[0];
      const settings = Settings.load();
      settings.savePath = path;
      Settings.save(settings);
      rs(path);
    }
  });
}

function getRecordSavePath() {
  const settings = Settings.load();

  if (!settings.savePath) {
    settings.savePath = path.join(
      remote.app.getPath("documents"),
      "classVideos"
    );

    Settings.save(settings);
  }

  if (!fs.existsSync(settings.savePath)) {
    fs.mkdirSync(settings.savePath);
  }

  return settings.savePath;
}

function openRecordSaveFolder(folder) {
  var savePath = getRecordSavePath();
  if (folder) savePath = path.join(savePath, folder);
  remote.shell.openItem(savePath);
}

exports.rtcService = {
  getSources,
  getStream,
  record,
  selectRecordSavePath,
};
