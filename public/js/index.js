// states --------------------------------------------------------------------------
let context;
let bufferLoader;
let analyser;
let analyserFilter;
let drawVisualId;

let bpm = 120;
let totalVolume = 1;

let trackQty = 8;
let bit = 16;
let t = 60/bpm/4;

let totalLength = 32;
let length = 16;
let page = 0;
let pagePlaying = 0;

let p=0;
let playing = false;
let autoPage = true;
let metronome = false;
let kbMode = false;
let visualMode = 0;

let playingList = [];
let soundList = [];
let pageList = [];

let lastSelect;
let timerId;

let volume = [1,1,1,1,1,1,1,1];
let trackSwitch = [true,true,true,true,true,true,true,true];

let state = [];
for(let i=0;i<trackQty;i++) {
    state[i] = [];
    for(let j=0;j<totalLength;j++) {
        state[i].push(0);
    }
}
let rhythm0 = [
    [1,0,0,1,1,0,0,0,1,0,0,1,1,0,0,0,1,0,0,1,1,1,0,0,1,0,0,1,1,0,0,0],
    [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1],
    [0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,1],
    [0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,1,1,0,1,0,1,0,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
];
let rhythm1 = [
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,1],
    [0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0],
    [0,0,1,0,1,0,1,1,0,0,1,0,1,0,1,1,0,1,0,1,1,1,0,1,0,1,0,1,1,0,0,1],
    [0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1],
    [0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,1,0,1,1,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,1,1],
    [0,1,0,0,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,0,1,1,0,1,0,1,0,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];
state = rhythm1;

let trackName = ["Kick","Snare","Close Hat","Open Hat","Tom","Clap","Conga","Atm"];
let trackList = [];
let padList = [[],[],[],[],[],[],[],[]];
let pointNumberList = [];

let play;
let stop;

function decideLength(media) {
    if(mediaQuery[0].matches) {
        length = 32;
        console.log("A",length);
        removePad();
        createPad();
        return;
    } else if(mediaQuery[1].matches) {
        length = 16;
        console.log("B",length);
        removePad();
        createPad();
        createPageButton();
        return;
    } else {
        length = 8;
        console.log("C",length);
        removePad();
        createPad();
        createPageButton();
        if(mediaQuery[2].matches) {
            document.getElementById("padDiv").style = "grid-template-columns: 30px repeat("+length+",30px);"
        }
        return;
    }
}

let mediaQuery = [
    window.matchMedia("(min-width: 1200px)"),
    window.matchMedia("(min-width: 650px)"),
    window.matchMedia("(max-width: 400px)")
];
for(let i=0;i<mediaQuery.length;i++){
    mediaQuery[i].addListener(decideLength);
}

let url = new URL(window.location);
let beatId = url.searchParams.get("id") || "";
let beatName;

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
        "sound/7atm0.wav",
        "sound/metronome0.wav",
        "sound/metronome1.wav"
        ],
        finishedLoading
        );

    bufferLoader.load();

    document.querySelector(".memberIcon").addEventListener("click",function() {
        authStatus() ? goToProfile() : popUpLogIn();
    });

    document.getElementById("icon").addEventListener("click",function(){
        document.getElementById("sideNav").classList.add("sideNavShow");
        let navShield = cE("div","navShield");
        document.body.appendChild(navShield);
        navShield.addEventListener("click",function(){
            document.getElementById("sideNav").classList.remove("sideNavShow");
            navShield.parentNode.removeChild(navShield);
        })
    });

    document.getElementById("closeNav").addEventListener("click",function(){
        document.getElementById("sideNav").classList.remove("sideNavShow");
        let navShield = document.querySelector(".navShield");
        navShield.parentNode.removeChild(navShield);
    });

    document.getElementById("save").addEventListener("click",function(){
        if(authStatus()) {
            beatId ? saveBeat() :popUpSaveBeat(saveBeat);
        } else {
            popUpLogIn();
        }
    });
    document.getElementById("saveAs").addEventListener("click",function(){
        authStatus() ? popUpSaveBeat(saveAsNewBeat) : popUpLogIn();
    });
    document.getElementById("download").addEventListener("click",function(){
        alert("The Feature Is Comming Soon.");
    });
    document.getElementById("share").addEventListener("click",function(){
        alert("The Feature Is Comming Soon.");
    });

}

