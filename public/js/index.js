// setting global variables -----------------------------------------------------
let audio = {
  playingList: [],
  soundList: [],
  context: null,
  bufferLoader: null,
  analyser: null,
  analyserFilter: null,
  drawVisualId: null,
  delay: 0.05,
  urlList: [
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
  trackName: ["Kick", "Snare", "Close Hat", "Open Hat", "Tom", "Clap", "Conga", "Atm"]
};

let beat = {
  bpm: 120,
  totalVolume: 1,
  beatId: "",
  beatName: "",
  state: [],
  volume: [1, 1, 1, 1, 1, 1, 1, 1],
  trackQty: 8,
  totalLength: 32
};

let state = {
  p: -1,
  lastP: beat.totalLength - 1,
  playing: false,
  autoPage: true,
  metronome: false,
  kbMode: false,
  visualMode: 0,
  trackSwitch: [true, true, true, true, true, true, true, true],
  lastSelect: null,
  timerId: null,
  length: 16,
  step: 4,
  page: 0,
  pagePlaying: 0
};

let dom = {
  pageList: [],
  trackList: [],
  padList: [],
  pointNumberList: [],
  drumPad: [],
  trackSetSwitch: []
};

// initial beats ------------------------------------------------------------------
let rhythm = [];
rhythm[0] = {
  state: [
    [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
  ],
  bpm: 60
};
rhythm[1] = {
  state: [
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1],
    [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  bpm: 100
};
rhythm[2] = {
  state: [
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1],
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  ],
  bpm: 120
};
rhythm[3] = {
  state: [
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  bpm: 100
};

// media query ------------------------------------------------------
let decideLength = function (media) {
  dom.canvas.height = 275;
  if (mediaQuery[0].matches) {
    state.length = 32;
    state.step = 2;
    dom.canvas.width = 1115;
    removePad();
    createPad();
    return;
  } else if (mediaQuery[1].matches) {
    state.length = 16;
    state.step = 4;
    dom.canvas.width = 555;
  } else {
    state.length = 8;
    state.step = 8;
    dom.canvas.width = 275;
    if (mediaQuery[2].matches) {
      dom.canvas.width = 254;
      dom.canvas.height = 254;
    }
  }
  removePad();
  createPad();
  createPageButton();
  return;
}

let mediaQuery = [
  window.matchMedia("(min-width: 1200px)"),
  window.matchMedia("(min-width: 650px)"),
  window.matchMedia("(max-width: 375px)")
];

// flow control -----------------------------------------------------------
window.onload = init;

function init() {
  let i;
  let j;
  //setting initial beat and dom
  for (i = 0; i < beat.trackQty; ++i) {
    beat.state[i] = [];
    dom.padList[i] = [];
    dom.drumPad[i] = app.get("drumPad" + i);
    for (j = 0; j < beat.totalLength; ++j) {
      beat.state[i].push(0);
    }
  }
  let random = Math.floor(4 * Math.random());
  beat.state = rhythm[random].state;
  beat.bpm = rhythm[random].bpm;
  dom.canvas = app.get("visual");


  // load audio context
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  audio.context = new AudioContext();
  audio.bufferLoader = new BufferLoader(audio.context, audio.urlList, finishedLoading);
  audio.bufferLoader.load();

  addSideNavFunc();
}

function finishedLoading(bufferList) {

  audio.soundList = bufferList;
  let i;
  let j;

  // get beat id from url
  beat.beatId = new URL(window.location).searchParams.get("id") || "";

  // get beat from back end or local storage ---------------------------------------
  if (beat.beatId) {
    console.log(beat.beatId);
    fetch(dbHost + "/exe/getBeat?id=" + beat.beatId, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json"
      })
    }).then(res => res.json())
      .then(response => {
        if (response.error) {
          console.error("Load beat error:", response.error)
        } else {
          console.log("Load beat success:", response);
          beat.state = response.beat;
          beat.bpm = response.bpm;
          beat.beatName = response.beatName;
          beat.volume = response.volume;
        }
        app.get("bpm").value = beat.bpm;
        decideLength(mediaQuery);
        app.get("loading").style.display = "none";
        //setting media query
        for (i = 0; i < mediaQuery.length; ++i) {
          mediaQuery[i].addListener(decideLength);
        }
        createTrackSetting();
      })
      .catch(error => {
        console.error("Load beat error:", error)
      });
  } else {
    if (localStorage.beat) { beat.state = JSON.parse(localStorage.getItem("beat")); }
    if (localStorage.bpm) { beat.bpm = localStorage.getItem("bpm"); }
    if (localStorage.volume) { beat.volume = JSON.parse(localStorage.getItem("volume")); }
    app.get("bpm").value = beat.bpm;
    decideLength(mediaQuery);
    app.get("loading").style.display = "none";
    //setting media query
    for (i = 0; i < mediaQuery.length; ++i) {
      mediaQuery[i].addListener(decideLength);
    }
    createTrackSetting();
  }

  setTopNavButton();
  addKeyEvent();
  setAudioAnalyser();
  setBottomFunc();
}

