function toGrayScale(frame, grayBuffer) {
  let j = 0;

  for (let i = 0; i < frame.length; i++) {
    if (i % 4 === 0) {
      grayBuffer[j] = (frame[i] + frame[i + 1] + frame[i + 2]) / 3;
      j++;
    }
  }
  
  return grayBuffer;
}


let frameCount = 0;

function newScanner(player) {

  const canvas = document.querySelector("canvas");

  canvas.width = player.videoWidth;
  canvas.height = player.videoHeight;

  return {
    zxing: window["zxing-wasm"],
    drawArea: canvas,
    context: canvas.getContext("2d")
  };
}

function processVideo(src, scanner, grayBuffer) {
  scanner.context.drawImage(src, 0, 0, scanner.drawArea.width, scanner.drawArea.height);
  //console.log("Width: ", scanner.drawArea.width, ", height", scanner.drawArea.height);
  const frame = scanner.context.getImageData(0, 0, scanner.drawArea.width, scanner.drawArea.height);
  const scanMessage = document.getElementById("scan-result");
  toGrayScale(frame.data, grayBuffer);

  scanner.zxing
    .read(grayBuffer, frame.width, frame.height)
    .then(result => {
      if (result === "") {
        frameCount = frameCount === 60? 0 : frameCount + 1;
        scanMessage.textContent = `[Scanning] ${frameCount}`;
        setTimeout(() => processVideo(src, scanner, grayBuffer), 0);
      } else {
        scanMessage.textContent = result;
      }
    });
}


function startCapture() {
  console.log("Camera", document.getElementById("video-source").value);
  const cameraId = document.getElementById("video-source").value;
  const player = document.querySelector("video");

  window.navigator.mediaDevices
      .getUserMedia({ video: { deviceId: { exact: cameraId } } })
      .then(stream => {
        player.srcObject = stream;
        player.onloadedmetadata = () => {        
          const scanner = newScanner(player);  
          const area = scanner.drawArea.width * scanner.drawArea.height;
          const grayBuffer = new Uint8Array(new Array(area).fill(0).map(_ => 0));
          setTimeout(() => processVideo(player, scanner, grayBuffer), 0);
        };
      })
      .catch(e => { 
        player.stop();
        console.error(e.name + ": " + e.message);
        alert(e); 
      });
}

function getVideoDevices() {
  navigator.mediaDevices
    .enumerateDevices()
    .then(devices => { 
      let cameras = devices.filter(device => device.kind == "videoinput");
      listCameras(cameras);
    })
    .catch(function (e) {
      console.log(e.name + ": " + e.message);
    });
}

function listCameras(cameras) {
  let videoSourcesSelect = document.getElementById("video-source");  
  cameras
    .forEach(camera => {
      let option = new Option();
      option.value = camera.deviceId;
      option.text = camera.label || `Camera ${videoSourcesSelect.length + 1}`;
      videoSourcesSelect.appendChild(option);
  });
}

// function getVideoDevices() {
//   navigator.mediaDevices
//     .enumerateDevices()
//     .then(devices => {
//       let videoSourcesSelect = document.getElementById("video-source");

//       // Iterate over all the list of devices (InputDeviceInfo and MediaDeviceInfo)
//       devices
//         .filter(device => device.kind == "videoinput")
//         .forEach(device => {
//           let option = new Option();
//           option.value = device.deviceId;
//           option.text = device.label || `Camera ${videoSourcesSelect.length + 1}`;
//           videoSourcesSelect.appendChild(option);
//       });
//     }).catch(function (e) {
//       console.log(e.name + ": " + e.message);
//     });
// }

document.addEventListener( "DOMContentLoaded", function(event){
  document
    .querySelector("button")
    .addEventListener("click", startCapture);

  getVideoDevices();
  //listCameras();
  
}, false );