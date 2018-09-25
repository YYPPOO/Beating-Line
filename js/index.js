const cE = (type,v0,v1,k2,v2) => {
    let myElement = document.createElement(type);
    myElement.className = v0;
    myElement.textContent = v1 ? v1:"";
    myElement[k2] = v2;
    return myElement;
};

// states --------------------------------------------------------------------------
let context;
let bufferLoader;
let bpm = 60;
let totalVolume = 1;

let t = 60/bpm/4;
let p=0;
let length = 8;
let trackQty = 8;
let bit = 16;


let state = [];
for(let i=0;i<trackQty;i++) {
    state[i] = [];
    for(let j=0;j<length;j++) {
        state[i].push(0);
    }
}
state = [
    [1,0,0,1,1,0,0,0],
    [0,0,1,0,0,0,1,0],
    [0,1,0,1,0,1,0,1],
    [0,0,0,1,0,0,0,1],
    [0,1,0,0,0,1,0,0],
    [0,0,0,1,0,0,1,1],
    [0,1,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0]
];
console.log(state);

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
        state[i][p%length] && playSound(bufferList[i],startTime+0.1);
        padList[i][(p+length-1)%length].classList.remove("bOn");
        // padList[i][length-1] && padList[i][length-1].classList.remove("bOn");
        padList[i][p%length].classList.add("bOn");
        // for (let j=0;j<length;j++){
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
    let playing = false;
    
    let play = function(e) {
        if(playing) {
            clearInterval(intervalID);
            playing = false;
            document.getElementById("play").textContent = "Beat!";
        } else {
            intervalID = setInterval(function(){
                playByPoint(bufferList,p);
                p++;
            },15000/bpm);
            playing = true;
            document.getElementById("stop").removeEventListener("click",stop);
            document.getElementById("stop").addEventListener("click",stop);
            document.getElementById("play").textContent = "Pause";
        }
        // document.getElementById("play").removeEventListener("click",play);
        // document.getElementById("play").addEventListener("click",pause);
    }

    let stop = function(e) {
        clearInterval(intervalID);
        playing = false;
        for (let i=0;i<8;i++){
            padList[i][(p-1)%length].classList.remove("bOn");
        }
        p=0;
        document.getElementById("stop").removeEventListener("click",stop);
        document.getElementById("play").textContent = "Beat!";
    }

    let reset = function() {
        clearInterval(intervalID);
        intervalID = setInterval(function(){
            playByPoint(bufferList,p);
            p++;
        },15000/bpm);
    }

    document.getElementById("play").addEventListener("click",play);

    document.getElementById("bpm").addEventListener("change",function(){
        console.log(this.value);
        bpm = this.value;
        playing && reset();
    });
    


    // document.getElementById("bpm").addEventListener("change",reset);
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
    let gain = context.createGain();
    source.buffer = buffer;                    // tell the source which sound to play
    source.connect(gain);       // connect the source to the context's destination (the speakers)
    gain.connect(context.destination);
    gain.gain.value = totalVolume;
    source.start(time);                           // play the source now
    source.stop(time+10);
    console.log(gain);
    console.log(source);

    document.getElementById("stop").addEventListener("click",function(){source.stop()});
    document.getElementById("totalVolume").addEventListener("change",function(){
        totalVolume = this.value;
        gain.gain.value = totalVolume;
        console.log(this.value);
    });
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
        trackIcon = cE("img","trackIcon","","src","../img/track"+i+".svg")
        trackList[i].appendChild(trackIcon);
        padDiv.appendChild(trackList[i]);
        for(let j=0;j<length;j++){
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