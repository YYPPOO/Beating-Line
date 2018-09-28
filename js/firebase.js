let databaseHost = "https://beating-line.firebaseapp.com";

authStatus = function(){
    return firebase.auth().currentUser;
}

firebase.auth().onAuthStateChanged(function(user) {
    let clickProfile = popUpLogIn;
    document.querySelector(".memberIcon").removeEventListener("click",clickProfile);
    if (user) {
        console.log(user);
        console.log('登入id',authStatus().uid);

        showUserPic(user);
        console.log("成功以"+user.providerData[0].providerId+"登入");
        clickProfile = goToProfile;
    } else {
        console.log("未登入");
    }
    // if(app.profileInit){app.profileInit()};
    document.querySelector(".memberIcon").addEventListener("click",clickProfile);
});

let showUserPic = function(data){
    let storage = firebase.storage();
    storage.ref(authStatus().uid+'/main.jpg').getDownloadURL().then((url)=>{
        console.log(url);
        document.querySelector(".memberIcon").src = url;
    }).catch( (req) => {
        console.log(req);
        // let width = data.providerData[0].providerId == "facebook.com" ?"/picture/?width=200":"";
        document.querySelector(".memberIcon").src=data.photoURL?data.photoURL:"../img/member.svg"; //+width;
    })
};

// facebook 登入 --------------------------------------------
let fbLogin = function(){
	let provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithRedirect(provider);
    alert("頁面即將跳轉…",true);
};

// google登入 ----------------------------------------------
let gLogin=function(){
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
    alert("頁面即將跳轉…",true);
    // firebase.auth().getRedirectResult().then(function(result) {
    //         console.log(result);
    //     }).catch(function(error) {
    //         alert("Google登入失敗 :(");
    //         console.log(error);
    //     });
}

//確認FB或google登入狀態 更新後端user資料庫 -------------------------
let getRedirectResult = function(){
    firebase.auth().getRedirectResult().then(function(result) {            
        console.log(result);
        if(result.user){
            let user = firebase.auth().currentUser;
            let userData = {
                name:user.displayName,
                email:user.email,
                id:user.uid,
                providerId:user.providerData[0].providerId
            };
            fetch()
            app.ajax("post",databaseHost+"/exe/manageAccount",userData,function(){})
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
        alert("Email 錯誤，請重新輸入。");
        return;
    }
    if (password.length < 4) {
        alert("密碼錯誤，請重新輸入。");
        return;
    }
    alert("資料傳送中…",true);
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(e){
        console.log(e);
        alert("登入成功！",true)
        document.location.reload();
        // setTimeout(document.location.reload(),3000);
    })
    .catch(function(error) {
        if(error.code=="auth/invalid-email"||error.code=="auth/user-not-found") {
            alert("Email 錯誤，請重新輸入。")
        } else if(error.code=="auth/wrong-password"){
            alert("密碼錯誤，請重新輸入。")
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
        alert("註冊請輸入姓名！");
        return;
    }
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email)) {
        alert("Email 錯誤，請重新輸入。");
        return;
    }
    if (password.length < 4) {
        alert("密碼錯誤，請重新輸入。");
        return;
    }
    alert("資料傳送中…",true);
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
                alert("已成功註冊，請前往信箱點擊驗證連結，畫面將在3秒後跳轉。",true);
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
            alert("密碼強度不足，請重新輸入。");
        } else if (error.code=="auth/email-already-in-use") {
            alert("此 Email 已註冊，請重新輸入。")
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
        alert("請輸入 Email 。");
        return;
    }
    firebase.auth().sendPasswordResetEmail(email).then(function() {
            alert("已寄送重設密碼連結至您的 Email，即將在 3 秒後跳轉頁面…",true)
            console.log("Email sent!")
            setTimeout(document.location.reload(),3000);
        }).catch(function(error) {
            alert("Email 錯誤，請重新輸入。");
            console.log(error);
        });
}  

function goToProfile() {
    window.location = "/profile.html";
}

//==========================製造登入小視窗=============================


//實際跳出的產生函式

