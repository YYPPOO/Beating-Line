let dbHost = "https://beating-line.firebaseapp.com";
// let clickProfile = popUpLogIn;

let authStatus = function(){
    return firebase.auth().currentUser;
}

firebase.auth().onAuthStateChanged(function(user) {
    // document.querySelector(".memberIcon").removeEventListener("click",clickProfile);
    if (user) {
        console.log(user);
        // console.log('登入id',authStatus().uid);

        showUserPic(user);
        getUserBeatList(user.uid);
        console.log("Log in with "+user.providerData[0].providerId);
        // clickProfile = goToProfile;
        getRedirectResult();
    } else {
        console.log("Log out.");
        // clickProfile = popUpLogIn;
    }
    // if(app.profileInit){app.profileInit()};
    // document.querySelector(".memberIcon").addEventListener("click",clickProfile);
});

// facebook 登入 --------------------------------------------
let fbLogin = function(){
	let provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithRedirect(provider);
    alert("Page is reloading...",true);
};

// google登入 ----------------------------------------------
let gLogin=function(){
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
    alert("Page is reloading...",true);
}

//確認FB或google登入狀態 更新後端user資料庫 -------------------------
let getRedirectResult = function(){
    firebase.auth().getRedirectResult().then(function(result) {            
        // console.log(result);
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

// email password 登入 --------------------------------------------
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
        // setTimeout(document.location.reload(),3000);
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

// email password 註冊 ---------------------------------------------
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
            app.ajax("post",app.cst.DB_HOST+"/exe/manageAccount",userData,function(req){
                // app.closeLoading();
                alert("Sign up success, and the verify email is send. Reload in 3 seconds.",true);
                setTimeout(function(){document.location.reload()},3000);
            })
            }).catch(function(error) {
            // An error happened.
                console.log("send mail fail:"+error);
            });
        }).catch(function(error) {
            // An error happened.
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

// 重設密碼 ---------------------------------------------------
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
    window.location = "/profile.html";
}

//==========================製造登入小視窗=============================
//實際跳出的產生函式
function popUpLogIn() {
    if(authStatus()!==null) {
        return;
    }

    let closeLogIn = function(){
        mySheild.parentNode.removeChild(mySheild);
		myLogIn.parentNode.removeChild(myLogIn);
    }

    //最大的那塊灰區域
    let mySheild = cE("div","logInShield");
    //點擊背後大塊區域會自動消失功能
	mySheild.addEventListener('click',closeLogIn);

    let myLogIn = cE("div","logIn");
    let myLogInDiv = cE("div","logInDiv");

    //LOGO 以及點擊回首頁的LINK
	let myLogoImg = cE("img","logInImg",null,"src","img/logo.svg");

	//名字 信箱 密碼輸入框
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
            //true表示註冊中將轉為登入 false為登入中將轉為註冊
                // mySignInText.textContent = logging?"還沒有帳號嗎？請點這裡":"已經有帳號了？請點這裡";
                mySignLink.textContent = logging?"Don't have an account? Sign up here.":"Already have an account? Sign in here.";
                myForget.textContent = logging?"Forget password?":"";
                myNameInput.style.display = logging?"none":"block";
                mySignButton.textContent = logging?"Sign In":"Sign Up";
                mySignButton.removeEventListener("click",logging?signUp:signIn);
                mySignButton.addEventListener("click",logging?signIn:signUp);
        })

    //這邊是忘記密碼的那個連結！
    let myForget = cE("a","logInText","","id","forgetPassword");
        myForget.addEventListener("click",resetPassword); 
    
    //點擊的按鈕 登入及註冊
    let mySignButton =  cE("button","","Sign Up");
        mySignButton.addEventListener("click",signUp);

    //是那個ＯＲ分格線
	let myHrDiv = cE("div","divideLine");
		let myLine =  cE("span","hrLine");
		let myOr =  cE("span","logInOr","or Sign in by community account.");	
		let myLineTwo =  cE("span","hrLine");

    myHrDiv.append(myLine,myOr,myLineTwo);
    
    //ＦＢ跟ＧＯＯＧＬＥ的按鈕區
    let myAlertBtnDiv = cE("div","alertBtnDiv");
    let myFB =  cE("img","logInIcon","","src","img/facebook.svg");
        myFB.addEventListener("click",fbLogin);
    let myG =  cE("img","logInIcon","","src","img/google.svg");
