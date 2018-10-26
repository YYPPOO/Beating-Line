// states --------------------------------------------------------------------------
let audio = {};
// let context;
// let bufferLoader;
// let analyser;
// let analyserFilter;
// let drawVisualId;

let beat = {
    bpm:120,
    totalVolume:1,
    beatId:"",
    beatName:"",
    state:[],
    volume:[1,1,1,1,1,1,1,1],
    trackQty:8,
    totalLength:32
};
// let bpm = 60;
// let totalVolume = 1;

// let trackQty = 8;
// let bit = 16;
// let t = 60/bpm/4;
// let totalLength = 32;

let state = {
    p:0,
    lastP:beat.totalLength-1,
    playing:false,
    autoPage:true,
    metronome:false,
    kbMode:false,
    visualMode:0,
    trackSwitch:[true,true,true,true,true,true,true,true],
    lastSelect:null,
    timerId:null
}

let length = 16;
let page = 0;
let pagePlaying = 0;

// let p = 0;
// let lastP = beat.totalLength-1;
// let playing = false;
// let autoPage = true;
// let metronome = false;
// let kbMode = false;
// let visualMode = 0;

let playingList = [];
let soundList = [];
let pageList = [];

// let lastSelect;
// let timerId;

// let volume = [1,1,1,1,1,1,1,1];
// let trackSwitch = [true,true,true,true,true,true,true,true];