function popUpLogIn() {
    // let lastSheild = document.querySelector(".logInShield");
    // while(lastSheild) {
    //     lastSheild.parentNode.removeChild(lastSheild);
    // }
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

    //LOGO 以及點擊回首頁的LINK
	let myLogoImg = cE("img","logInImg",null,"src","img/logo.svg");

	//名字 信箱 密碼輸入框
	let myNameInput = cE("input","logInName",null,"placeholder","請輸入姓名");
	let myEmailInput = cE("input","logInEmail",null,"placeholder","請輸入Email");
	let myPasswordInput = cE("input","logInPassword",null,"placeholder","請輸入密碼");

	myNameInput.type = "text";
	myNameInput.id = "logInName";
	myEmailInput.type = "email";
	myEmailInput.id = "logInEmail";
	myPasswordInput.type = "password";
    myPasswordInput.id = "logInPassword";
    
    // let mySignInText = cE("div","logInText","");
    let mySignInLink = cE("a","logInText","已經有帳號了？請點這裡登入");
        mySignInLink.addEventListener("click",function(){
            let logging = this.textContent == "已經有帳號了？請點這裡登入";
            console.log(logging);
            //true表示註冊中將轉為登入 false為登入中將轉為註冊
                // mySignInText.textContent = logging?"還沒有帳號嗎？請點這裡":"已經有帳號了？請點這裡";
                mySignInLink.textContent = logging?"還沒有帳號嗎？請點這裡註冊":"已經有帳號了？請點這裡登入";
                myForget.textContent = logging?"忘記密碼？":"";
                myNameInput.style.display = logging?"none":"block";
                mySignUp.textContent = logging?"登入":"註冊";
                signUpOnClick = logging?signIn:signUp;
                // mySignIn.style.display = logging?"block":"none";
        })
        // mySignInText.appendChild(mySignInLink);

    //這邊是忘記密碼的那個連結！
    let myForget = cE("a","logInText","","id","forgetPassword");
    myForget.addEventListener("click",resetPassword); 
    
    //點擊的按鈕 登入及註冊
    let signUpOnClick = signUp;
    let mySignUp =  cE("button","","註冊");
        mySignUp.addEventListener("click",signUpOnClick);
    // let mySignIn =  cE("button","","登入");
    //     mySignIn.addEventListener("click",signIn);

    //是那個ＯＲ分格線
	let myHrDiv = cE("div","divideLine");
		let myLine =  cE("span","hrLine");
		let myOr =  cE("span","logInText","或 以社群帳號登入");	
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

    myLogIn.append(myLogoImg,myNameInput,myEmailInput,myPasswordInput/*,mySignInText*/,mySignInLink,myForget,mySignUp,myHrDiv,myAlertBtnDiv);
    // myForget.style.display = "none";

    document.body.append(mySheild,myLogIn);
}

//點擊member icon跳出登入區塊
// document.querySelector(".member").addEventListener("click", nLogIn);


// function alert(text, boolean) {
//     let lastSheild = document.querySelector(".shield");
//     while(lastSheild) {
//         lastSheild.parentNode.removeChild(lastSheild);
//     }
// 	let mySheild = cE("div", "shield");
// 	mySheild.addEventListener('click', function () {
// 		mySheild.style.display = "none";
// 		myAlert.style.display = "none";
// 	})
// 	let myAlert = cE("div", "alert");
// 	let myAlertImg = cE("img", "alertImg", "", src, boolean ? "img/checked.svg" : "img/warning.svg");
// 	// myAlertImg.src = boolean ? "img/checked.svg" : "img/warning.svg";
// 	let myAlertText = cE('div', "alertText", text);
// 	let myAlertBtn = cE('button', "alertBtn", "確認");
// 	myAlertBtn.addEventListener('click', function () {
// 		mySheild.style.display = "none";
// 		myAlert.style.display = "none";
// 	});
// 	myAlert.append(myAlertImg, myAlertText, myAlertBtn);
// 	document.body.append(mySheild, myAlert);
// }

function alert(text, boolean, cb) {
    // let lastSheild = document.querySelector(".shield");
    // while(lastSheild) {
    //     lastSheild.parentNode.removeChild(lastSheild);
    // }
    let closeAlert = function() {
        mySheild.parentNode.removeChild(mySheild);
		myAlert.parentNode.removeChild(myAlert);
    }

	let mySheild = cE("div", "shield");
	mySheild.addEventListener('click',closeAlert)
	let myAlert = cE("div", "alert");
	let myAlertImg = cE("img","alertImg","","src", boolean ? "img/checked.svg" : "img/warning.svg");
	let myAlertText = cE('div', "alertText", text);
	let myAlertBtnDiv = cE("div","alertBtnDiv");
	let myAlertBtn = cE('button', "alertBtn", "確認");
	myAlertBtn.addEventListener('click', function () {
        closeAlert();
		cb && cb();
    });
    myAlertBtnDiv.appendChild(myAlertBtn);
    if(cb) {
        let myAlertBtn2 = cE('button', "alertCancel", "取消");
        myAlertBtn2.addEventListener('click',closeAlert);
        myAlertBtnDiv.appendChild(myAlertBtn2);
    }
	myAlert.append(myAlertImg, myAlertText, myAlertBtnDiv);
	document.body.append(mySheild, myAlert);
}