app.playByPoint = function (soundList, onPage, lastOnPage) {
  let startTime = audio.context.currentTime;
  let p = state.p % state.length;
  let lastP = state.lastP % state.length;
  let i;
  for (i = 0; i < beat.trackQty; ++i) {
    if (state.trackSwitch[i]) {
      beat.state[i][state.p] && playSound(soundList[i], startTime + audio.delay, beat.volume[i]);
      onPage && dom.padList[i][p].classList.add("bOn");
    }
    lastOnPage && dom.padList[i][lastP].classList.remove("bOn");
  }
  onPage && dom.pointNumberList[p].classList.add("pointNumberOn");
  lastOnPage && dom.pointNumberList[lastP].classList.remove("pointNumberOn");
}

// add top nav button event -----------------------------------------------------------
app.handlePlay = function () {
  // control state
  // if(state.playing) {
  state.lastP = state.p;
  state.p = (state.p + 1) >= beat.totalLength ? 0 : (state.p + 1);
  // state.p = (state.p+1)%beat.totalLength;
  // ^^^^^^^ another method to add state.p
  // } else {
  // }

  let onPage = state.p >= state.page * state.length && state.p < (state.page + 1) * state.length;
  let lastOnPage = state.lastP >= state.page * state.length && state.lastP < (state.page + 1) * state.length;
  app.playByPoint(audio.soundList, onPage, lastOnPage);

  // change page
  if (state.p % state.length === 0) {
    if (dom.pageList[state.pagePlaying]) {
      state.autoPage && dom.pageList[state.page].classList.remove("pageNow");
      dom.pageList[state.pagePlaying].classList.remove("pagePlaying");
    }
    state.pagePlaying = state.p / state.length;

    // auto turn page part
    if (state.autoPage) {
      state.page = state.pagePlaying;
      let i;
      let j;
      for (i = 0; i < beat.trackQty; ++i) {
        if (state.trackSwitch[i]) {
          dom.padList[i][0].classList.add("bOn");
        }
        for (j = 0; j < state.length; ++j) {
          dom.padList[i][j].classList.toggle("b" + i, beat.state[i][j + state.page * state.length])
        }
      }
      dom.pointNumberList[0].classList.add("pointNumberOn");
      //change point number
      for (j = 0; j < state.length; j += 4) {
        dom.pointNumberList[j].textContent = ((j + state.page * state.length) / 4) + 1;
      }
    }

    // change page button
    if (dom.pageList[state.pagePlaying]) {
      state.autoPage && dom.pageList[state.pagePlaying].classList.add("pageNow");
      dom.pageList[state.pagePlaying].classList.add("pagePlaying");
    }
  }

  // metronome sound and view
  if (state.metronome && state.p % 4 === 0) {
    playSound((state.p / 4) % 4 ? audio.soundList[9] : audio.soundList[8], audio.context.currentTime + audio.delay, beat.totalVolume);
    app.get("metronome").src = state.p % 8 ? "img/metronome.svg" : "img/metronome1.svg";
  }

  // kb mode icon view
  if (state.kbMode && state.p % 4 === 0) {
    app.get("kbMode").src = "img/kbMode" + (state.p % 16) / 4 + ".svg";
  }
}

// playing control
app.play = function () {
  if (state.playing) {
    // pause
    clearInterval(state.timerId);
    state.playing = false;
    app.get("playImg").src = "img/play.svg";
  } else {
    state.playing = true;
    state.timerId = setInterval(app.handlePlay, 15000 / beat.bpm);
    app.get("stop").removeEventListener("click", app.stop);
    app.event("stop", "click", app.stop);
    app.get("playImg").src = "img/pause.svg";
  }
}

app.stop = function () {
  clearInterval(state.timerId);

  // turn off audios
  audio.playingList.forEach(function (item) {
    item.gain.setTargetAtTime(0, audio.context.currentTime, 0.5);
  })

  // turn off the "On" blocks
  if (state.page === state.pagePlaying) {
    let p = state.p % state.length;
    for (i = 0; i < beat.trackQty; ++i) {
      dom.padList[i][p].classList.remove("bOn");
    }
    dom.pointNumberList[p].classList.remove("pointNumberOn");
  }

  // initial state
  dom.pageList[state.pagePlaying] && dom.pageList[state.pagePlaying].classList.remove("pagePlaying");
  state.playing = false;
  state.autoPage = true;
  state.p = -1;
  state.lastP = beat.totalLength - 1;

  // set buttons
  app.get("stop").removeEventListener("click", app.stop);
  app.get("playImg").src = "img/play.svg";
}

app.reset = function () {
  clearInterval(state.timerId);
  state.timerId = setInterval(app.handlePlay, 15000 / beat.bpm);
}

app.clear = function () {
  for (i = 0; i < beat.trackQty; ++i) {
    for (j = 0; j < beat.totalLength; ++j) {
      beat.state[i][j] = 0;
    }
    for (j = 0; j < state.length; ++j) {
      dom.padList[i][j].classList.remove("b" + i);
    }
    beat.volume[i] = 1;
    app.get("trackSetVolume" + i).value = 1;
  }
  beat.beatId = false;
  window.history.replaceState(null, "", "index.html");
}

