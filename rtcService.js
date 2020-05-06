const { desktopCapturer } = require("electron");
const fs = require("fs");

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
  try {
    var audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    stream.addTrack(audio.getAudioTracks()[0]);
  } catch (error) {
    console.log("no audio devices");
  }

  const options = { mimeType: "video/webm; codecs=vp9" };
  let mediaRecorder = new MediaRecorder(stream, options);
  const recordedChunks = [];

  mediaRecorder.ondataavailable = (e) => {
    recordedChunks.push(e.data);
    console.log(e.data);
  };

  mediaRecorder.onstop = async function () {
    const blob = new Blob(recordedChunks, {
      type: "video/webm; codecs=vp9",
    });
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
  };

  mediaRecorder.start();
  return mediaRecorder;
}

exports.rtcService = {
  getSources,
  getStream,
  record,
};
