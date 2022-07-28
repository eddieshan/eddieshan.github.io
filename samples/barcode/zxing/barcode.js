const zxing = window["zxing-wasm"];

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let W = 0;
let H = 0;
let buf;

function toGrayScale(frame) {
  let j = 0;

  for (let i = 0; i < frame.length; i++) {
    if (i % 4 === 0) {
      buf[j] = (frame[i] + frame[i + 1] + frame[i + 2]) / 3;
      j++;
    }
  }
  
  return buf;
}


let frame_count = 0;

function processVideo(src) {
  ctx.drawImage(src, 0, 0, W, H);
  const frame = ctx.getImageData(0, 0, W, H);
  const scanMessage = document.getElementById("scan-result");

  zxing
    .read(toGrayScale(frame.data), frame.width, frame.height)
    .then(result => {

      if (result === "") {
        frame_count = frame_count === 60? 0 : frame_count + 1;
        scanMessage.textContent = `[Scanning] ${frame_count}`;
        setTimeout(() => processVideo(src, false), 0);
      } else {
        scanMessage.textContent = result;
      }
    });
}

function clearBuffer(w, h) {
  W = w;
  H = h;
  canvas.width = W;
  canvas.height = H;
  buf = new Uint8Array(new Array(W * H).fill(0).map(_ => 0))
}

function init(player, stream) {
    player.srcObject = stream;

    player.onloadedmetadata = () => {
        clearBuffer(player.videoWidth, player.videoHeight);
        setTimeout(() => processVideo(player, false), 0)
    };
}

document
    .querySelector("button")
    .addEventListener("click", () => {

        const player = document.querySelector("video");
        canvas.style = "transform: scale(-1, 1);";

        window.navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(mediaStream => init(player, mediaStream))
    .catch(e => { player.stop(); alert(e); });
})

// document.addEventListener( "DOMContentLoaded", function(event){
// }, false );