let setTopNavButton = function () {
  app.event("play", "click", app.play);

  let muteBtn = app.get("mute");
  let totalVolumeBtn = app.get("totalVolume");
  muteBtn.addEventListener("click", function () {
    totalVolumeBtn.value = Number(!beat.totalVolume);
    beat.totalVolume = Number(!beat.totalVolume);
    this.classList.toggle("volumeOn", !!beat.totalVolume);
    this.src = "img/volume" + Math.round(beat.totalVolume) * 3 + ".svg";
  })
  totalVolumeBtn.addEventListener("input", function () {
    beat.totalVolume = this.value;
    audio.playingList.forEach(function (item) {
      item.gain.value = beat.totalVolume;
    })
    muteBtn.src = "img/volume" + Math.floor(this.value * 4) + ".svg";
    muteBtn.classList.toggle("volumeOn", beat.totalVolume > 0.01);
  });

  app.event("visualSwitch", "click", function () {
    state.visualMode = (state.visualMode + 1) % 3;
    this.src = "img/visual" + state.visualMode + ".svg";
    this.classList.toggle("visualSwitchOn", state.visualMode);
    state.visualMode && app.draw();
  })
  app.event("kbMode", "click", function () {
    state.kbMode = !state.kbMode;
    this.classList.toggle("kbModeOn", state.kbMode);
  })
  app.event("metronome", "click", function () {
    state.metronome = !state.metronome;
    this.classList.toggle("metronomeOn", state.metronome);
  })
  app.event("bpm", "click", function () {
    this.select();
  });
  app.event("bpm", "change", function () {
    beat.bpm = this.value;
    state.playing && app.reset();
    localStorage.setItem("bpm", beat.bpm);
  });
  app.event("clear", "click", function () {
    alert("Clear the Beat?!", false, app.clear);
  });
}

