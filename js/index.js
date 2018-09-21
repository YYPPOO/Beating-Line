const cE = (type,v0,v1,k2,v2) => {
    let myElement = document.createElement(type);
    myElement.className = v0;
    myElement.textContent = v1 ? v1:"";
    myElement[k2] = v2;
    return myElement;
};

let state = [
    [1,0,1,0],
    [0,1,0,1],
    [1,1,1,1],
    [0,0,0,1],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,1,0],
    [1,0,0,0]
];

let context;
let bufferLoader;
let bpm = 120;
let t = 60/bpm/2;
let p=0;
let length = 4;
// let intervalID;

let trackName = ["Kick","Snare","Close Hat","Open Hat","Tom","Clap","Conga","Atm"];
let trackList = [];
let padList = [[],[],[],[],[],[],[],[]];

window.onload = init;

function init() {
  // Fix up prefixing
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();

  bufferLoader = new BufferLoader(
    context,
    [
      "sound/0kick0.wav",
      "sound/1snare0.wav",
      "sound/2closeHat0.wav",
      "sound/3openHat0.wav",
      "sound/4tom0.wav",
      "sound/5clap0.wav",
      "sound/6conga0.wav",
      "sound/7atm0.wav"
    ],
    finishedLoading
    );

  bufferLoader.load();
  createPad();
}

function playByPoint(bufferList,p){
    let startTime = context.currentTime;
    for (let i=0;i<8;i++){
        state[i][p%4] && playSound(bufferList[i],startTime);
        padList[i][(p-1)%4] && padList[i][(p-1)%4].classList.remove("bOn");
        padList[i][3] && padList[i][3].classList.remove("bOn");
        padList[i][p%4].classList.add("bOn");
        // for (let j=0;j<4;j++){
        //     state[i][j] && playSound(bufferList[i],startTime+j*t);
        // }
    }
}

function finishedLoading(bufferList) {
    // let start = function(){
    //     setInterval(function(){
    //         play(bufferList)
    //     },t*4000)
    // };
    let intervalID;
    document.getElementById("play").addEventListener("click",function(){
        intervalID = setInterval(function(){
            playByPoint(bufferList,p);
            p++;
        },t*1000);
        document.getElementById("stop").addEventListener("click",stop);
    });

    let stop = function(e) {
        clearInterval(intervalID);
        for (let i=0;i<8;i++){
            padList[i][(p-1)%4].classList.remove("bOn");
        }
        p=0;
        document.getElementById("stop").removeEventListener("click",stop);
    }
//   // Create two sources and play them both together.
//   let source1 = context.createBufferSource();
//   let source2 = context.createBufferSource();
//   source1.buffer = bufferList[0];
//   source2.buffer = bufferList[1];
//   source1.connect(context.destination);
//   source2.connect(context.destination);
//   source1.start(0);
//   source2.start(0);
}


function playSound(buffer,time) {
  let source = context.createBufferSource(); // creates a sound source
  source.buffer = buffer;                    // tell the source which sound to play
  source.connect(context.destination);       // connect the source to the context's destination (the speakers)
  source.start(time);                           // play the source now
                                             // note: on older systems, may have to use deprecated noteOn(time);
}
// let dogBarkingBuffer = null;
// // Fix up prefixing

// function loadSound(url) {
//   let request = new XMLHttpRequest();
//   request.open("GET", url, true);
//   request.responseType = "arraybuffer";

//   // Decode asynchronously
//   request.onload = function() {
//     context.decodeAudioData(request.response, function(buffer) {
//       dogBarkingBuffer = buffer;
//     }, onError);
//   }
//   request.send();
// }

// BufferLoader setting ----------------------------------------------------
function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
  }

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    let loader = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
            request.response,
            function(buffer) {
                if (!buffer) {
                    alert("error decoding file data: " + url);
                    return;
                }
                loader.bufferList[index] = buffer;
                if (++loader.loadCount == loader.urlList.length) {
                    loader.onload(loader.bufferList);
                }
            },
            function(error) {
                console.error("decodeAudioData error", error);
            }
        );
    }

    request.onerror = function() {
        alert("BufferLoader: XHR error");
    }

    request.send();
}

BufferLoader.prototype.load = function() {
    for (let i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
}

// create pad --------------------------------------------------------------
function createPad(){
    let padDiv = document.getElementById("padDiv");
    for(let i=0;i<8;i++){
        trackList[i] = cE("div","track",trackName[i]);
        padDiv.appendChild(trackList[i]);
        for(let j=0;j<4;j++){
            padList[i][j] = cE("div",j%4?"b":"bp","","id",i+"-"+j);
            padList[i][j].addEventListener("click",function(){
                state[i][j] = !state[i][j];
                padList[i][j].classList.toggle("b"+i);
            })
            state[i][j] && padList[i][j].classList.add("b"+i);
            padDiv.appendChild(padList[i][j]);
        }
    }
}