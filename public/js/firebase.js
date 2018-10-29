let dbHost = "https://beating-line.firebaseapp.com";

let authStatus = function(){
    return firebase.auth().currentUser;
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log(user);
        showUserPic(user);
        document.getElementById("memberName").textContent = "Hello, "+user.displayName;
        getUserBeatList(user.uid);
        console.log("Log in with "+user.providerData[0].providerId);
        getRedirectResult();
    } else {
        console.log("Log out.");
    }
});

// facebook log in --------------------------------------------
let fbLogin = function(){
	let provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithRedirect(provider);
    alert("Page is reloading...",true);
};

// google log in ----------------------------------------------
let gLogin=function(){
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
    alert("Page is reloading...",true);
}

//confirm FB or google log in state, update back-end user database -------------------------
let getRedirectResult = function(){
    firebase.auth().getRedirectResult().then(function(result) {            
        if(result.user){
            let user = firebase.auth().currentUser;
            let userData = {
                userName:user.displayName,
                userEmail:user.email,
                userId:user.uid,
                providerId:user.providerData[0].providerId
            };
            fetch(dbHost+"/exe/manageAccount", {
                method:"POST",
                body: JSON.stringify(userData),
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(res => res.json())
            .catch(error => console.error("Fetch error:",error))
            .then(response => {
                console.log("Log in success:",response);
            });
        }
    }).catch(function(error) {
        console.log(error);
    });
}

// email password log in --------------------------------------------
let signIn = function() {
    let email = document.getElementById("logInEmail").value;
    let password = document.getElementById("logInPassword").value;
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email)) {
        alert("Email error, please try again.");
        return;
    }
    if (password.length < 4) {
        alert("Password error, please try again.");
        return;
    }
    alert("Delivering the data.",true);
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(e){
        console.log(e);
        alert("Log in success.",true)
        document.location.reload();
    })
    .catch(function(error) {
        if(error.code=="auth/invalid-email"||error.code=="auth/user-not-found") {
            alert("Email error, please try again.")
        } else if(error.code=="auth/wrong-password"){
            alert("Password error, please try again.")
        } else {
            alert(error.message,false);
        }
        console.log(error);
    });
}

// email password sign up ---------------------------------------------
let signUp = function() {
    let email = document.getElementById("logInEmail").value;
    let password = document.getElementById("logInPassword").value;
    let name = document.getElementById("logInName").value;
    if (!name) {
        alert("Please enter your name.");
        return;
    }
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email)) {
        alert("Email error, please try again.");
        return;
    }
    if (password.length < 4) {
        alert("Password error, please try again.");
        return;
    }
    alert("Delivering the data.",true);
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function(e){
        let user = firebase.auth().currentUser;
        user.updateProfile({displayName: name})
            .then(function() {
            // Update successful.
            user.sendEmailVerification().then(function() {
                console.log(user);
                console.log("Email sent.");
                let userData = {
                    userName:user.displayName,
                    userEmail:user.email,
                    userId:user.uid,
                    providerId:user.providerData[0].providerId
                };
                fetch(dbHost+"/exe/manageAccount", {
                    method: "POST",
                    body: JSON.stringify(userData),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(res => res.json())
                .catch(error => console.error("Create account data error:",error))
                .then(response => {
                    alert("Sign up success, and the verify email is send. Reload in 3 seconds.",true);
                    setTimeout(function(){document.location.reload()},3000);
                })
            }).catch(function(error) {
                console.log("send mail fail:"+error);
            });
        }).catch(function(error) {
            console.log("update profile fail:"+error);
        });
    })
    .catch(function(error) {
        if (error.code == "auth/weak-password") {
            alert("The password is too weak, please try again.");
        } else if (error.code=="auth/email-already-in-use") {
            alert("This Email is already registered, please try again.")
        } else {
            alert(error.message);
        }
        console.log(error);
    });
}

// ---------------------------------------------------
let resetPassword = function() {
    let email = document.getElementById("logInEmail").value;
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email)) {
        alert("Please enter your email.");
        return;
    }
    firebase.auth().sendPasswordResetEmail(email).then(function() {
            alert("The reset password email is send. Reload in 3 seconds.",true)
            console.log("Email sent!")
            setTimeout(document.location.reload(),3000);
        }).catch(function(error) {
            alert("Email error, please try again.");
            console.log(error);
        });
}  

function goToProfile() {
    saveBeatToLocalStorage();
    window.location = "/profile.html";
}