function playByPoint(soundList,p){
    let startTime = context.currentTime;
    for (let i=0;i<8;i++){
        if(trackSwitch[i]) {
            state[i][p%totalLength] && playSound(soundList[i],startTime+0.05,volume[i]);
            padList[i][p%totalLength-page*length] && padList[i][p%totalLength-page*length].classList.add("bOn");
        }
        padList[i][(p+totalLength-1)%totalLength-page*length] && padList[i][(p+totalLength-1)%totalLength-page*length].classList.remove("bOn");
    }
}

function finishedLoading(bufferList) {

    soundList = bufferList;
    
    play = function(e) {
        if(playing) {
            clearInterval(timerId);
            playing = false;
            document.getElementById("playImg").src = "img/play.svg";
        } else {
            timerId = setInterval(function(){
                playByPoint(bufferList,p);
                if(p%length==0) {
                    if (pageList[pagePlaying]){
                        autoPage && pageList[page].classList.remove("pageNow");
                        pageList[pagePlaying].classList.remove("pagePlaying");
                    }
                    pagePlaying=(p%totalLength)/length;

                    // auto turn page part
                    if (autoPage) {
                        page=pagePlaying;
                        for(let i=0;i<trackQty;i++){
                            padList[i][p%totalLength-page*length] && padList[i][p%totalLength-page*length].classList.add("bOn");
                            for(let j=0;j<length;j++){
                                padList[i][j].classList.toggle("b"+i,state[i][j+page*length])
                            }
                        }
                        for(let j=0;j<length;j+=4){
                            pointNumberList[j].textContent = ((j+page*length)/4)+1;
                        }
                    }

                    // change page button
                    if(pageList[pagePlaying]) {
                        autoPage && pageList[pagePlaying].classList.add("pageNow");
                        pageList[pagePlaying].classList.add("pagePlaying");
                    }
                }

                // metronome sound
                if(metronome && p%4==0){
                    playSound((p/4)%4?soundList[9]:soundList[8],context.currentTime+0.05,totalVolume);
                    document.getElementById("metronome").src = p%8 ? "img/metronome.svg" : "img/metronome1.svg";
                }

                // kb mode
                if(kbMode && p%4==0){
                    document.getElementById("kbMode").src = "img/kbMode"+(p%16)/4+".svg";
                }
                p++;
            },15000/bpm);
            playing = true;
            // draw();
            document.getElementById("stop").removeEventListener("click",stop);
            document.getElementById("stop").addEventListener("click",stop);
            document.getElementById("playImg").src = "img/pause.svg";
            saveBeatToLocalStorage();
        }
    }

    stop = function(e) {
        clearInterval(timerId);
        console.log(playingList);

        // turn off audios
        playingList.forEach(function(item){
            item.gain.setTargetAtTime(0, context.currentTime,0.5);
        })

        playing = false;
        autoPage = true;
        pageList[pagePlaying] && pageList[pagePlaying].classList.remove("pagePlaying");
        
        // turn off the "On" blocks
        if(Math.floor((p-1)%totalLength/length)==page){
            for (let i=0;i<8;i++){
                padList[i][(p+length-1)%length].classList.remove("bOn");
                // padList[i][(p+totalLength-1)%totalLength].classList.remove("bOn");
            }
        }

        p=0;

        // set buttons
        document.getElementById("stop").removeEventListener("click",stop);
        document.getElementById("playImg").src = "img/play.svg";
    }

    let reset = function() {
        clearInterval(timerId);
        timerId = setInterval(function(){
            playByPoint(bufferList,p);
                if(p%length==0) {
                    if (pageList[pagePlaying]){
                        autoPage && pageList[page].classList.remove("pageNow");
                        pageList[pagePlaying].classList.remove("pagePlaying");
                    }
                    pagePlaying=(p%totalLength)/length;

                    // auto turn page part
                    if (autoPage) {
                        page=pagePlaying;
                        for(let i=0;i<trackQty;i++){
                            padList[i][p%totalLength-page*length] && padList[i][p%totalLength-page*length].classList.add("bOn");
                            for(let j=0;j<length;j++){
                                padList[i][j].classList.toggle("b"+i,state[i][j+page*length])
                            }
                        }
                        for(let j=0;j<length;j+=4){
                            pointNumberList[j].textContent = ((j+page*length)/4)+1;
                        }
                    }

                    // change page button
                    if(pageList[pagePlaying]) {
                        autoPage && pageList[pagePlaying].classList.add("pageNow");
                        pageList[pagePlaying].classList.add("pagePlaying");
                    }
                }

                // metronome sound
                if(metronome && p%4==0){
                    playSound((p/4)%4?soundList[9]:soundList[8],context.currentTime+0.05,totalVolume);
                    document.getElementById("metronome").src = p%8 ? "img/metronome.svg" : "img/metronome1.svg";
                }

                // kb mode
                if(kbMode && p%4==0){
                    document.getElementById("kbMode").src = "img/kbMode"+(p%16)/4+".svg";
                }
            p++;
        },15000/bpm);
    }

    let clear = function() {
        // playing && stop();
        for(let i=0;i<trackQty;i++){
            for(let j=0;j<totalLength;j++){
                state[i][j] = 0;
            }
            for(let j=0;j<length;j++){
                padList[i][j].classList.remove("b"+i);
            }
        }
    }

    // get beat from back end or local storage ---------------------------------------
    if(beatId) {
        console.log(beatId);
        fetch(dbHost+"/exe/getBeat?id="+beatId, {
            method:"GET",
            headers: new Headers({
                "Content-Type": "application/json"
            })
        }).then(res => res.json())
        .then(response => {
            if(response.error) {
                console.error("Load beat error:",response.error)
            } else {
                console.log("Load beat success:",response);
                state = response.beat;
                bpm = response.bpm;
                beatName = response.beatName;
                volume = response.volume;
            }
            document.getElementById("bpm").value = bpm;
            decideLength(mediaQuery);
            createTrackSetting();
        })
        .catch(error => {
            console.error("Load beat error:",error)
        });
    } else {
        if(localStorage.beat) {state = JSON.parse(localStorage.getItem("beat"));}
        if(localStorage.bpm) {bpm = localStorage.getItem("bpm");}
        document.getElementById("bpm").value = bpm;
        decideLength(mediaQuery);
        createTrackSetting();
    }

    // set button feature -------------------------------------------------------------
    document.getElementById("play").addEventListener("click",play);
    // document.getElementById("clear").addEventListener("click",clear);
    document.getElementById("clear").addEventListener("click",function(){alert("Clear the Beat?!",false,clear)});
    
    document.getElementById("metronome").addEventListener("click",function(){
        metronome = !metronome;
        this.classList.toggle("metronomeOn",metronome);
    })
    document.getElementById("kbMode").addEventListener("click",function(){
        kbMode = !kbMode;
        this.classList.toggle("kbModeOn",kbMode);
    })
    document.getElementById("bpm").addEventListener("change",function(){
        console.log(this.value);
        bpm = this.value;
        playing && reset();
        localStorage.setItem("bpm",bpm);
    });

    // document.getElementById("mute").
    document.getElementById("mute").addEventListener("click",function(){
        document.getElementById("totalVolume").value = Number(!totalVolume);
        totalVolume = Number(!totalVolume);
        this.classList.toggle("volumeOn",!!totalVolume);
        this.src = "img/volume"+Math.round(totalVolume)*3+".svg";
    })
    document.getElementById("totalVolume").addEventListener("input",function(){
        totalVolume = this.value;
        playingList.forEach(function(item){
            item.gain.value = totalVolume;
        })
        document.getElementById("mute").src = "img/volume"+Math.floor(this.value*4)+".svg";
        document.getElementById("mute").classList.toggle("volumeOn",totalVolume>0.01);
    });
    document.getElementById("visualSwitch").addEventListener("click",function(){
        visualMode = (visualMode+1)%3;
        this.src = "img/visual"+visualMode+".svg";
        this.classList.toggle("visualSwitchOn",visualMode);
    })



    let keyPlay = function(i){
        playSound(soundList[i],context.currentTime,volume[i]);
        if(playing && kbMode) {
            state[i][(p+totalLength-1)%totalLength] = true;
            padList[i][(p+totalLength-1)%totalLength-page*length].classList.toggle("b"+i,true);
        }
    }
    let toggleTrackSwitch = function(i){
        trackSwitch[i] = !trackSwitch[i];
        document.getElementById("trackSwitch"+i).classList.toggle("b"+i,trackSwitch[i]);
    }
    window.onkeydown = function(e) {
        if(document.activeElement == document.getElementById("bpm")){
            if(e.keyCode==13) {
                document.getElementById("bpm").blur();
            }
            return;
        }
        console.log(e.keyCode);
        e.preventDefault();
        switch(e.keyCode) {
            case 32: //" "
                document.activeElement.blur();
                play();
                break;
            case 27: //esc
                stop();
                break;
            case 46: //delete
                e.ctrlKey && clear();
                e.shiftKey && clear();
                break;
            // case 220: //"\"
            case 57: //9
                metronome = !metronome;
                document.getElementById("metronome").classList.toggle("metronomeOn",metronome);
                break;
            // case 13: //enter
            case 48: //0
                kbMode = !kbMode;
                document.getElementById("kbMode").classList.toggle("kbModeOn",kbMode);
                break;
            case 192: //`
                document.getElementById("visualSwitch").click();
                // visualMode = (visualMode+1)%3;
                // document.getElementById("visualSwitch").src = "img/visual"+visualMode+".svg";
                // document.getElementById("visualSwitch").classList.toggle("visualSwitchOn",visualMode);
                break;
            case 49: //1
                toggleTrackSwitch(0);
                break;
            case 50: //2
                toggleTrackSwitch(1);
                break;
            case 51: //3
                toggleTrackSwitch(2);
                break;
            case 52: //4
                toggleTrackSwitch(3);
                break;
            case 53: //5
                toggleTrackSwitch(4);
                break;
            case 54: //6
                toggleTrackSwitch(5);
                break;
            case 55: //7
                toggleTrackSwitch(6);
                break;
            case 56: //8
                toggleTrackSwitch(7);
                break;
            case 66: //b
                keyPlay(0);
                break;
            case 67: //c
                keyPlay(0);
                break;
            case 78: //n
                keyPlay(0);
                break;
            case 86: //v
                keyPlay(0);
                break;
            case 68: //d
                keyPlay(1);
                break;
            case 70: //f
                keyPlay(1);
                break;
            case 72: //h
                keyPlay(1);
                break;
            case 74: //j
                keyPlay(1);
                break;
            case 83: //s
                keyPlay(2);
                break;
            case 88: //x
                keyPlay(2);
                break;
            case 75: //k
                keyPlay(2);
                break;
            case 77: //m
                keyPlay(2);
                break;
            case 90: //z
                keyPlay(3);
                break;
            case 188: //,
                keyPlay(3);
                break;
            case 71: //g
                keyPlay(5);
                break;
            case 84: //t
                keyPlay(4);
                break;
            case 82: //r
                keyPlay(4);
                break;
            case 89: //y
                keyPlay(4);
                break;
            case 65: //a
                keyPlay(5);
                break;
            case 76: //l
                keyPlay(5);
                break;
            case 81: //q
                keyPlay(5);
                break;
            case 69: //e
                keyPlay(6);
                break;

            case 85: //u
                keyPlay(6);
                break;
            case 87: //w
                keyPlay(6);
                break;
            case 73: //i
                keyPlay(6);
                break;
            case 79: //o
                keyPlay(7);
                break;
            case 80: //p
                keyPlay(7);
                break;
            // case 186: //;
            //     keyPlay(7);
            //     break;
            // case 190: //.
            //     keyPlay(7);
            //     break;
        }
    }


    // beating line setting
    analyser = context.createAnalyser();
    analyser.fftSize = 256;
    analyser.maxDecibels = -90;
    analyser.minDecibels = -100;
    analyser.smoothingTimeConstant = 1;
    analyserFilter = context.createBiquadFilter();
    analyserFilter.type = "lowpass";
    analyserFilter.frequency.value = 2000;
    // analyserFilter.Q.value = 0.1;
    analyserFilter.connect(analyser);
    let bufferLength = analyser.fftSize;
    let dataArray = new Uint8Array(bufferLength);
    // analyser.getByteTimeDomainData(dataArray);
    
    let canvas = document.getElementById("visual");
    let canvasCtx = canvas.getContext("2d");
    // draw an oscilloscope of the current audio source
    function draw() {
        drawVisualId = requestAnimationFrame(draw);
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        // if(!visualMode){
        //     return;
        // }
        if(mediaQuery[0].matches) {
            canvas.width = 1115;
        } else if(mediaQuery[1].matches) {
            canvas.width = 555;
        } else if(mediaQuery[2].matches) {
            canvas.width = 254;
        } else {
            canvas.width = 275;
        }
        canvas.height = mediaQuery[2].matches?254:275;

        analyser.getByteTimeDomainData(dataArray);


        canvasCtx.fillStyle = "rgba(15,26,42,0.1)";
        // canvasCtx.fillStyle = "#0f1a2a";
        // canvasCtx.fillStyle = "black";

        //"#4d99cc";
        
        canvasCtx.beginPath();
        
        let sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = sliceWidth/2;
        // canvasCtx.moveTo(x, dataArray[0]/128.0*canvas.height/2);
        
        let amp=0
        for(let i=0;i<bufferLength;i++) {
            let v = dataArray[i] / 128.0;
            let y = v * canvas.height/2;
            visualMode==2 && canvasCtx.moveTo(x, canvas.height/2);
            canvasCtx.lineTo(x, y);
            x += sliceWidth;
            amp+=v;
        }

        canvasCtx.lineWidth = 3;
        // canvasCtx.strokeStyle = "rgba(77,153,204,"+(1-Math.pow(((amp-bufferLength)/256-1),10))+")"
        canvasCtx.strokeStyle = "rgba(77,153,204,"+(visualMode && amp!==bufferLength?1:0)+")"

        // canvasCtx.lineTo(canvas.width, canvas.height/2);
        canvasCtx.stroke();
    };
    draw();
}


