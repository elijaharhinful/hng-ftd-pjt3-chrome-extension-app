console.log("Hi, I am content script and have been injected");

// inititalizing recorder data
// var recordedChunks = [];
// var mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
//   ? "video/webm; codecs=vp9"
//   : "video/webm";
// var recorder = null;
// var stream;
// var hmo_streamVideoId = randomId();
// var streamRequestEnded = false;
// var defaultScreen = "current_tab";

// initialize recorder
var recorder = null;
// set chunks array
var recordedChunks = [];

// run this function if the user agrees to share their screen
//you can come and change this to a a startRecording function and see if the user will still be seeing the request to record
function onAccessApproved(stream) {
  recorder = new MediaRecorder(stream); //create a new instance of the MediaRecorder class

  recorder.start(1000); //start the recording with a timeslice of one second

  recorder.onstop = function () {
    stream.getTracks().forEach(function (track) {
      if (track.readyState === "live") {
        track.stop();
      }
    });
  };
  recorder.addEventListener("dataavailable", async function (event) {
    recordedChunks.push(event.data);

    // send chunks to backend
    const chunk = [event.data];
    await sendChunkToAPI(chunk);
  });
  // recorder.ondataavailable = function(event){
  //     let recordedBlob  = event.data;
  //     let url = URL.createObjectURL(recordedBlob);

  //     let a = document.createElement("a");

  //     a.style.display = "none";
  //     a.href = url;
  //     a.download = "screen-recording.webm"

  //     document.body.appendChild(a);
  //     a.click();

  //     document.body.removeChild(a);

  //     URL.revokeObjectURL(url);
  // }
}

async function sendChunkToAPI(chunk) {
  if (chunk.length > 0) {
    // Get the binary data of the chunk
    // const binaryData = await chunk.arrayBuffer();

    // if there is more than one chunk when the sendChunkToApi function is called
    // convert those chunks to a blob that will be sent to the backend
    const videoBlob = new Blob(recordedChunks, {
      type: chunk[0].type,
    });

    // Create a new FormData object
    const formData = new FormData();

    // Append the binary data to the FormData object
    formData.append("chunk", videoBlob);

    // Make an HTTP request to the API with the FormData object
    try {
      const api_base_url =
        "https://screen-recorder-backend-api.up.railway.app/api";
      const url = `${api_base_url}/uploads/`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(`Response from api: ${data}`);
      // Handle the response from the API.
      window.open("https://google.com");
    } catch (error) {
      // Handle the error.
      console.error(`There was an error while making api request: ${error}`);
    }
  } else {
    console.log("There is no streaming chunk");
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "request_recording") {
    //this message is coming from the popup.js
    console.log("requesting recording");

    sendResponse(`processed: ${message.action}`);

    navigator.mediaDevices
      .getDisplayMedia({
        audio: true, // when set to false the video is recorded without audio
        video: {
          width: 9999999999,
          height: 9999999999,
        },
      })
      .then((stream) => {
        onAccessApproved(stream); //if the requesting recording problem persists change this to a startRecording function
      });
  }

  if (message.action === "stopvideo") {
    console.log("stopping video");
    sendResponse(`processed: ${message.action}`);
    if (!recorder) return console.log("no recorder");

    recorder.stop();
  }
});
