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
  var audio = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });

  stream.addTrack(audio.getAudioTracks()[0]);

  const options = { mimeType: "video/webm; codecs=vp9" };
  let mediaRecorder = new MediaRecorder(stream, options);
  const recordedChunks = [];

  mediaRecorder.ondataavailable = (e) => {
    recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = async function () {
    const blob = new Blob(recordedChunks, {
      type: "video/webm; codecs=vp9",
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    fs.writeFile(path, buffer, () => console.log("video saved successfully!"));
  };

  mediaRecorder.start();
  return mediaRecorder;
}

exports.rtcService = {
  getSources,
  getStream,
  record,
};
