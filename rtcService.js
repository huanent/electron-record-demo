const { desktopCapturer } = require("electron");
const fs = require("fs");
const fixWebmDuration = require("fix-webm-duration");

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
      },
    },
  });
}

async function record(stream, path) {
  var startTime = Date.now();
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
        fs.appendFile(path, buffer, () =>
          console.log(((offset * 100) / blob.size).toFixed(0) + "% video saved")
        );
      } while (offset < blob.size);
    });
  };

  mediaRecorder.start();
  return mediaRecorder;
}

exports.rtcService = {
  getSources,
  getStream,
  record,
};