// let state = [];
for(let i=0;i<beat.trackQty;++i) {
    beat.state[i] = [];
    for(let j=0;j<beat.totalLength;++j) {
        beat.state[i].push(0);
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
let rhythm2 = [
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0],
    [0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,1,1],
    [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
    [1,1,0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,1,0,0,1,0,0,0,1,0,1,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,1],
    [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
]
beat.state = rhythm2;

// let trackName = ["Kick","Snare","Close Hat","Open Hat","Tom","Clap","Conga","Atm"];
let trackList = [];
let padList = [[],[],[],[],[],[],[],[]];
let pointNumberList = [];

let play;
let stop;
let reset;

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
    window.matchMedia("(max-width: 375px)")
];
for(let i=0;i<mediaQuery.length;++i){
    mediaQuery[i].addListener(decideLength);
}

let url = new URL(window.location);
beat.beatId = url.searchParams.get("id") || "";
// let beatName;

window.onload = init;

function init() {
    // Fix up prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audio.context = new AudioContext();


    audio.bufferLoader = new BufferLoader(
        audio.context,
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

    audio.bufferLoader.load();

    // add side nav click event ---------------------------------------------
    document.querySelector(".memberIcon").addEventListener("click",function() {
        authStatus() ? goToProfile() : popUpLogIn();
    });
    document.getElementById("memberName").addEventListener("click",function() {
        authStatus() ? goToProfile() : popUpLogIn();
    });

    document.getElementById("menu").addEventListener("click",function(){
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
            beat.beatId ? alert("Replace the original beat?",false,saveBeat) :popUpSaveBeat(saveBeat);
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
        if(authStatus()) {
            beat.beatId ? popUpShareBeat() : alert("Please save the beat first.",false,function(){popUpSaveBeat(saveBeat)});
        } else {
            popUpLogIn();
        }
    });

}

function playByPoint(soundList,onPage,lastOnPage){
    let startTime = audio.context.currentTime;
    let i;
    for (i=0;i<8;++i){
        if(state.trackSwitch[i]) {
            beat.state[i][state.p] && playSound(soundList[i],startTime+0.05,beat.volume[i]);
            onPage && padList[i][state.p-page*length].classList.add("bOn");
        }
        lastOnPage && padList[i][state.lastP-page*length].classList.remove("bOn");
    }
    onPage && pointNumberList[state.p-page*length].classList.add("pointNumberOn");
    lastOnPage && pointNumberList[state.lastP-page*length].classList.remove("pointNumberOn");
}

function finishedLoading(bufferList) {

    soundList = bufferList;
    let i;
    let j;
    
    // add top nav button event -----------------------------------------------------------
    let handlePlay = function(){
        let onPage = state.p>=page*length && state.p<(page+1)*length;
        let lastOnPage = state.lastP>=page*length && state.lastP<(page+1)*length;
        playByPoint(bufferList,onPage,lastOnPage);

        // change page
        if(state.p%length===0) {
            if (pageList[pagePlaying]){
                state.autoPage && pageList[page].classList.remove("pageNow");
                pageList[pagePlaying].classList.remove("pagePlaying");
            }
            pagePlaying = state.p/length;

            // auto turn page part
            if (state.autoPage) {
                page = pagePlaying;
                for(i=0;i<beat.trackQty;++i){
                    if(state.trackSwitch[i]) {
                        padList[i][state.p-page*length].classList.add("bOn");
                    }
                    for(j=0;j<length;++j){
                        padList[i][j].classList.toggle("b"+i,beat.state[i][j+page*length])
                    }
                }
                pointNumberList[state.p-page*length].classList.add("pointNumberOn");
                //change point number
                for(j=0;j<length;j+=4){
                    pointNumberList[j].textContent = ((j+page*length)/4)+1;
                }
            }

            // change page button
            if(pageList[pagePlaying]) {
                state.autoPage && pageList[pagePlaying].classList.add("pageNow");
                pageList[pagePlaying].classList.add("pagePlaying");
            }
        }

        // metronome sound
        if(state.metronome && state.p%4===0){
            playSound((state.p/4)%4?soundList[9]:soundList[8],audio.context.currentTime+0.05,beat.totalVolume);
            document.getElementById("metronome").src = state.p%8 ? "img/metronome.svg" : "img/metronome1.svg";
        }

        // kb mode icon animation
        if(state.kbMode && state.p%4===0){
            document.getElementById("kbMode").src = "img/kbMode"+(state.p%16)/4+".svg";
        }
        state.lastP = state.p;
        state.p = (state.p+1)%beat.totalLength;
        // p = (p+1)===beat.totalLength ? 0 : (p+1);
    }
    // playing control
    play = function(e) {
        if(state.playing) {
            clearInterval(state.timerId);
            state.playing = false;
            document.getElementById("playImg").src = "img/play.svg";
        } else {
            state.timerId = setInterval(handlePlay,15000/beat.bpm);
            state.playing = true;
            // draw();
            document.getElementById("stop").removeEventListener("click",stop);
            document.getElementById("stop").addEventListener("click",stop);
            document.getElementById("playImg").src = "img/pause.svg";
            saveBeatToLocalStorage();
        }
    }

    stop = function(e) {
        clearInterval(state.timerId);
        console.log(playingList);

        // turn off audios
        playingList.forEach(function(item){
            item.gain.setTargetAtTime(0, audio.context.currentTime,0.5);
        })

        state.playing = false;
        state.autoPage = true;
        pageList[pagePlaying] && pageList[pagePlaying].classList.remove("pagePlaying");
        
        // turn off the "On" blocks
        if(state.lastP>=page*length && state.lastP<(page+1)*length){
            for (i=0;i<beat.trackQty;++i){
                padList[i][state.lastP%length].classList.remove("bOn");
            }
            pointNumberList[state.lastP-page*length].classList.remove("pointNumberOn");
        }

        state.p=0;
        state.lastP = beat.totalLength-1;

        // set buttons
        document.getElementById("stop").removeEventListener("click",stop);
        document.getElementById("playImg").src = "img/play.svg";
    }

    reset = function() {
        clearInterval(state.timerId);
        state.timerId = setInterval(handlePlay,15000/beat.bpm);
    }

    let clear = function() {
        // playing && stop();
        for(i=0;i<beat.trackQty;++i){
            for(j=0;j<beat.totalLength;++j){
                beat.state[i][j] = 0;
            }
            for(j=0;j<length;++j){
                padList[i][j].classList.remove("b"+i);
            }
            beat.volume[i] = 1;
            document.getElementById("trackSetVolume"+i).value = 1;
        }
        beat.beatId = false;
        window.history.replaceState(null,"","index.html");
    }

    // get beat from back end or local storage ---------------------------------------
    if(beat.beatId) {
        console.log(beat.beatId);
        fetch(dbHost+"/exe/getBeat?id="+beat.beatId, {
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
                beat.state = response.beat;
                beat.bpm = response.bpm;
                beat.beatName = response.beatName;
                beat.volume = response.volume;
            }
            document.getElementById("bpm").value = beat.bpm;
            decideLength(mediaQuery);
            createTrackSetting();
        })
        .catch(error => {
            console.error("Load beat error:",error)
        });
    } else {
        if(localStorage.beat) {beat.state = JSON.parse(localStorage.getItem("beat"));}
        if(localStorage.bpm) {beat.bpm = localStorage.getItem("bpm");}
        if(localStorage.volume) {beat.volume = JSON.parse(localStorage.getItem("volume"));}
        document.getElementById("bpm").value = beat.bpm;
        decideLength(mediaQuery);
        createTrackSetting();
    }

    // set top nav button feature -------------------------------------------------------------
    let playBtn = document.getElementById("play");
    playBtn.addEventListener("click",play);
    // document.getElementById("clear").addEventListener("click",clear);
    document.getElementById("clear").addEventListener("click",function(){
        alert("Clear the Beat?!",false,clear);
    });
    
    document.getElementById("metronome").addEventListener("click",function(){
        state.metronome = !state.metronome;
        this.classList.toggle("metronomeOn",state.metronome);
    })
    document.getElementById("kbMode").addEventListener("click",function(){
        state.kbMode = !state.kbMode;
        this.classList.toggle("kbModeOn",state.kbMode);
    })
    let bpmBtn = document.getElementById("bpm");
    bpmBtn.addEventListener("change",function(){
        console.log(this.value);
        beat.bpm = this.value;
        state.playing && reset();
        localStorage.setItem("bpm",beat.bpm);
    });

    let muteBtn = document.getElementById("mute");
    let totalVolumeBtn = document.getElementById("totalVolume")
    muteBtn.addEventListener("click",function(){
        totalVolumeBtn.value = Number(!beat.totalVolume);
        beat.totalVolume = Number(!beat.totalVolume);
        this.classList.toggle("volumeOn",!!beat.totalVolume);
        this.src = "img/volume"+Math.round(beat.totalVolume)*3+".svg";
    })
    totalVolumeBtn.addEventListener("input",function(){
        beat.totalVolume = this.value;
        playingList.forEach(function(item){
            item.gain.value = beat.totalVolume;
        })
        muteBtn.src = "img/volume"+Math.floor(this.value*4)+".svg";
        muteBtn.classList.toggle("volumeOn",beat.totalVolume>0.01);
    });

    // bottom feature menu feature ------------------------------------------
    document.getElementById("visualSwitch").addEventListener("click",function(){
        state.visualMode = (state.visualMode+1)%3;
        this.src = "img/visual"+state.visualMode+".svg";
        this.classList.toggle("visualSwitchOn",state.visualMode);
        // visualMode?draw():window.cancelAnimationFrame(audio.drawVisualId);
        state.visualMode && draw();
    })

    for(i=0;i<beat.trackQty;++i) {
        let drumPad = document.getElementById("drumPad"+i);
        addHitEventHandler(drumPad,i,false);
    }


    // add keyboard event ----------------------------------------------------
    let keyHit = function(i){
        playSound(soundList[i],audio.context.currentTime,beat.volume[i]);
        trackList[i].classList.add("b"+i);
        document.getElementById("drumPad"+i).classList.add("b"+i);
        for(j=0;j<length;++j){
            padList[i][j].classList.add("bSelected");
        }
        if(state.playing && state.kbMode) {
            beat.state[i][state.lastP] = true;
            if((state.lastP-page*length) >= 0 && (state.lastP-page*length) < length){
                padList[i][state.lastP-page*length].classList.toggle("b"+i,true);
            }
        }
    }
    let keyUp = function(i){
        trackList[i].classList.remove("b"+i);
        document.getElementById("drumPad"+i).classList.remove("b"+i);
        for(j=0;j<length;++j){
            padList[i][j].classList.remove("bSelected");
        }
    }
    let deleteTrack = function(i){
        for(j=0;j<beat.totalLength;++j){
            beat.state[i][j] = false;
            if(j<length) {
                padList[i][j].classList.remove("b"+i);
            }
        }
    }
    let toggleOtherTrack = function(i){
        let sum=0;
        let k;
        for(k=0;k<beat.trackQty;++k){
            if(state.trackSwitch[k]) {
                sum++;
            }
        }
        if(sum===1 && state.trackSwitch[i]){
            for(k=0;k<beat.trackQty;++k){
                state.trackSwitch[k] = true;
                document.getElementById("trackSwitch"+k).classList.toggle("b"+k,true);
                if(page===pagePlaying) {
                    padList[k][state.lastP%length].classList.toggle("bOn",true);
                }
            }
        } else {
            for(k=0;k<beat.trackQty;++k){
                state.trackSwitch[k] = (k===i);
                document.getElementById("trackSwitch"+k).classList.toggle("b"+k,k===i);
                if(page===pagePlaying) {
                    padList[k][state.lastP%length].classList.toggle("bOn",k===i);
                }
            }
        }
    }
    let toggleTrackSwitch = function(i){
        state.trackSwitch[i] = !state.trackSwitch[i];
        document.getElementById("trackSwitch"+i).classList.toggle("b"+i,state.trackSwitch[i]);
        if(page===pagePlaying) {
            padList[i][state.lastP%length].classList.toggle("bOn",state.trackSwitch[i]);
        }
    }
    let stepUpDown = function(plus,shift){
        if(shift){
            plus? bpmBtn.stepUp() : bpmBtn.stepDown();
            beat.bpm = bpmBtn.value;
            state.playing && reset();
        } else {
            plus? totalVolumeBtn.stepUp() : totalVolumeBtn.stepDown();
            beat.totalVolume = totalVolumeBtn.value;
            playingList.forEach(function(item){
                item.gain.value = beat.totalVolume;
            })
            muteBtn.src = "img/volume"+Math.floor(beat.totalVolume*4)+".svg";
            muteBtn.classList.toggle("volumeOn",beat.totalVolume>0.01);
        }
    }

    window.onkeydown = function(e) {
        if(document.activeElement.tagName === "INPUT"){
            if(e.keyCode===13) {
                document.activeElement.blur();
            }
            return;
        }
        console.log(e.which);
        e.preventDefault();
        switch(e.which) {
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
            case 48: //0
                state.metronome = !state.metronome;
                document.getElementById("metronome").classList.toggle("metronomeOn",state.metronome);
                break;
            // case 13: //enter
            case 57: //9
                state.kbMode = !state.kbMode;
                document.getElementById("kbMode").classList.toggle("kbModeOn",state.kbMode);
                break;
            case 192: //`
                document.getElementById("visualSwitch").click();
                break;
            case 173: //-
                stepUpDown(false,e.shiftKey);
                break;
            case 189: //-
                stepUpDown(false,e.shiftKey);
                break;
            case 61: //=
                stepUpDown(true,e.shiftKey);
                break;
            case 187: //=
                stepUpDown(true,e.shiftKey);
                break;
            case 49: //1
                if(e.ctrlKey){
                    deleteTrack(0);
                } else if(e.shiftKey){
                    toggleOtherTrack(0);
                } else {
                    toggleTrackSwitch(0);
                }
                break;
            case 50: //2
                if(e.ctrlKey){
                    deleteTrack(1);
                } else if(e.shiftKey){
                    toggleOtherTrack(1);
                } else {
                    toggleTrackSwitch(1);
                }
                break;
            case 51: //3
                if(e.ctrlKey){
                    deleteTrack(2);
                } else if(e.shiftKey){
                    toggleOtherTrack(2);
                } else {
                    toggleTrackSwitch(2);
                }
                break;
            case 52: //4
                if(e.ctrlKey){
                    deleteTrack(3);
                } else if(e.shiftKey){
                    toggleOtherTrack(3);
                } else {
                    toggleTrackSwitch(3);
                }
                break;
            case 53: //5
                if(e.ctrlKey){
                    deleteTrack(4);
                } else if(e.shiftKey){
                    toggleOtherTrack(4);
                } else {
                    toggleTrackSwitch(4);
                }
                break;
            case 54: //6
                if(e.ctrlKey){
                    deleteTrack(5);
                } else if(e.shiftKey){
                    toggleOtherTrack(5);
                } else {
                    toggleTrackSwitch(5);
                }
                break;
            case 55: //7
                if(e.ctrlKey){
                    deleteTrack(6);
                } else if(e.shiftKey){
                    toggleOtherTrack(6);
                } else {
                    toggleTrackSwitch(6);
                }
                break;
            case 56: //8
                if(e.ctrlKey){
                    deleteTrack(7);
                } else if(e.shiftKey){
                    toggleOtherTrack(7);
                } else {
                    toggleTrackSwitch(7);
                }
                break;
            case 66: //b
                keyHit(0);
                break;
            case 67: //c
                keyHit(0);
                break;
            case 78: //n
                keyHit(0);
                break;
            case 86: //v
                keyHit(0);
                break;
            case 68: //d
                keyHit(1);
                break;
            case 70: //f
                keyHit(1);
                break;
            case 72: //h
                keyHit(1);
                break;
            case 74: //j
                keyHit(1);
                break;
            case 83: //s
                keyHit(2);
                break;
            case 88: //x
                keyHit(2);
                break;
            case 75: //k
                keyHit(2);
                break;
            case 77: //m
                keyHit(2);
                break;
            case 90: //z
                keyHit(3);
                break;
            case 188: //,
                keyHit(3);
                break;
            case 71: //g
                keyHit(5);
                break;
            case 84: //t
                keyHit(4);
                break;
            case 82: //r
                keyHit(4);
                break;
            case 89: //y
                keyHit(4);
                break;
            case 65: //a
                keyHit(5);
                break;
            case 76: //l
                keyHit(5);
                break;
            case 81: //q
                keyHit(5);
                break;
            case 69: //e
                keyHit(6);
                break;
            case 85: //u
                keyHit(6);
                break;
            case 87: //w
                keyHit(6);
                break;
            case 73: //i
                keyHit(6);
                break;
            case 79: //o
                keyHit(7);
                break;
            case 80: //p
                keyHit(7);
                break;
        }
    }
    window.onkeyup = function(e) {
        if(document.activeElement.tagName === "INPUT"){return;}
        console.log(e.which);
        e.preventDefault();
        switch(e.which) {
            case 66: //b
                keyUp(0);
                break;
            case 67: //c
                keyUp(0);
                break;
            case 78: //n
                keyUp(0);
                break;
            case 86: //v
                keyUp(0);
                break;
            case 68: //d
                keyUp(1);
                break;
            case 70: //f
                keyUp(1);
                break;
            case 72: //h
                keyUp(1);
                break;
            case 74: //j
                keyUp(1);
                break;
            case 83: //s
                keyUp(2);
                break;
            case 88: //x
                keyUp(2);
                break;
            case 75: //k
                keyUp(2);
                break;
            case 77: //m
                keyUp(2);
                break;
            case 90: //z
                keyUp(3);
                break;
            case 188: //,
                keyUp(3);
                break;
            case 71: //g
                keyUp(5);
                break;
            case 84: //t
                keyUp(4);
                break;
            case 82: //r
                keyUp(4);
                break;
            case 89: //y
                keyUp(4);
                break;
            case 65: //a
                keyUp(5);
                break;
            case 76: //l
                keyUp(5);
                break;
            case 81: //q
                keyUp(5);
                break;
            case 69: //e
                keyUp(6);
                break;
            case 85: //u
                keyUp(6);
                break;
            case 87: //w
                keyUp(6);
                break;
            case 73: //i
                keyUp(6);
                break;
            case 79: //o
                keyUp(7);
                break;
            case 80: //p
                keyUp(7);
                break;
        }
    }


    // beating line setting
    audio.analyser = audio.context.createAnalyser();
    audio.analyser.fftSize = 256;
    audio.analyser.maxDecibels = -90;
    audio.analyser.minDecibels = -100;
    audio.analyser.smoothingTimeConstant = 1;
    audio.analyserFilter = audio.context.createBiquadFilter();
    audio.analyserFilter.type = "lowpass";
    audio.analyserFilter.frequency.value = 2000;
    // audio.analyserFilter.Q.value = 0.1;
    audio.analyserFilter.connect(audio.analyser);
    let bufferLength = audio.analyser.fftSize;
    let dataArray = new Uint8Array(bufferLength);
    // analyser.getByteTimeDomainData(dataArray);
    
    let canvas = document.getElementById("visual");
    let canvasCtx = canvas.getContext("2d");
    let step;
    // draw an oscilloscope of the current audio source
    function draw() {
        audio.drawVisualId = requestAnimationFrame(draw);
        
        canvasCtx.fillStyle = "rgba(15,26,42,1)";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        if(!state.visualMode){
            window.cancelAnimationFrame(audio.drawVisualId);
            return;
        }

        if(mediaQuery[0].matches) {
            canvas.width = 1115;
            step = 2;
        } else if(mediaQuery[1].matches) {
            canvas.width = 555;
            step = 4;
        } else if(mediaQuery[2].matches) {
            canvas.width = 254;
            step = 16;
        } else {
            canvas.width = 275;
            step = 8;
        }
        canvas.height = mediaQuery[2].matches?254:275;

        audio.analyser.getByteTimeDomainData(dataArray);

        canvasCtx.beginPath();
        
        let sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;
        // let x = sliceWidth/2;
        // canvasCtx.moveTo(x, dataArray[0]/128.0*canvas.height/2);
        
        let amp = 0;
        let i;

        if (state.visualMode===1){
            let dir = true;
            canvasCtx.moveTo(x, canvas.height/2);
            for(i=1;i<bufferLength;i+=step) {
                if((dataArray[i]>dataArray[i-1]) !== dir) {
                    canvasCtx.lineTo(x,dataArray[i] / 128 * canvas.height / 2)
                    dir = !dir;
                }
                x += sliceWidth*step;
                amp += dataArray[i] / 128;
            }
        } else if (state.visualMode===2){
            for(i=0;i<bufferLength;i+=step) {
                let v = dataArray[i] / 128.0;
                let y = v * canvas.height/2;
                canvasCtx.moveTo(x, canvas.height/2);
                canvasCtx.lineTo(x, y);
                x += sliceWidth*step;
                amp += v;
            }
            canvasCtx.moveTo(canvas.width , canvas.height/2);
        }

        canvasCtx.lineTo(canvas.width, dataArray[bufferLength-1]/128*canvas.height/2);

        canvasCtx.lineWidth = 3;
        canvasCtx.strokeStyle = "rgba(77,153,204,"+(amp!==bufferLength/step?1:0)+")";
        canvasCtx.stroke();
    };
    // draw();

    let func = [];
    func[0] = document.getElementById("func0");
    func[1] = document.getElementById("func1");
    func[2] = document.getElementById("func2");
    let funcItem = document.querySelectorAll(".funcItem");

    for(let m=0;m<func.length;++m){
        func[m].addEventListener("click",function(){
            for(let n=0;n<func.length;++n){
                funcItem[n].classList.toggle("funcItemOn",m===n && !func[m].classList.contains("funcOn"));
                func[n].classList.toggle("funcOn",m===n && !func[m].classList.contains("funcOn"));
            }
        })
    }

    if(document.querySelector(".loading")) {
        document.querySelector(".loading").style.display = "none";
    }
}


function playSound(buffer,time,volume) {
    let source = audio.context.createBufferSource();
    let gain = audio.context.createGain();

    source.buffer = buffer;
    source.connect(gain);
    gain.connect(audio.analyserFilter);
    gain.gain.value = beat.totalVolume*volume;
    gain.connect(audio.context.destination);
    source.start(time);
    playingList.push(gain);
    source.onended = function(){
        playingList.splice(playingList.indexOf(gain),1);
    };
}

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
    page=Math.floor(state.p/length);
    let padDiv = document.getElementById("padDiv");
        padDiv.style = "grid-template-columns: 40px repeat("+length+",30px);"
    for(let i=0;i<beat.trackQty;++i){
        trackList[i] = cE("div","track");
        trackNumber = cE("div","trackNumber",i+1);
        trackIcon = cE("img","trackIcon","","src","img/track"+i+".svg")
        trackList[i].append(trackNumber,trackIcon);
        trackList[i].addEventListener("mousedown",function(){
            playSound(soundList[i],audio.context.currentTime,beat.volume[i]);
            this.classList.add("b"+i);
            // document.getElementById("trackSetDiv"+s).classList.add("b"+s);
            for(let j=0;j<length;++j){
                padList[i][j].classList.add("bSelected");
            }
            // lastSelect===i || handleSelect(i);
            // lastSelect = i;
        })
        trackList[i].addEventListener("touchstart",function(e){
            e.preventDefault();
            playSound(soundList[i],audio.context.currentTime,beat.volume[i]);
            this.classList.add("b"+i);
            // document.getElementById("trackSetDiv"+s).classList.add("b"+s);
            for(let j=0;j<length;++j){
                padList[i][j].classList.add("bSelected");
            }
            // lastSelect===i || handleSelect(i);
            // lastSelect = i;
        })
        trackList[i].addEventListener("mouseup",function(){
            this.classList.remove("b"+i);
            for(let j=0;j<length;++j){
                padList[i][j].classList.remove("bSelected");
            }
        })
        trackList[i].addEventListener("touchend",function(e){
            e.preventDefault();
            this.classList.remove("b"+i);
            for(let j=0;j<length;++j){
                padList[i][j].classList.remove("bSelected");
            }
            
        })
        padDiv.appendChild(trackList[i]);
        for(let j=0;j<length;++j){
            padList[i][j] = cE("div",j%4?"b":"bp","","id",i+"-"+j);
            padList[i][j].addEventListener("click",function(){
                beat.state[i][j+page*length] = !beat.state[i][j+page*length];
                beat.state[i][j+page*length] && !state.playing && playSound(soundList[i],audio.context.currentTime,beat.volume[i]);
                padList[i][j].classList.toggle("b"+i);
                state.lastSelect===i || handleSelect(i);
                state.lastSelect = i;
            })
            beat.state[i][j+page*length] && padList[i][j].classList.add("b"+i);
            padDiv.appendChild(padList[i][j]);
        }
    }

    padDiv.appendChild(cE("div"));
    // padDiv.appendChild(funcItemDiv);
    for(let j=0;j<length;++j){
        pointNumberList[j] = cE("div",j%4?"pointNumber":"pointNumberP",j%4?(j%4)+1:((j+page*length)/4)+1);
        padDiv.appendChild(pointNumberList[j]);
    }

}

function createPageButton() {
    let totalPage = beat.totalLength/length;
    for(let m=0;m<totalPage;++m) {
        pageList[m] = cE("div","pageButton");
        m===page && pageList[m].classList.add("pageNow");
        pageList[m].addEventListener("click",function(){
            if(state.playing) {state.autoPage = false;}

            // when page is on playing, remove hit block and point number
            if(Math.floor(state.lastP/length)===page){
                console.log(state.p,state.p,page);
                for(let i=0;i<beat.trackQty;++i){
                    padList[i][(state.p+length-1)%length].classList.remove("bOn");
                }
                pointNumberList[(state.p+length-1)%length].classList.remove("pointNumberOn");
            }
            
            page=m;
            for(let i=0;i<beat.trackQty;++i){
                for(let j=0;j<length;++j){
                    padList[i][j].classList.toggle("b"+i,beat.state[i][j+page*length]);
                }
            }
            if(Math.floor(state.lastP/length)===page){
                pointNumberList[state.lastP%length].classList.add("pointNumberOn");
                for(let i=0;i<beat.trackQty;++i){
                    padList[i][state.lastP%length].classList.add("bOn");
                }
            }
            
            // change point number
            for(let j=0;j<length;j+=4){
                pointNumberList[j].textContent = ((j+page*length)/4)+1;
            }
            for(let n=0;n<totalPage;++n){
                pageList[n].classList.toggle("pageNow",n===m);
            }
        })
        document.getElementById("pageDiv").appendChild(pageList[m]);
    }
}

function handleSelect(s){
    if(trackList[state.lastSelect]) {
        trackList[state.lastSelect].classList.remove("b"+state.lastSelect);
        // document.getElementById("trackSetDiv"+lastSelect).classList.remove("b"+lastSelect);
    }
    trackList[s].classList.add("b"+s);
    // document.getElementById("trackSetDiv"+s).classList.add("b"+s);
    for(let j=0;j<length;++j){
        padList[state.lastSelect] && padList[state.lastSelect][j].classList.remove("bSelected");
        // if(!beat.state[s][j]) 
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

function addHitEventHandler(element,i,parent) {
    element.addEventListener("mousedown",function(){
        playSound(soundList[i],audio.context.currentTime,beat.volume[i]);
        parent?element.parentNode.classList.add("b"+i):element.classList.add("b"+i);
        trackList[i].classList.add("b"+i);
        for(let j=0;j<length;++j){
            padList[i][j].classList.add("bSelected");
        }
        if(state.playing && state.kbMode) {
            beat.state[i][state.lastP] = true;
            if((state.lastP-page*length) >= 0 || (state.lastP-page*length) < length){
                padList[i][state.lastP-page*length].classList.toggle("b"+i,true);
            }
        }
    })
    element.addEventListener("touchstart",function(e){
        e.preventDefault();
        playSound(soundList[i],audio.context.currentTime,beat.volume[i]);
        parent?element.parentNode.classList.add("b"+i):element.classList.add("b"+i);
        trackList[i].classList.add("b"+i);
        for(let j=0;j<length;++j){
            padList[i][j].classList.add("bSelected");
        }
        if(state.playing && state.kbMode) {
            beat.state[i][state.lastP] = true;
            if((state.lastP-page*length) >= 0 || (state.lastP-page*length) < length){
                padList[i][state.lastP-page*length].classList.toggle("b"+i,true);
            }
        }
    })
    element.addEventListener("mouseup",function(){
        parent?element.parentNode.classList.remove("b"+i):element.classList.remove("b"+i);
        trackList[i].classList.remove("b"+i);
        for(let j=0;j<length;++j){
            padList[i][j].classList.remove("bSelected");
        }
    })
    element.addEventListener("touchend",function(e){
        e.preventDefault();
        parent?element.parentNode.classList.remove("b"+i):element.classList.remove("b"+i);
        trackList[i].classList.remove("b"+i);
        for(let j=0;j<length;++j){
            padList[i][j].classList.remove("bSelected");
        }
    })
}

function createTrackSetting() {
    for(let i=0;i<8;++i){
        let trackSetDiv = cE("div","trackSetDiv",null,"id","trackSetDiv"+i);

        let trackSetVolume = cE("input","trackSetVolume",null,"id","trackSetVolume"+i);
            trackSetVolume.type = "range";
            trackSetVolume.max = 1;
            trackSetVolume.min = 0;
            trackSetVolume.step = "any";
            trackSetVolume.value = beat.volume[i];

            trackSetVolume.addEventListener("input",function(e){
                beat.volume[i] = this.value;
            })

        let trackSetSwitch = cE("div","trackSetSwitch",null,"id","trackSwitch"+i);
            trackSetSwitch.classList.toggle("b"+i,state.trackSwitch[i]);
            trackSetSwitch.addEventListener("touchstart",function(e){
                e.preventDefault();
                e.stopPropagation();
                state.trackSwitch[i] = !state.trackSwitch[i];
                this.classList.toggle("b"+i,state.trackSwitch[i]);
                if(page===pagePlaying) {
                    padList[i][state.lastP%length].classList.toggle("bOn",state.trackSwitch[i]);
                }
            })
            trackSetSwitch.addEventListener("mousedown",function(e){
                state.trackSwitch[i] = !state.trackSwitch[i];
                this.classList.toggle("b"+i,state.trackSwitch[i]);
                if(page===pagePlaying) {
                    padList[i][state.lastP%length].classList.toggle("bOn",state.trackSwitch[i]);
                }
                e.stopPropagation();
            })

        let trackSetNum = cE("div","trackSetNum",i+1);
        addHitEventHandler(trackSetNum,i,true);
        let trackSetIcon = cE("img","trackSetIcon",null,"src","img/track"+i+".svg");
        addHitEventHandler(trackSetIcon,i,true);
        trackSetDiv.append(trackSetVolume,trackSetSwitch,trackSetNum,trackSetIcon);
        document.getElementById("trackSettingListDiv").appendChild(trackSetDiv);
    }
}

// save to local storage
function saveBeatToLocalStorage() {
    let beatString = JSON.stringify(beat.state);
    localStorage.setItem("beat",beatString);
    localStorage.setItem("bpm",beat.bpm);
    localStorage.setItem("volume",JSON.stringify(beat.volume));
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
            beat.beatName = this.value;
            console.log(beat.beatName);
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
        beatId:beat.beatId || false,
        user:authStatus().uid,
        beat:beat.state,
        beatName:beat.beatName,
        bpm:beat.bpm,
        length:length,
        volume:beat.volume
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
            if(newBeatId !== beat.beatId) {
                console.log(newBeatId);
                removeUserBeatList();
                getUserBeatList(authStatus().uid);
                window.history.pushState(null,beat.beatName,"index.html?id="+newBeatId);
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
        beat:beat.state,
        beatName:beat.beatName,
        bpm:beat.bpm,
        length:length,
        volume:beat.volume
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
            alert("Beat saved!", true);
            console.log("Update to database success:",response);
            let newBeatId = response.newBeatId;
            removeUserBeatList();
            getUserBeatList(authStatus().uid);
            window.history.pushState(null,beat.beatName,"index.html?id="+newBeatId);
        }
    })
    .catch(error => {
        alert("The beat isn't saved, please try again later. :(");
        console.error("Update to database error:",error)
    });
}

function popUpShareBeat() {
    let mySheild = cE("div","shield");
    let myNaming = cE("div","naming");
    let shareLink = "https://beatingline.com/index.html?id="+beat.beatId;
    let closeNaming = function() {
        mySheild.parentNode.removeChild(mySheild);
        myNaming.parentNode.removeChild(myNaming);
    }

    let myNamingText = cE('div', "namingText","Copy link and share!");
    let myNamingInput = cE("input","namingInput",null,"value",shareLink);
        myNamingInput.select();
        // myNamingInput.addEventListener("change",function(){
        //     beatName = this.value;
        //     console.log(beatName);
        // })
    let myNamingCopy = cE("div","namingCopy","Link copied!");
        myNamingCopy.style.display = "none";
	let myNamingBtnDiv = cE("div","namingBtnDiv");
	let myNamingBtn = cE('button', "namingBtn", "Copy");
	myNamingBtn.addEventListener('click', function () {
        myNamingInput.select();
        document.execCommand("copy");
        myNamingCopy.style.display = "block";
		// cb && cb();
        // closeNaming();
    });
    let myNamingBtn2 = cE('button', "namingCancel", "Okay");
    myNamingBtn2.addEventListener('click',closeNaming);

    myNamingBtnDiv.append(myNamingBtn,myNamingBtn2);
    
    myNaming.append(myNamingText,myNamingInput,myNamingCopy,myNamingBtnDiv);
	document.body.append(mySheild, myNaming);
}