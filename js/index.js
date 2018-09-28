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
let playingList = [];

let t = 60/bpm/4;
let p=0;
let length = 8;
let trackQty = 8;
let bit = 16;
let playing = false;


let state = [];
for(let i=0;i<trackQty;i++) {
    state[i] = [];
    for(let j=0;j<length;j++) {
        state[i].push(0);
    }
}
let rhythm0 = [
    [1,0,0,1,1,0,0,0],
    [0,0,1,0,0,0,1,0],
    [0,1,0,1,0,1,0,1],
    [0,0,0,1,0,0,0,1],
    [0,1,0,0,0,1,0,0],
    [0,0,0,1,0,0,1,1],
    [0,1,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0]
];
let rhythm1 = [
    [1,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,1,0],
    [0,0,1,0,0,0,0,1],
    [0,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,1,0],
    [0,0,0,0,1,1,0,0],
    [1,1,0,0,0,0,1,0],
    [0,0,0,0,0,0,0,0]
];
state = rhythm0;
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
    }

    let stop = function(e) {
        clearInterval(intervalID);
        console.log(playingList);
        playingList.forEach(function(item){
            item.gain.value = 0;
        })
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

    let clear = function() {
        playing && stop();
        for(let i=0;i<trackQty;i++){
            for(let j=0;j<length;j++){
                if(state[i][j]){
                    state[i][j] = 0;
                    padList[i][j].classList.remove("b"+i);
                }
            }
        }
    }

    document.getElementById("play").addEventListener("click",play);
    // document.getElementById("clear").addEventListener("click",clear);
    document.getElementById("clear").addEventListener("click",function(){alert("確認清除？",false,clear)});

    document.getElementById("bpm").addEventListener("change",function(){
        console.log(this.value);
        bpm = this.value;
        playing && reset();
    });
    
    document.getElementById("totalVolume").addEventListener("change",function(){
        totalVolume = this.value;
        playingList.forEach(function(item){
            item.gain.value = totalVolume;
        })
    });

    createPad(bufferList);



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
    gain.gain.value = document.getElementById("totalVolume").value;
    source.start(time);                           // play the source now
    // source.stop(time+source.buffer.duration);
    // console.log(gain);
    // console.log(source);
    // console.log(context.createBufferSource());
    playingList.push(gain);
    // console.log(playingList);
    source.onended = function(){
        playingList.splice(playingList.indexOf(gain),1);
    };

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
function createPad(bufferList){
    let padDiv = document.getElementById("padDiv");
    let lastSelect;
    for(let i=0;i<8;i++){
        trackList[i] = cE("div","track",i+1);
        trackIcon = cE("img","trackIcon","","src","../img/track"+i+".svg")
        trackList[i].appendChild(trackIcon);
        trackList[i].addEventListener("click",function(){
            playSound(bufferList[i],context.currentTime);
            lastSelect==i || handleSelect(i);
            lastSelect = i;
        })
        padDiv.appendChild(trackList[i]);
        for(let j=0;j<length;j++){
            padList[i][j] = cE("div",j%4?"b":"bp","","id",i+"-"+j);
            padList[i][j].addEventListener("click",function(){
                state[i][j] = !state[i][j];
                state[i][j] && !playing && playSound(bufferList[i],context.currentTime);
                padList[i][j].classList.toggle("b"+i);
                lastSelect==i || handleSelect(i);
                lastSelect = i;
            })
            state[i][j] && padList[i][j].classList.add("b"+i);
            padDiv.appendChild(padList[i][j]);
        }
    }

    function handleSelect(s){
        trackList[lastSelect] && trackList[lastSelect].classList.remove("b"+lastSelect);
        trackList[s].classList.add("b"+s);
        for(let j=0;j<length;j++){
            padList[lastSelect] && padList[lastSelect][j].classList.remove("bSelected");
            // if(!state[s][j]) 
            padList[s][j].classList.add("bSelected");
        }
    }
}
