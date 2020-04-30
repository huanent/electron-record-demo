const { desktopCapturer } = require("electron");
const fs = require("fs");

exports.getSources = async function () {
  const sources = await desktopCapturer.getSources({
    types: ["window", "screen"],
  });
  return sources;
};

exports.getStream = async function () {
  var stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: "screen:0:0",
      },
    },
  });

  // var videoElement = document.getElementById("video");
  // videoElement.srcObject = stream;
  // videoElement.play();

  const options = { mimeType: "video/webm; codecs=vp9" };
  let mediaRecorder = new MediaRecorder(stream, options);
  const recordedChunks = [];
  mediaRecorder.ondataavailable = (e) => {
    recordedChunks.push(e.data);
  };

  setTimeout(() => {
    mediaRecorder.stop();
  }, 15000);

  mediaRecorder.onstop = async function () {
    const blob = new Blob(recordedChunks, {
      type: "video/webm; codecs=vp9",
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    console.log(recordedChunks)
    fs.writeFile("1.mp4", buffer, () =>
      console.log("video saved successfully!")
    );
  };

  mediaRecorder.start();
  // var recorder = new MediaRecorder(stream);

  // recorder.start(2);

  // // setTimeout(() => {
  // //   recorder.stop();
  // //   console.log("结束");
  // // }, 3000);

  // recorder.ondataavailable = (event) => {
  //   let blob = new Blob([event.data], {
  //     type: "video/mp4",
  //   });

  //   let fr = new FileReader();
  //   fr.onload = function () {
  //     let buffer = new Buffer(fr.result);
  //     fs.appendFile("1.mp4", buffer, {}, () => {});
  //   };
  //   fr.readAsArrayBuffer(blob);
  // };
};
