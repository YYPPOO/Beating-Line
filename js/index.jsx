import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, NavLink, Switch } from "react-router-dom";
import { SignIn, SignUp } from "./signIn.jsx";
// import { url } from "inspector";

class Sound extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            state:{}
        };
    }

    render(){
       

        let context = new (window.AudioContext || window.webkitAudioContext)();
        let oscillator = context.createOscillator();
        let gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 440;
        oscillator.connect(gain);
        gain.connect(context.destination);
        gain.gain.setValueAtTime(1, 0);
        gain.gain.exponentialRampToValueAtTime(0.001, 5);
        oscillator.start(0);
        oscillator.stop(5);
        // console.log(oscillator);
        
        return(
            <div>
                <Pad />
            </div>
        );
    }
}

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            state:{}
        };
    }

    render(){
        return(
            <header>
                <NavLink to="/">
                    <img className="logo" src="../src/img/icon.svg" alt="logo" style={{width:"40px",height:"40px"}}/>
                    <div className="title">Beating Line</div>
                </NavLink>
                <NavLink to="/signup">
                    <img className="memberIcon" src="../src/img/member.svg" alt="Member" style={{width:"40px",height:"40px"}}/>
                </NavLink>

            </header>
        );
    }
}

class Pad extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            state:{}
        };
    }

    render(){
        return(
            <div>
                <div className="kick">
                    Kick
                    <audio id="kick">
                        <source src="../src/sound/0kick0.wav" />
                    </audio>
                </div>
                <div className="snare">
                    Snare
                    <audio id="snare">
                        <source src="../src/sound/1snare0.wav" />
                    </audio>
                </div>
                <div className="closeHat">
                    Close Hat
                    <audio id="closeHat">
                        <source src="../src/sound/2closeHat0.wav" />
                    </audio>
                </div>
                <div className="openHat">
                    Open Hat
                    <audio id="openHat">
                        <source src="../src/sound/3openHat0.wav" />
                    </audio>
                </div>
                <div className="tom">
                    Tom
                    <audio id="tom">
                        <source src="../src/sound/4tom0.wav" />
                    </audio>
                </div>
                <div className="clap">
                    Clap
                    <audio id="clap">
                        <source src="../src/sound/5clap0.wav" />
                    </audio>
                </div>
                <div className="cong">
                    Cong
                    <audio id="cong">
                        <source src="../src/sound/6conga0.wav" />
                    </audio>
                </div>
                <div className="atm">
                    Atm
                    <audio id="atm">
                        <source src="../src/sound/7atm0.wav" />
                    </audio>
                </div>
            </div>
        );
    }
}



class Application extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            state:{}
        };
    }

    componentDidMount(){
        let context = new (window.AudioContext || window.webkitAudioContext)();
        let audioElement = document.querySelector("#snare");
        let source = context.createMediaElementSource(audioElement);
        // source.src = "../sound/1snare0.wav";
        let gain = context.createGain();
        gain.gain.setValueAtTime(0.3, 0);
        source.connect(gain);
        gain.connect(context.destination);
        // audioElement.play();
        console.log(source);
        console.log(context);
    }

    // play(){
    //     document.querySelector("#snare").play();
    // }

    render(){
        return(
            <BrowserRouter>
                <div>
                    <Header />
                    <Switch>
                        <Route exact path="/"
                            render={props =>
                                <Pad />
                            }
                        />
                        <Route path="/signup"
                            render={props =>
                                <SignUp />
                            }
                        />
                        <Route path="/signin"
                            render={props =>
                                <SignIn />
                            }
                        />
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }
}

export default Application;

const container = document.getElementById("container");
container ? ReactDOM.render(<Application />, container) : false;