// add keyboard event ----------------------------------------------------
app.keyHit = function (i) {
  playSound(audio.soundList[i], audio.context.currentTime, beat.volume[i]);
  dom.trackList[i].classList.add("b" + i);
  dom.drumPad[i].classList.add("b" + i);
  let j;
  for (j = 0; j < state.length; ++j) {
    dom.padList[i][j].classList.add("bSelected");
  }
  if (state.playing && state.kbMode) {
    beat.state[i][state.p] = true;
    if (state.page === state.pagePlaying && state.p >= 0) {
      dom.padList[i][state.p % state.length].classList.toggle("b" + i, true);
    }
  }
}
app.keyUp = function (i) {
  dom.trackList[i].classList.remove("b" + i);
  dom.drumPad[i].classList.remove("b" + i);
  let j;
  for (j = 0; j < state.length; ++j) {
    dom.padList[i][j].classList.remove("bSelected");
  }
}
app.deleteTrack = function (i) {
  let j;
  for (j = 0; j < beat.totalLength; ++j) {
    beat.state[i][j] = false;
    if (j < state.length) {
      dom.padList[i][j].classList.remove("b" + i);
    }
  }
}
app.toggleOtherTrack = function (i) {
  let sum = 0;
  let k;
  for (k = 0; k < beat.trackQty; ++k) {
    if (state.trackSwitch[k]) {
      sum++;
    }
  }
  if (sum === 1 && state.trackSwitch[i]) {
    for (k = 0; k < beat.trackQty; ++k) {
      state.trackSwitch[k] = true;
      dom.trackSetSwitch[k].classList.toggle("b" + k, true);
      if (state.page === state.pagePlaying && state.p >= 0) {
        dom.padList[k][state.p % state.length].classList.toggle("bOn", true);
      }
    }
  } else {
    for (k = 0; k < beat.trackQty; ++k) {
      state.trackSwitch[k] = (k === i);
      dom.trackSetSwitch[k].classList.toggle("b" + k, k === i);
      if (state.page === state.pagePlaying && state.p >= 0) {
        dom.padList[k][state.p % state.length].classList.toggle("bOn", k === i);
      }
    }
  }
}
app.toggleTrack = function (i) {
  state.trackSwitch[i] = !state.trackSwitch[i];
  dom.trackSetSwitch[i].classList.toggle("b" + i, state.trackSwitch[i]);
  if (state.page === state.pagePlaying && state.p >= 0) {
    dom.padList[i][state.p % state.length].classList.toggle("bOn", state.trackSwitch[i]);
  }
}
app.stepUpDown = function (plus, shift) {
  if (shift) {
    let bpmBtn = app.get("bpm");
    plus ? bpmBtn.stepUp() : bpmBtn.stepDown();
    beat.bpm = bpmBtn.value;
    state.playing && app.reset();
  } else {
    let muteBtn = app.get("mute");
    let totalVolumeBtn = app.get("totalVolume");
    plus ? totalVolumeBtn.stepUp() : totalVolumeBtn.stepDown();
    beat.totalVolume = totalVolumeBtn.value;
    audio.playingList.forEach(function (item) {
      item.gain.value = beat.totalVolume;
    })
    muteBtn.src = "img/volume" + Math.floor(beat.totalVolume * 4) + ".svg";
    muteBtn.classList.toggle("volumeOn", beat.totalVolume > 0.01);
  }
}
let addKeyEvent = function () {
  window.onkeydown = function (e) {
    if (document.activeElement.tagName === "INPUT") {
      e.keyCode === 13 && document.activeElement.blur();
      return;
    }
    console.log(e.which);
    e.preventDefault();
    switch (e.which) {
      case 32: //" "
        document.activeElement.blur();
        app.play();
        break;
      case 27: //esc
        app.stop();
        break;
      case 46: //delete
        e.ctrlKey && app.clear();
        e.shiftKey && app.clear();
        break;
      case 48: //0
        app.get("metronome").click();
        break;
      // case 13: //enter
      case 57: //9
        app.get("kbMode").click();
        break;
      case 192: //`
        app.get("visualSwitch").click();
        break;
      case 173: //-
        app.stepUpDown(false, e.shiftKey);
        break;
      case 189: //-
        app.stepUpDown(false, e.shiftKey);
        break;
      case 61: //=
        app.stepUpDown(true, e.shiftKey);
        break;
      case 187: //=
        app.stepUpDown(true, e.shiftKey);
        break;
      case 49: //1
        if (e.ctrlKey) {
          app.deleteTrack(0);
        } else if (e.shiftKey) {
          app.toggleOtherTrack(0);
        } else {
          app.toggleTrack(0);
        }
        break;
      case 50: //2
        if (e.ctrlKey) {
          app.deleteTrack(1);
        } else if (e.shiftKey) {
          app.toggleOtherTrack(1);
        } else {
          app.toggleTrack(1);
        }
        break;
      case 51: //3
        if (e.ctrlKey) {
          app.deleteTrack(2);
        } else if (e.shiftKey) {
          app.toggleOtherTrack(2);
        } else {
          app.toggleTrack(2);
        }
        break;
      case 52: //4
        if (e.ctrlKey) {
          app.deleteTrack(3);
        } else if (e.shiftKey) {
          app.toggleOtherTrack(3);
        } else {
          app.toggleTrack(3);
        }
        break;
      case 53: //5
        if (e.ctrlKey) {
          app.deleteTrack(4);
        } else if (e.shiftKey) {
          app.toggleOtherTrack(4);
        } else {
          app.toggleTrack(4);
        }
        break;
      case 54: //6
        if (e.ctrlKey) {
          app.deleteTrack(5);
        } else if (e.shiftKey) {
          app.toggleOtherTrack(5);
        } else {
          app.toggleTrack(5);
        }
        break;
      case 55: //7
        if (e.ctrlKey) {
          app.deleteTrack(6);
        } else if (e.shiftKey) {
          app.toggleOtherTrack(6);
        } else {
          app.toggleTrack(6);
        }
        break;
      case 56: //8
        if (e.ctrlKey) {
          app.deleteTrack(7);
        } else if (e.shiftKey) {
          app.toggleOtherTrack(7);
        } else {
          app.toggleTrack(7);
        }
        break;
      case 66: //b
        app.keyHit(0);
        break;
      case 67: //c
        app.keyHit(0);
        break;
      case 78: //n
        app.keyHit(0);
        break;
      case 86: //v
        app.keyHit(0);
        break;
      case 68: //d
        app.keyHit(1);
        break;
      case 70: //f
        app.keyHit(1);
        break;
      case 72: //h
        app.keyHit(1);
        break;
      case 74: //j
        app.keyHit(1);
        break;
      case 83: //s
        app.keyHit(2);
        break;
      case 88: //x
        app.keyHit(2);
        break;
      case 75: //k
        app.keyHit(2);
        break;
      case 77: //m
        app.keyHit(2);
        break;
      case 90: //z
        app.keyHit(3);
        break;
      case 188: //,
        app.keyHit(3);
        break;
      case 71: //g
        app.keyHit(5);
        break;
      case 84: //t
        app.keyHit(4);
        break;
      case 82: //r
        app.keyHit(4);
        break;
      case 89: //y
        app.keyHit(4);
        break;
      case 65: //a
        app.keyHit(5);
        break;
      case 76: //l
        app.keyHit(5);
        break;
      case 81: //q
        app.keyHit(5);
        break;
      case 69: //e
        app.keyHit(6);
        break;
      case 85: //u
        app.keyHit(6);
        break;
      case 87: //w
        app.keyHit(6);
        break;
      case 73: //i
        app.keyHit(6);
        break;
      case 79: //o
        app.keyHit(7);
        break;
      case 80: //p
        app.keyHit(7);
        break;
    }
  }
  window.onkeyup = function (e) {
    if (document.activeElement.tagName === "INPUT") { return; }
    e.preventDefault();
    switch (e.which) {
      case 66: //b
        app.keyUp(0);
        break;
      case 67: //c
        app.keyUp(0);
        break;
      case 78: //n
        app.keyUp(0);
        break;
      case 86: //v
        app.keyUp(0);
        break;
      case 68: //d
        app.keyUp(1);
        break;
      case 70: //f
        app.keyUp(1);
        break;
      case 72: //h
        app.keyUp(1);
        break;
      case 74: //j
        app.keyUp(1);
        break;
      case 83: //s
        app.keyUp(2);
        break;
      case 88: //x
        app.keyUp(2);
        break;
      case 75: //k
        app.keyUp(2);
        break;
      case 77: //m
        app.keyUp(2);
        break;
      case 90: //z
        app.keyUp(3);
        break;
      case 188: //,
        app.keyUp(3);
        break;
      case 71: //g
        app.keyUp(5);
        break;
      case 84: //t
        app.keyUp(4);
        break;
      case 82: //r
        app.keyUp(4);
        break;
      case 89: //y
        app.keyUp(4);
        break;
      case 65: //a
        app.keyUp(5);
        break;
      case 76: //l
        app.keyUp(5);
        break;
      case 81: //q
        app.keyUp(5);
        break;
      case 69: //e
        app.keyUp(6);
        break;
      case 85: //u
        app.keyUp(6);
        break;
      case 87: //w
        app.keyUp(6);
        break;
      case 73: //i
        app.keyUp(6);
        break;
      case 79: //o
        app.keyUp(7);
        break;
      case 80: //p
        app.keyUp(7);
        break;
    }
  }
}