//     let myG =  cE("a");
//         myG.innerHTML = `
// <svg class="logInIcon" width="512" height="512" xmlns="http://www.w3.org/2000/svg">
// <style>
// #googleIcon {
//     fill: #0f1a2a;
// }

// #googleIcon:hover {
//     fill: #dd4b39;
// }
// </style>
//     <rect id="googleIcon" x="10" y="10" rx="64" ry="64" width="492" height="492" stroke="#ffffff" stroke-width="10" />
//     <polygon id="svg_1" fill="#ffffff" points="407,242.5 407,188.5 380,188.5 380,242.5 326,242.5 326,269.5 380,269.5 380,323.5 407,323.5 407,269.5 461,269.5 461,242.5 "/>
//     <path id="svg_2" fill="#ffffff" d="m177.5,230.699997l0,50.599991l71.5737,0c-10.448898,29.449188 -38.582504,50.600006 -71.5737,50.600006c-41.846191,0 -75.899994,-34.053802 -75.899994,-75.899994c0,-41.846191 34.053802,-75.899994 75.899994,-75.899994c18.140106,0 35.597107,6.50209 49.157898,18.317184l33.244202,-38.15239c-22.770004,-19.835205 -52.016785,-30.764801 -82.4021,-30.764801c-69.75209,0 -126.499992,56.747894 -126.499992,126.5s56.747902,126.5 126.499992,126.5s126.5,-56.747894 126.5,-126.5l0,-25.300003l-126.5,0z"/>
// </svg>
//         `;
        myG.addEventListener("click",gLogin);

    myAlertBtnDiv.append(myFB,myG);

    myLogInDiv.append(myLogoImg,myNameInput,myEmailInput,myPasswordInput/*,mySignInText*/,mySignLink,myForget,mySignButton,myHrDiv,myAlertBtnDiv);
    myLogIn.appendChild(myLogInDiv);
    // myForget.style.display = "none";

    document.body.append(mySheild,myLogIn);
}

function getUserBeatList(uid) {
    fetch(dbHost+"/exe/getUserBeat?userId="+uid, {
        method:"GET"
        // headers: new Headers({
        //     "Content-Type": "application/json"
        // })
    }).then(res => {
        console.log(res);
        return res.json();
    })
    .then(response => {
        console.log("Load user beat: ",response);
        showUserBeatList(response);
    })
    .catch(error => {
        console.error("Load user beat error: ",error);
    })
}

function showUserBeatList(userBeatList) {
    let myBeatListDiv = cE("div","beatListDiv","My Beat ▼");
    document.getElementById("sideNav").appendChild(myBeatListDiv);
    for(let i in userBeatList) {
        let myBeatDiv = cE("div","beatDiv");
        let myBeat = cE("div",null,userBeatList[i],"id",i);
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
                        state = response.beat;
                        bpm = response.bpm;
                        beatName = response.beatName;
                    }
                    beatId = i;
                    document.getElementById("bpm").value = bpm;
                    decideLength(mediaQuery);
                })
                .catch(error => {
                    console.error("Load beat error:",error)
                });
                // window.location = "index.html?id="+i;
            })
        let myBeatDelete = cE("div","deleteBeat","X");
            myBeatDelete.addEventListener("click",function(){
                alert("Delete the beat?!",false,function(){
                    deleteBeat(i);
                });
            })
        myBeatDiv.append(myBeat,myBeatDelete);
        // myBeatListDiv.appendChild(myBeatDiv);
        document.getElementById("sideNav").appendChild(myBeatDiv);
    }
    // document.getElementById("sideNav").appendChild(myBeatListDiv);
}

function deleteBeat(beatId) {

}