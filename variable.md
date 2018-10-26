audio:
    context;
    bufferLoader;
    analyser;
    analyserFilter;
    drawVisualId;
    
    playingList = [];

beat:
    bpm = 60;
    totalVolume = 1;
    beatId;
    beatName;
    state = [];
    volume = [1,1,1,1,1,1,1,1];

    trackQty = 8;
    totalLength = 32;
    
state:
    p = 0;
    lastP = totalLength-1;
    playing = false;
    autoPage = true;
    metronome = false;
    kbMode = false;
    visualMode = 0;
    trackSwitch = [true,true,true,true,true,true,true,true];
    lastSelect;
    timerId;

app:
    play;
    stop;
    reset;

media query
page:
    length = 16;
    page = 0;
    pagePlaying = 0;

dom:
    pageList = [];
    soundList = [];
    trackList = [];
    padList = [];
    pointNumberList = [];

```
for(let i=0;i<trackQty;++i) {
    state[i] = [];
    padList[i] = [];
    for(let j=0;j<totalLength;++j) {
        state[i].push(0);
    }
}
```

let trackName = ["Kick","Snare","Close Hat","Open Hat","Tom","Clap","Conga","Atm"];