// drawing visual mode -----------------------------------------------------------------
let setAudioAnalyser = function () {
  audio.analyser = audio.context.createAnalyser();
  audio.analyser.fftSize = 256;
  audio.analyser.maxDecibels = -90;
  audio.analyser.minDecibels = -100;
  audio.analyser.smoothingTimeConstant = 1;
  audio.analyserFilter = audio.context.createBiquadFilter();
  audio.analyserFilter.type = "lowpass";
  audio.analyserFilter.frequency.value = 2000;
  audio.analyserFilter.connect(audio.analyser);

  let bufferLength = audio.analyser.fftSize;
  let dataArray = new Uint8Array(bufferLength);
  let canvasCtx = dom.canvas.getContext("2d");

  // draw an oscilloscope of the current audio source
  app.draw = function () {
    audio.drawVisualId = requestAnimationFrame(app.draw);

    canvasCtx.fillStyle = "rgba(15,26,42,1)";
    canvasCtx.fillRect(0, 0, dom.canvas.width, dom.canvas.height);
    if (!state.visualMode) {
      window.cancelAnimationFrame(audio.drawVisualId);
      return;
    }

    audio.analyser.getByteTimeDomainData(dataArray);
    canvasCtx.beginPath();

    let sliceWidth = dom.canvas.width / bufferLength;
    let x = 0;
    let amp = 0;
    let i;

    if (state.visualMode === 1) {
      let dir = true;
      canvasCtx.moveTo(x, dom.canvas.height / 2);
      for (i = 1; i < bufferLength; i += state.step) {
        if ((dataArray[i] > dataArray[i - 1]) !== dir) {
          canvasCtx.lineTo(x, dataArray[i] / 128 * dom.canvas.height / 2)
          dir = !dir;
        }
        x += sliceWidth * state.step;
        amp += dataArray[i] / 128;
      }
    } else if (state.visualMode === 2) {
      for (i = 0; i < bufferLength; i += state.step) {
        let v = dataArray[i] / 128.0;
        let y = v * dom.canvas.height / 2;
        canvasCtx.moveTo(x, dom.canvas.height / 2);
        canvasCtx.lineTo(x, y);
        x += sliceWidth * state.step;
        amp += v;
      }
      canvasCtx.moveTo(dom.canvas.width, dom.canvas.height / 2);
    }

    canvasCtx.lineTo(dom.canvas.width, dataArray[bufferLength - 1] / 128 * dom.canvas.height / 2);

    canvasCtx.lineWidth = 3;
    canvasCtx.strokeStyle = "rgba(77,153,204," + (amp !== bufferLength / state.step ? 1 : 0) + ")";
    canvasCtx.stroke();
  };
}

// -------------------------------------------------------------------------------------
let setBottomFunc = function () {
  let func = document.querySelectorAll(".func");
  let funcItem = document.querySelectorAll(".funcItem");

  for (let m = 0; m < func.length; ++m) {
    func[m].addEventListener("click", function () {
      for (let n = 0; n < func.length; ++n) {
        funcItem[n].classList.toggle("funcItemOn", m === n && !func[m].classList.contains("funcOn"));
        func[n].classList.toggle("funcOn", m === n && !func[m].classList.contains("funcOn"));
      }
    })
  }

  // set drum pad
  for (i = 0; i < beat.trackQty; ++i) {
    addHitEventHandler(dom.drumPad[i], i, false);
  }
}

