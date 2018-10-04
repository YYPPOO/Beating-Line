// states --------------------------------------------------------------------------
let context;
let bufferLoader;
let bpm = 120;
let totalVolume = 1;
let playingList = [];

let t = 60/bpm/4;
let p=0;
let length = 16;
let trackQty = 8;
let bit = 16;
let playing = false;

let soundList = [];

let volume = [1,1,1,1,1,1,1,1];
let state = [];
for(let i=0;i<trackQty;i++) {
    state[i] = [];
    for(let j=0;j<length;j++) {
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

function decideLength(media) {
    if(mediaQuery[0].matches) {
        length = 32;
        console.log("A",length);
        removePad();
        createPad(soundList);
        return;
    } else if(mediaQuery[1].matches) {
        length = 16;
        console.log("B",length);
        removePad();
        createPad(soundList);
        return;
    } else {
        length = 8;
        console.log("C",length);
        removePad();
        createPad(soundList);
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
        "sound/7atm0.wav"
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
        authStatus() ? popUpSaveBeat(saveBeat) : popUpLogIn();
    });
    document.getElementById("saveAs").addEventListener("click",function(){
        authStatus() ? popUpSaveBeat(saveAsNewBeat) : popUpLogIn();
    });
    document.getElementById("download").addEventListener("click",function(){
        alert("功能即將開放，敬請期待。");
    });

}

function playByPoint(soundList,p){
    let startTime = context.currentTime;
    for (let i=0;i<8;i++){
        state[i][p%length] && playSound(soundList[i],startTime+0.05);
        padList[i][(p+length-1)%length].classList.remove("bOn");
        padList[i][p%length].classList.add("bOn");
    }
}

function finishedLoading(bufferList) {

    let intervalID;
    soundList = bufferList;
    
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

    // get beat from back end or local storage ---------------------------------------
    if(beatId) {
        fetch(dbHost+"/exe/getBeat?id="+beatId, {
            method:"GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.json())
        .then(response => {
            console.log("Load beat success:",response);
            state = response.beat;
            bpm = response.bpm;
        })
        .catch(error => {
            console.error("Load beat error:",error)
        });
    } else {
        if(localStorage.beat) {state = JSON.parse(localStorage.getItem("beat"));}
        if(localStorage.bpm) {bpm = localStorage.getItem("bpm");}
    }

    // set button feature -------------------------------------------------------------
    document.getElementById("play").addEventListener("click",play);
    // document.getElementById("clear").addEventListener("click",clear);
    document.getElementById("clear").addEventListener("click",function(){alert("確認清除？",false,clear)});

    document.getElementById("bpm").value = bpm;
    document.getElementById("bpm").addEventListener("change",function(){
        console.log(this.value);
        bpm = this.value;
        playing && reset();
        localStorage.setItem("bpm",bpm);
    });
    
    document.getElementById("totalVolume").addEventListener("change",function(){
        totalVolume = this.value;
        playingList.forEach(function(item){
            item.gain.value = totalVolume;
        })
    });

    // document.getElementById("save").addEventListener("click",saveBeat);

    decideLength(mediaQuery);
    // decideLengthB(mediaB);
    // createPad(bufferList);



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
function createPad(soundList){

    let padDiv = document.getElementById("padDiv");
        padDiv.style = "grid-template-columns: 55px repeat("+length+",30px);"
    let lastSelect;
    for(let i=0;i<8;i++){
        trackList[i] = cE("div","track");
        trackNumber = cE("div","trackNumber",i+1);
        trackIcon = cE("img","trackIcon","","src","img/track"+i+".svg")
        trackList[i].append(trackNumber,trackIcon);
        trackList[i].addEventListener("click",function(){
            playSound(soundList[i],context.currentTime);
            lastSelect==i || handleSelect(i);
            lastSelect = i;
        })
        padDiv.appendChild(trackList[i]);
        for(let j=0;j<length;j++){
            padList[i][j] = cE("div",j%4?"b":"bp","","id",i+"-"+j);
            padList[i][j].addEventListener("click",function(){
                state[i][j] = !state[i][j];
                state[i][j] && !playing && playSound(soundList[i],context.currentTime);
                padList[i][j].classList.toggle("b"+i);
                lastSelect==i || handleSelect(i);
                lastSelect = i;
                saveBeatToLocalStorage();
            })
            state[i][j] && padList[i][j].classList.add("b"+i);
            padDiv.appendChild(padList[i][j]);
        }
    }
    padDiv.appendChild(cE("div"));
    for(let j=0;j<length;j++){
        padDiv.appendChild(cE("div","pointNumber",j+1));
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

function removePad() {
    let padDiv = document.getElementById("padDiv");
    while (padDiv.hasChildNodes()) {
        padDiv.removeChild(padDiv.firstChild);
    }
}
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

    let myNamingText = cE('div', "namingText","請輸入節奏名稱");
    let myNamingInput = cE("input","namingInput",null,"placeholder","Untitled");
        myNamingInput.id = "beatName";
        myNamingInput.addEventListener("change",function(){
            beatName = this.value;
            console.log(beatName);
        })
    
	let myNamingBtnDiv = cE("div","namingBtnDiv");
	let myNamingBtn = cE('button', "namingBtn", "確認");
	myNamingBtn.addEventListener('click', function () {
		cb && cb();
        closeNaming();
    });
    let myNamingBtn2 = cE('button', "namingCancel", "取消");
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

    // 準備要放 fetch post 的地方
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
            alert(response.error+" 請再試一次 :)");
            console.error("Update to database error:",response.error)
        } else {
            alert("資料已儲存！", true);
            console.log("Update to database success:",response);
            let newBeatId = response.newBeatId;
            if(newBeatId !== beatId) {
                console.log(newBeatId);
                // window.location = "index.html?id="+newBeatId;
            }
        }
    })
    .catch(error => {
        alert(error+" 請再試一次 :)");
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

    // 準備要放 fetch post 的地方
    fetch(dbHost+"/exe/saveAsNewBeat", {
        method:"POST",
        body: JSON.stringify(beatData),
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        }
    }).then(res => res.json())
    .then(response => {
        alert("資料已儲存，將於 3 秒後跳轉頁面。", true);
        console.log("Update to database success:",response);
        let newBeatId = response.newBeatId;
        setTimeOut(function(){
            window.location = "index.html?id="+newBeatId;
        },3000);
    })
    .catch(error => {
        alert("資料更新失敗，請再試一次 :(");
        console.error("Update to database error:",error)
    });
}