// --------------------------------------------------------
function popUpLogIn() {
    saveBeatToLocalStorage();
    if(authStatus()!==null) {
        return;
    }

    let closeLogIn = function(){
        mySheild.parentNode.removeChild(mySheild);
		myLogIn.parentNode.removeChild(myLogIn);
    }

    let mySheild = cE("div","logInShield");
	mySheild.addEventListener('click',closeLogIn);

    let myLogIn = cE("div","logIn");
    let myLogInDiv = cE("div","logInDiv");
	let myLogoImg = cE("img","logInImg",null,"src","img/logo.svg");

	let myNameInput = cE("input","logInName",null,"placeholder","Name");
	let myEmailInput = cE("input","logInEmail",null,"placeholder","Email");
	let myPasswordInput = cE("input","logInPassword",null,"placeholder","********");

	myNameInput.type = "text";
	myNameInput.id = "logInName";
	myEmailInput.type = "email";
	myEmailInput.id = "logInEmail";
	myPasswordInput.type = "password";
    myPasswordInput.id = "logInPassword";
    
    let mySignLink = cE("a","logInText","Already have an account? Sign in here.");
        mySignLink.addEventListener("click",function(){
            let logging = this.textContent == "Already have an account? Sign in here.";
            console.log(logging);
            //true = sign up to sign in, false = sign in to sign up
                mySignLink.textContent = logging?"Don't have an account? Sign up here.":"Already have an account? Sign in here.";
                myForget.textContent = logging?"Forget password?":"";
                myNameInput.style.display = logging?"none":"block";
                mySignButton.textContent = logging?"Sign In":"Sign Up";
                mySignButton.removeEventListener("click",logging?signUp:signIn);
                mySignButton.addEventListener("click",logging?signIn:signUp);
        })

    let myForget = cE("a","logInText","","id","forgetPassword");
        myForget.addEventListener("click",resetPassword); 
    
    let mySignButton =  cE("button","","Sign Up");
        mySignButton.addEventListener("click",signUp);

    let myPolicyDiv = cE("div","policyDiv");
    let myPolicyText = cE("span","policyText");
        myPolicyText.innerHTML = "Agree our <a class='logInText' target='_blank' href='terms.html'>Terms</a> and <a class='logInText' target='_blank' href='privacy.html'>Privacy Policy</a> by clicking.";
        myPolicyDiv.append(myPolicyText);

	let myHrDiv = cE("div","divideLine");
		let myLine =  cE("span","hrLine");
		let myOr =  cE("span","logInOr","or Sign in with community account.");	
		let myLineTwo =  cE("span","hrLine");

    myHrDiv.append(myLine,myOr,myLineTwo);
    
    let myAlertBtnDiv = cE("div","alertBtnDiv");
    let myFB =  cE("img","logInIcon","","src","img/facebook.svg");
        myFB.addEventListener("click",fbLogin);
    let myG =  cE("img","logInIcon","","src","img/google.svg");
        myG.addEventListener("click",gLogin);

    myAlertBtnDiv.append(myFB,myG);

    myLogInDiv.append(myLogoImg,myNameInput,myEmailInput,myPasswordInput/*,mySignInText*/,mySignLink,myForget,mySignButton,myPolicyDiv,myHrDiv,myAlertBtnDiv);
    myLogIn.appendChild(myLogInDiv);

    document.body.append(mySheild,myLogIn);
}

function getUserBeatList(uid) {
    fetch(dbHost+"/exe/getUserBeat?userId="+uid, {
        method:"GET"
    }).then(res => {
        console.log(res);
        return res.json();
    })
    .then(response => {
        console.log("Load user beat: ",response);
        if(!response.error){
            showUserBeatList(response,uid);
        }
    })
    .catch(error => {
        console.error("Load user beat error: ",error);
    })
}

function showUserBeatList(userBeatList,uid) {
    let myBeatListBtn = cE("button","beatListBtn","My Beat ");
        myBeatListBtn.id = "myBeat";
    myBeatListBtn.addEventListener("click",function(){
        myBeatListBtn.classList.toggle("beatListBtnShow");
        myBeatListDiv.classList.toggle("beatListDivShow");
    })
    document.getElementById("sideNav").appendChild(myBeatListBtn);
    let myBeatListDiv = cE("div","beatListDiv");
    for(let i in userBeatList) {
        let myBeatDiv = cE("div","beatDiv");
        let myBeat = cE("div","beatName",userBeatList[i],"id",i);
            myBeat.addEventListener("click",function(){
                fetch(dbHost+"/exe/getBeat?id="+i, {
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
                    beat.beatId = i;
                    document.getElementById("bpm").value = beat.bpm;
                    for(let k=0;k<beat.trackQty;k++){
                        document.getElementById("trackSetVolume"+k).value = beat.volume[k];
                    }
                    decideLength(mediaQuery);
                    state.playing && reset();
                    window.history.pushState(null,beat.beatName,"index.html?id="+beat.beatId);
                })
                .catch(error => {
                    console.error("Load beat error:",error)
                });
            })
        let myBeatDelete = cE("div","deleteBeat","X");
            myBeatDelete.addEventListener("click",function(){
                alert("Delete the beat?!",false,function(){
                    deleteBeat(i,uid);
                });
            })
        myBeatDiv.append(myBeat,myBeatDelete);
        myBeatListDiv.appendChild(myBeatDiv);
    }
    document.getElementById("sideNav").appendChild(myBeatListDiv);
}

function deleteBeat(deleteBeatId,uid) {
    fetch(dbHost+"/exe/deleteBeat?beatId="+deleteBeatId+"&userId="+uid,{
        method:"delete"
    }).then(res => res.json())
    .then(response => {
        console.log(response);
        alert("Beat delete.",true);
        removeUserBeatList();
        getUserBeatList(authStatus().uid);
        if(beat.beatId==deleteBeatId){
            beat.beatId = "";
            window.history.replaceState(null,"","index.html");
        }
    }).catch((error)=>{
        console.log(error);
        alert("Beat delete fail, please try again.")
    })
}

function removeUserBeatList() {
    let beatListBtn = document.querySelector(".beatListBtn");
    beatListBtn && beatListBtn.parentNode.removeChild(beatListBtn);
    let beatListDiv = document.querySelector(".beatListDiv");
    beatListDiv && beatListDiv.parentNode.removeChild(beatListDiv);
}