function playSound(buffer, time, volume) {
  let source = audio.context.createBufferSource();
  let gain = audio.context.createGain();

  source.buffer = buffer;
  source.connect(gain);
  gain.connect(audio.analyserFilter);
  gain.gain.value = beat.totalVolume * volume;
  gain.connect(audio.context.destination);
  source.start(time);
  audio.playingList.push(gain);
  source.onended = function () {
    audio.playingList.splice(audio.playingList.indexOf(gain), 1);
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

BufferLoader.prototype.loadBuffer = function (url, index) {
  // Load buffer asynchronously
  let request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  let loader = this;

  request.onload = function () {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function (buffer) {
        if (!buffer) {
          alert("error decoding file data: " + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length) {
          loader.onload(loader.bufferList);
        }
      },
      function (error) {
        console.error("decodeAudioData error", error);
      }
    );
  }

  request.onerror = function () {
    alert("BufferLoader: XHR error");
  }

  request.send();
}

BufferLoader.prototype.load = function () {
  for (let i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
}

// create pad --------------------------------------------------------------
function createPad() {
  state.page = 0 | (state.p / state.length);
  let padDiv = app.get("padDiv");
  for (let i = 0; i < beat.trackQty; ++i) {
    dom.trackList[i] = cE("div", "track");
    trackNumber = cE("div", "trackNumber", i + 1);
    trackIcon = cE("img", "trackIcon", "", "src", "img/track" + i + ".svg")
    dom.trackList[i].append(trackNumber, trackIcon);
    dom.trackList[i].addEventListener("mousedown", function () {
      playSound(audio.soundList[i], audio.context.currentTime, beat.volume[i]);
      this.classList.add("b" + i);
      for (let j = 0; j < state.length; ++j) {
        dom.padList[i][j].classList.add("bSelected");
      }
    })
    dom.trackList[i].addEventListener("touchstart", function (e) {
      e.preventDefault();
      playSound(audio.soundList[i], audio.context.currentTime, beat.volume[i]);
      this.classList.add("b" + i);
      for (let j = 0; j < state.length; ++j) {
        dom.padList[i][j].classList.add("bSelected");
      }
    })
    dom.trackList[i].addEventListener("mouseup", function () {
      this.classList.remove("b" + i);
      for (let j = 0; j < state.length; ++j) {
        dom.padList[i][j].classList.remove("bSelected");
      }
    })
    dom.trackList[i].addEventListener("touchend", function (e) {
      e.preventDefault();
      this.classList.remove("b" + i);
      for (let j = 0; j < state.length; ++j) {
        dom.padList[i][j].classList.remove("bSelected");
      }
    })

    padDiv.appendChild(dom.trackList[i]);
    for (let j = 0; j < state.length; ++j) {
      let p = j + state.page * state.length;
      dom.padList[i][j] = cE("div", j % 4 ? "b" : "bp", "", "id", i + "-" + j);
      dom.padList[i][j].addEventListener("click", () => { handleClickPad(i, j) })
      // dom.padList[i][j].addEventListener("click",function(){
      //     beat.state[i][p] = !beat.state[i][p];
      //     beat.state[i][p] && !state.playing && playSound(audio.soundList[i],audio.context.currentTime,beat.volume[i]);
      //     dom.padList[i][j].classList.toggle("b"+i);
      //     state.lastSelect===i || handleSelect(i);
      //     state.lastSelect = i;
      // })
      beat.state[i][p] && dom.padList[i][j].classList.add("b" + i);
      padDiv.appendChild(dom.padList[i][j]);
    }
  }

  padDiv.appendChild(cE("div"));
  for (let j = 0; j < state.length; ++j) {
    dom.pointNumberList[j] = cE("div", j % 4 ? "pointNumber" : "pointNumberP", j % 4 ? (j % 4) + 1 : ((j + state.page * state.length) / 4) + 1);
    padDiv.appendChild(dom.pointNumberList[j]);
  }

}

function handleClickPad(i, j) {
  const p = j + state.page * state.length;
  beat.state[i][p] = !beat.state[i][p];
  beat.state[i][p] && !state.playing && playSound(audio.soundList[i], audio.context.currentTime, beat.volume[i]);
  dom.padList[i][j].classList.toggle("b" + i);
  state.lastSelect === i || handleSelect(i);
  state.lastSelect = i;
}

function createPageButton() {
  let totalPage = beat.totalLength / state.length;
  for (let m = 0; m < totalPage; ++m) {
    dom.pageList[m] = cE("div", "pageButton");
    m === state.page && dom.pageList[m].classList.add("pageNow");
    dom.pageList[m].addEventListener("click", function () {
      if (state.playing) { state.autoPage = false; }

      // when page is on playing, remove hit block and point number
      if (state.pagePlaying === state.page && state.p >= 0) {
        for (let i = 0; i < beat.trackQty; ++i) {
          dom.padList[i][state.p % state.length].classList.remove("bOn");
        }
        dom.pointNumberList[state.p % state.length].classList.remove("pointNumberOn");
      }

      state.page = m;

      // renew pad
      for (let i = 0; i < beat.trackQty; ++i) {
        for (let j = 0; j < state.length; ++j) {
          dom.padList[i][j].classList.toggle("b" + i, beat.state[i][j + state.page * state.length]);
        }
      }

      if (state.pagePlaying === state.page && state.p >= 0) {
        dom.pointNumberList[state.p % state.length].classList.add("pointNumberOn");
        for (let i = 0; i < beat.trackQty; ++i) {
          dom.padList[i][state.p % state.length].classList.add("bOn");
        }
      }

      // change point number
      for (let j = 0; j < state.length; j += 4) {
        dom.pointNumberList[j].textContent = ((j + state.page * state.length) / 4) + 1;
      }

      // change page button
      for (let n = 0; n < totalPage; ++n) {
        dom.pageList[n].classList.toggle("pageNow", n === m);
      }
    })
    app.get("pageDiv").appendChild(dom.pageList[m]);
  }
}

function handleSelect(s) {
  if (dom.trackList[state.lastSelect]) {
    dom.trackList[state.lastSelect].classList.remove("b" + state.lastSelect);
  }
  dom.trackList[s].classList.add("b" + s);
  for (let j = 0; j < state.length; ++j) {
    dom.padList[state.lastSelect] && dom.padList[state.lastSelect][j].classList.remove("bSelected");
    dom.padList[s][j].classList.add("bSelected");
  }
}

function removePad() {
  let padDiv = app.get("padDiv");
  while (padDiv.hasChildNodes()) {
    padDiv.removeChild(padDiv.firstChild);
  }
  let pageDiv = app.get("pageDiv");
  while (pageDiv.hasChildNodes()) {
    pageDiv.removeChild(pageDiv.firstChild);
  }
}

function addHitEventHandler(element, i, parent) {
  let pointDown = function () {
    playSound(audio.soundList[i], audio.context.currentTime, beat.volume[i]);
    parent ? element.parentNode.classList.add("b" + i) : element.classList.add("b" + i);
    dom.trackList[i].classList.add("b" + i);
    for (let j = 0; j < state.length; ++j) {
      dom.padList[i][j].classList.add("bSelected");
    }
    if (state.playing && state.kbMode) {
      beat.state[i][state.p] = true;
      if (state.pagePlaying === state.page && state.p >= 0) {
        dom.padList[i][state.p % state.length].classList.toggle("b" + i, true);
      }
    }
  };
  let pointUp = function () {
    parent ? element.parentNode.classList.remove("b" + i) : element.classList.remove("b" + i);
    dom.trackList[i].classList.remove("b" + i);
    for (let j = 0; j < state.length; ++j) {
      dom.padList[i][j].classList.remove("bSelected");
    }
  }
  element.addEventListener("mousedown", pointDown)
  element.addEventListener("touchstart", function (e) {
    e.preventDefault();
    pointDown();
  })
  element.addEventListener("mouseup", pointUp);
  element.addEventListener("touchend", function (e) {
    e.preventDefault();
    pointUp();
  })
}

function createTrackSetting() {
  for (let i = 0; i < beat.trackQty; ++i) {
    let trackSetDiv = cE("div", "trackSetDiv", null, "id", "trackSetDiv" + i);

    let trackSetVolume = cE("input", "trackSetVolume", null, "id", "trackSetVolume" + i);
    trackSetVolume.type = "range";
    trackSetVolume.max = 1;
    trackSetVolume.min = 0;
    trackSetVolume.step = "any";
    trackSetVolume.value = beat.volume[i];

    trackSetVolume.addEventListener("input", function (e) {
      beat.volume[i] = this.value;
    })

    dom.trackSetSwitch[i] = cE("div", "trackSetSwitch", null, "id", "trackSwitch" + i);
    dom.trackSetSwitch[i].classList.toggle("b" + i, state.trackSwitch[i]);
    dom.trackSetSwitch[i].addEventListener("touchstart", function (e) {
      e.preventDefault();
      e.stopPropagation();
      state.trackSwitch[i] = !state.trackSwitch[i];
      this.classList.toggle("b" + i, state.trackSwitch[i]);
      if (state.page === state.pagePlaying && state.p >= 0) {
        dom.padList[i][state.p % state.length].classList.toggle("bOn", state.trackSwitch[i]);
      }
    })
    dom.trackSetSwitch[i].addEventListener("mousedown", function (e) {
      state.trackSwitch[i] = !state.trackSwitch[i];
      this.classList.toggle("b" + i, state.trackSwitch[i]);
      if (state.page === state.pagePlaying && state.p >= 0) {
        dom.padList[i][state.p % state.length].classList.toggle("bOn", state.trackSwitch[i]);
      }
      e.stopPropagation();
    })

    let trackSetNum = cE("div", "trackSetNum", i + 1);
    addHitEventHandler(trackSetNum, i, true);
    let trackSetIcon = cE("img", "trackSetIcon", null, "src", "img/track" + i + ".svg");
    addHitEventHandler(trackSetIcon, i, true);
    trackSetDiv.append(trackSetVolume, dom.trackSetSwitch[i], trackSetNum, trackSetIcon);
    app.get("trackSettingListDiv").appendChild(trackSetDiv);
  }
}

function saveBeatToLocalStorage() {
  let beatString = JSON.stringify(beat.state);
  localStorage.setItem("beat", beatString);
  localStorage.setItem("bpm", beat.bpm);
  localStorage.setItem("volume", JSON.stringify(beat.volume));
}


// decide side nav button function ---------------------------------------------
let addSideNavFunc = function () {
  // call or close side nav
  app.event("menu", "click", function () {
    app.get("sideNav").classList.add("sideNavShow");
    let navShield = cE("div", "navShield");
    document.body.appendChild(navShield);
    navShield.addEventListener("click", function () {
      app.get("sideNav").classList.remove("sideNavShow");
      navShield.parentNode.removeChild(navShield);
    })
  });
  app.event("closeNav", "click", function () {
    app.get("sideNav").classList.remove("sideNavShow");
    let navShield = document.querySelector(".navShield");
    navShield.parentNode.removeChild(navShield);
  });

  // call log in
  app.event("memberIcon", "click", authStatus() ? goToProfile : popUpLogIn);
  app.event("memberName", "click", authStatus() ? goToProfile : popUpLogIn);

  app.event("save", "click", function () {
    if (authStatus()) {
      beat.beatId ? alert("Replace the original beat?", false, saveBeat) : popUpSaveBeat(saveBeat, true);
    } else {
      popUpLogIn();
    }
  });
  app.event("saveAs", "click", function () {
    authStatus() ? popUpSaveBeat(saveBeat, true) : popUpLogIn();
  });
  app.event("download", "click", function () {
    alert("The Feature Is Comming Soon.");
  });
  app.event("share", "click", function () {
    if (authStatus()) {
      beat.beatId ? popUpShareBeat() : alert("Please save the beat first.", false, function () {
        popUpSaveBeat(saveBeat);
      });
    } else {
      popUpLogIn();
    }
  });
}

// save beat feature ------------------------------------------------------------
let popUpSaveBeat = function (cb, saveAs) {
  let mySheild = cE("div", "shield");
  let myNaming = cE("div", "naming");

  let closeNaming = function () {
    mySheild.parentNode.removeChild(mySheild);
    myNaming.parentNode.removeChild(myNaming);
  }

  let myNamingText = cE('div', "namingText", "Enter the Beat's Name:");
  let myNamingInput = cE("input", "namingInput", null, "placeholder", "Untitled");
  myNamingInput.id = "beatName";
  myNamingInput.addEventListener("change", function () {
    beat.beatName = this.value;
  })

  let myNamingBtnDiv = cE("div", "namingBtnDiv");
  let myNamingBtn = cE('button', "namingBtn", "Done");
  myNamingBtn.addEventListener('click', function () {
    cb && cb(saveAs);
    closeNaming();
  });
  let myNamingBtn2 = cE('button', "namingCancel", "Cancel");
  myNamingBtn2.addEventListener('click', closeNaming);

  myNamingBtnDiv.append(myNamingBtn, myNamingBtn2);

  myNaming.append(myNamingText, myNamingInput, myNamingBtnDiv);
  document.body.append(mySheild, myNaming);
}

let saveBeat = function (saveAs) {
  let beatData = {
    user: authStatus().uid,
    beat: beat.state,
    beatName: beat.beatName,
    bpm: beat.bpm,
    totalLength: beat.totalLength,
    volume: beat.volume
  }
  if (!saveAs) {
    beatData.beatId = beat.beatId || false;
  }
  let fetchUrl = saveAs ? "/exe/saveAsNewBeat" : "/exe/saveBeat";

  fetch(dbHost + fetchUrl, {
    method: "POST",
    body: JSON.stringify(beatData),
    headers: new Headers({
      "Content-Type": "application/json"
    })
  }).then(res => res.json())
    .then(response => {
      if (response.error) {
        alert(response.error + " Please try again later. :)");
        console.error("Update to database error:", response.error)
      } else {
        alert("Beat Saved!", true);
        console.log("Update to database success:", response);
        let newBeatId = response.newBeatId;
        window.history.pushState(null, beat.beatName, "index.html?id=" + newBeatId);
        beat.beatId = newBeatId;
        removeUserBeatList();
        getUserBeatList(authStatus().uid);
      }
    })
    .catch(error => {
      alert(error + " Please try again later. :)");
      console.error("Update to database error:", error)
    });
}

let popUpShareBeat = function () {
  let closeNaming = function () {
    mySheild.parentNode.removeChild(mySheild);
    myNaming.parentNode.removeChild(myNaming);
  };
  let copyLink = function () {
    myNamingInput.select();
    document.execCommand("copy");
    myNamingCopy.style.display = "block";
  };
  let mySheild = cE("div", "shield");
  mySheild.addEventListener('click', closeNaming);
  let myNaming = cE("div", "naming");

  let myNamingText = cE('div', "namingText", "Copy link and share!");
  let myNamingInput = cE("input", "namingInput", null, "value", "https://beatingline.com/index.html?id=" + beat.beatId);
  myNamingInput.addEventListener("click", copyLink);

  let myNamingCopy = cE("div", "namingCopy", "Link copied!");
  myNamingCopy.style.display = "none";
  let myNamingBtnDiv = cE("div", "namingBtnDiv");
  let myNamingBtn = cE('button', "namingBtn", "Copy");
  myNamingBtn.addEventListener('click', copyLink);
  let myNamingBtn2 = cE('button', "namingCancel", "Okay");
  myNamingBtn2.addEventListener('click', closeNaming);

  myNamingBtnDiv.append(myNamingBtn, myNamingBtn2);

  myNaming.append(myNamingText, myNamingInput, myNamingCopy, myNamingBtnDiv);
  document.body.append(mySheild, myNaming);
}