function playSound(buffer,time,volume) {
    let source = context.createBufferSource(); // creates a sound source
    let gain = context.createGain();

    source.buffer = buffer;                    // tell the source which sound to play
    source.connect(gain);       // connect the source to the context's destination (the speakers)
    gain.connect(analyserFilter);
    gain.gain.value = totalVolume*volume;
    gain.connect(context.destination);
    // analyserFilter.connect(context.destination);
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
function createPad(){
    page=Math.floor((p%totalLength)/length);
    let padDiv = document.getElementById("padDiv");
        padDiv.style = "grid-template-columns: 40px repeat("+length+",30px);"
    for(let i=0;i<trackQty;i++){
        trackList[i] = cE("div","track");
        trackNumber = cE("div","trackNumber",i+1);
        trackIcon = cE("img","trackIcon","","src","img/track"+i+".svg")
        trackList[i].append(trackNumber,trackIcon);
        trackList[i].addEventListener("mousedown",function(){
            playSound(soundList[i],context.currentTime,volume[i]);
            this.classList.add("b"+i);
            // document.getElementById("trackSetDiv"+s).classList.add("b"+s);
            for(let j=0;j<length;j++){
                padList[i][j].classList.add("bSelected");
            }
            // lastSelect==i || handleSelect(i);
            // lastSelect = i;
        })
        trackList[i].addEventListener("mouseup",function(){
            this.classList.remove("b"+i);
            for(let j=0;j<length;j++){
                padList[i][j].classList.remove("bSelected");
            }
        })
        padDiv.appendChild(trackList[i]);
        for(let j=0;j<length;j++){
            padList[i][j] = cE("div",j%4?"b":"bp","","id",i+"-"+j);
            padList[i][j].addEventListener("click",function(){
                state[i][j+page*length] = !state[i][j+page*length];
                state[i][j+page*length] && !playing && playSound(soundList[i],context.currentTime,volume[i]);
                padList[i][j].classList.toggle("b"+i);
                lastSelect==i || handleSelect(i);
                lastSelect = i;
            })
            state[i][j+page*length] && padList[i][j].classList.add("b"+i);
            padDiv.appendChild(padList[i][j]);
        }
    }

    let funcBtn = cE("div","funcBtn","▼");
    let funcDiv = cE("div","funcDiv pointNumberP");
    let func = [];
    func[0] = cE("div","funcItem","Keyboard Description");
    func[1] = cE("div","funcItem","Track Setting");
    funcDiv.addEventListener("mouseover",function(){
        func[0].classList.add("funcItemShow");
        func[1].classList.add("funcItemShow");
    })
    funcDiv.addEventListener("mouseout",function(){
        func[0].classList.remove("funcItemShow");
        func[1].classList.remove("funcItemShow");
    })
    funcDiv.append(funcBtn);
    padDiv.appendChild(funcDiv);
    for(let j=0;j<length;j++){
        pointNumberList[j] = cE("div",j%4?"pointNumber":"pointNumberP",j%4?(j%4)+1:((j+page*length)/4)+1);
        padDiv.appendChild(pointNumberList[j]);
    }

    function cancelSelect(){
        console.log("body clicked");
        trackList[lastSelect] && trackList[lastSelect].classList.remove("b"+lastSelect);
        for(let j=0;j<length;j++){
            padList[lastSelect] && padList[lastSelect][j].classList.remove("bSelected");
        }
        lastSelect = null;
    }

    document.getElementById("background").removeEventListener("click",cancelSelect);
    document.getElementById("background").addEventListener("click",cancelSelect);
}

function createPageButton() {
    let totalPage = totalLength/length;
    for(let m=0;m<totalPage;m++) {
        pageList[m] = cE("div","pageButton");
        m==page && pageList[m].classList.add("pageNow");
        pageList[m].addEventListener("click",function(){
            if(playing) {autoPage = false;}

            // when page is on playing, remove hit block
            if(Math.floor((p-1)%totalLength/length)==page){
                console.log(p,p%totalLength,page);
                for(let i=0;i<trackQty;i++){
                    padList[i][(p+length-1)%length].classList.remove("bOn");
                }
            }

            page=m;
            for(let i=0;i<trackQty;i++){
                for(let j=0;j<length;j++){
                    padList[i][j].classList.toggle("b"+i,state[i][j+page*length]);
                }
                if(Math.floor((p-1)%totalLength/length)==page){
                    padList[i][(p-1)%length].classList.add("bOn");
                }
            }

            // change point number
            for(let j=0;j<length;j+=4){
                pointNumberList[j].textContent = ((j+page*length)/4)+1;
            }
            for(let n=0;n<totalPage;n++){
                pageList[n].classList.toggle("pageNow",n==m);
            }
        })
        document.getElementById("pageDiv").appendChild(pageList[m]);
    }
}

function handleSelect(s){
    if(trackList[lastSelect]) {
        trackList[lastSelect].classList.remove("b"+lastSelect);
        // document.getElementById("trackSetDiv"+lastSelect).classList.remove("b"+lastSelect);
    }
    trackList[s].classList.add("b"+s);
    // document.getElementById("trackSetDiv"+s).classList.add("b"+s);
    for(let j=0;j<length;j++){
        padList[lastSelect] && padList[lastSelect][j].classList.remove("bSelected");
        // if(!state[s][j]) 
        padList[s][j].classList.add("bSelected");
    }
}

function removePad() {
    let padDiv = document.getElementById("padDiv");
    while (padDiv.hasChildNodes()) {
        padDiv.removeChild(padDiv.firstChild);
    }
    let pageDiv = document.getElementById("pageDiv");
    while (pageDiv.hasChildNodes()) {
        pageDiv.removeChild(pageDiv.firstChild);
    }
}

function createTrackSetting() {
    for(let i=0;i<8;i++){
        let trackSetDiv = cE("div","trackSetDiv",null,"id","trackSetDiv"+i);
            trackSetDiv.addEventListener("click",function(){
                playSound(soundList[i],context.currentTime,volume[i]);
                this.classList.add("b"+i);
                trackList[i].classList.add("b"+i);
                for(let j=0;j<length;j++){
                    padList[i][j].classList.add("bSelected");
                }
                setTimeout(function(){
                    trackSetDiv.classList.remove("b"+i);
                    trackList[i].classList.remove("b"+i);
                    for(let j=0;j<length;j++){
                        padList[i][j].classList.remove("bSelected");
                    }
                },100);
            })
            // trackSetDiv.addEventListener("mouseup",function(){
            //     this.classList.remove("b"+i);
            //     trackList[i].classList.remove("b"+i);
            //     for(let j=0;j<length;j++){
            //         padList[i][j].classList.remove("bSelected");
            //     }
            // })
        let trackSetVolume = cE("input","trackSetVolume",null,"id","trackSetVolume"+i);
            trackSetVolume.type = "range";
            trackSetVolume.max = 1;
            trackSetVolume.min = 0;
            trackSetVolume.step = "any";
            trackSetVolume.value = volume[i];
            trackSetVolume.addEventListener("input",function(e){
                volume[i] = this.value;
                console.log(this.value);
                // e.preventDefault();
            })
            trackSetVolume.addEventListener("click",function(e){
                e.stopPropagation();
            })
            // trackSetVolume.addEventListener("touchstart",function(e){
            //     console.log(this.value);
            // })

        // let trackSetPlay = cE("div","trackSetPlay");
        //     trackSetPlay.addEventListener("click",function(){
        //         if(this.classList.contains("trackSetStop")) {
        //             stopSingleTrack(i);
        //         } else {
        //             playSingleTrack(i);
        //         }
        //         this.classList.toggle("trackSetStop");
        //     });

        let trackSetSwitch = cE("div","trackSetSwitch b"+i,null,"id","trackSwitch"+i);
            trackSetSwitch.addEventListener("click",function(e){
                trackSwitch[i] = !trackSwitch[i];
                this.classList.toggle("b"+i,trackSwitch[i]);
                e.stopPropagation();
                // e.stopImmediatePropagation();
            })
        // let trackSetSwitch = cE("label","trackSetSwitch");
        //     let trackSetCheckBox = cE("input",null,null,"type","checkbox");
        //         trackSetCheckBox.id = "trackSwitch"+i;
        //         trackSetCheckBox.checked = trackSwitch[i];
        //         trackSetCheckBox.addEventListener("change",function(){
        //             trackSwitch[i] = this.checked;
        //         })
        //     let trackSetSlider = cE("span","trackSetSlider");
        //     trackSetSwitch.append(trackSetCheckBox,trackSetSlider);

        // let trackSetVolumeKey = cE("div","trackSetVolumeKey","Volume");
        let trackSetNum = cE("div","trackSetNum",i+1);
        let trackSetIcon = cE("img","trackSetIcon",null,"src","img/track"+i+".svg");
        trackSetDiv.append(trackSetVolume,trackSetSwitch,trackSetNum,trackSetIcon);
        document.getElementById("trackSettingListDiv").appendChild(trackSetDiv);
    }
}

// function playSingleTrack(i) {
//     if(playing) {
//         clearInterval(timerId);
//         timerId = setInterval(function(){
//             let startTime = context.currentTime;
//             state[i][p%length] && playSound(soundList[i],startTime+0.05,volume[i]);
//             padList[i][p%length].classList.add("bOn");
//             padList[i][(p+length-1)%length].classList.remove("bOn");
//             p++;
//         },15000/bpm);
//     } else {
//         timerId = setInterval(function(){
//             let startTime = context.currentTime;
//             state[i][p%length] && playSound(soundList[i],startTime+0.05,volume[i]);
//             padList[i][p%length].classList.add("bOn");
//             padList[i][(p+length-1)%length].classList.remove("bOn");
//             p++;
//         },15000/bpm)
//         // playing = true;
//     }
// }

// function stopSingleTrack(i) {
//     if(playing) {

//     }
// }


// save to local storage
function saveBeatToLocalStorage() {
    let beatString = JSON.stringify(state);
    localStorage.setItem("beat",beatString);
}

// save beat feature ------------------------------------------------------------
function popUpSaveBeat(cb) {
    let mySheild = cE("div","shield");
    let myNaming = cE("div","naming");

    let closeNaming = function() {
        mySheild.parentNode.removeChild(mySheild);
        myNaming.parentNode.removeChild(myNaming);
    }

    let myNamingText = cE('div', "namingText","Enter the Beat's Name:");
    let myNamingInput = cE("input","namingInput",null,"placeholder","Untitled");
        myNamingInput.id = "beatName";
        myNamingInput.addEventListener("change",function(){
            beatName = this.value;
            console.log(beatName);
        })
    
	let myNamingBtnDiv = cE("div","namingBtnDiv");
	let myNamingBtn = cE('button', "namingBtn", "Done");
	myNamingBtn.addEventListener('click', function () {
		cb && cb();
        closeNaming();
    });
    let myNamingBtn2 = cE('button', "namingCancel", "Cancel");
    myNamingBtn2.addEventListener('click',closeNaming);

    myNamingBtnDiv.append(myNamingBtn,myNamingBtn2);
    
    myNaming.append(myNamingText,myNamingInput,myNamingBtnDiv);
	document.body.append(mySheild, myNaming);
}

function saveBeat() {
    // let beatName = document.getElementById("beatName").value;
    let beatData = {
        beatId:beatId || false,
        user:authStatus().uid,
        beat:state,
        beatName:beatName,
        bpm:bpm,
        length:length,
        volume:volume
    }
    console.log(beatData);

    fetch(dbHost+"/exe/saveBeat", {
        method:"POST",
        body: JSON.stringify(beatData),
        // mode: 'no-cors',
        headers: new Headers({
            "Content-Type": "application/json"
        })
    }).then(res => res.json())
    .then(response => {
        if(response.error){
            alert(response.error+" Please try again later. :)");
            console.error("Update to database error:",response.error)
        } else {
            alert("Beat Saved!", true);
            console.log("Update to database success:",response);
            let newBeatId = response.newBeatId;
            if(newBeatId !== beatId) {
                console.log(newBeatId);
                removeUserBeatList();
                getUserBeatList(authStatus().uid);
                setTimeout(function(){
                    // window.location = "index.html?id="+newBeatId;
                },3000);
            }
        }
    })
    .catch(error => {
        alert(error+" Please try again later. :)");
        console.error("Update to database error:",error)
    });
}

function saveAsNewBeat() {
    // let beatName = document.getElementById("beatName").value;
    let beatData = {
        user:authStatus().uid,
        beat:state,
        beatName:beatName,
        bpm:bpm,
        length:length,
        volume:volume
    }

    fetch(dbHost+"/exe/saveAsNewBeat", {
        method:"POST",
        body: JSON.stringify(beatData),
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        }
    }).then(res => res.json())
    .then(response => {
        if(response.error) {
            alert("The beat isn't saved, please try again later. :(");
            console.error("Update to database error:",error)
        } else {
            alert("Beat saved! Jump page after 3 seconds.", true);
            console.log("Update to database success:",response);
            let newBeatId = response.newBeatId;
            removeUserBeatList();
            getUserBeatList(authStatus().uid);
            setTimeout(function(){
                // window.location = "index.html?id="+newBeatId;
            },3000);
        }
    })
    .catch(error => {
        alert("The beat isn't saved, please try again later. :(");
        console.error("Update to database error:",error)
    });
}