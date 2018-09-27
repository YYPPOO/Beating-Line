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
        document.querySelector(".memberIcons").src = url;
    }).catch( (req) => {
        console.log(req);
        // let width = data.providerData[0].providerId == "facebook.com" ?"/picture/?width=200":"";
        document.querySelector(".memberIcons").src=data.photoURL?data.photoURL:"../img/member.svg"; //+width;
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
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(e){
        console.log(e);
        alert("登入成功！",true)
        document.location.reload();
        // setTimeout(document.location.reload(),3000);
    })
    .catch(function(error) {
        if(error.code=="auth/invalid-email"||error.code=="auth/user-not-found") {
            alert("請輸入正確的Email。")
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
        alert("請輸入Email");
        return;
    }
    if (password.length < 4) {
        alert("請輸入密碼");
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
            alert("請輸入長一點的密碼");
        } else if (error.code=="auth/email-already-in-use") {
            alert("此帳戶已註冊，請重新輸入 Email。")
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
        alert("請輸入 Email 後再點選，我們會寄送重設密碼連結至您的信箱。");
        return;
    }
    firebase.auth().sendPasswordResetEmail(email).then(function() {
            alert("已寄送重設密碼連結至您的Email，即將在 3 秒後跳轉頁面…",true)
            console.log("Email sent!")
            setTimeout(document.location.reload(),3000);
        }).catch(function(error) {
            alert("Email有誤，請重新再試。");
            console.log(error);
        });
}  



function goToProfile() {
    window.location = "/profile.html";
}

//==========================製造登入小視窗=============================


//實際跳出的產生函式

function popUpLogIn() {
    let lastSheild = document.querySelector(".logInShield");
    while(lastSheild) {
        lastSheild.parentNode.removeChild(lastSheild);
    }
    if(authStatus()!==null) {
        return;
    }

    //最大的那塊灰區域
    let mySheild = cE("div","logInShield");
    //點擊背後大塊區域會自動消失功能
	mySheild.addEventListener('click',function(e){
        mySheild.style.display = "none";
        myLogIn.style.display = "none";
    })

    let myLogIn = cE("div","logIn");

    //LOGO 以及點擊回首頁的LINK
	let myLogoImg = cE("img",null,null,"src","img/icon.svg");

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
    
    let mySignInText = cE("div",null,"已經有帳號了？請點這裡");
    let mySignInLink = cE("a",null,"登入");
        mySignInLink.addEventListener("click",function(){
            let logging = this.textContent == "登入";
            console.log(logging);
            //true表示註冊中將轉為登入 false為登入中將轉為註冊
                mySignInText.textContent = logging?"還沒有帳號嗎？請點這裡":"已經有帳號了？請點這裡";
                mySignInLink.textContent = logging?"註冊":"登入";
                myForget.textContent = logging?"忘記密碼？":"";
                myNameInput.style.display = logging?"none":"block";
                mySignUp.textContent = logging?"登入":"註冊";
                signUpOnClick = logging?signIn:signUp;
                // mySignIn.style.display = logging?"block":"none";
        })
        // mySignInText.appendChild(mySignInLink);

    //這邊是忘記密碼的那個連結！
    let myForget = cE("a",null,"","id","forgetPassword");
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
		let myOr =  cE("span","","or");	
		let myLineTwo =  cE("span","hrLine");

    myHrDiv.append(myLine,myOr,myLineTwo);
    
    //ＦＢ跟ＧＯＯＧＬＥ的按鈕區
    let myFB =  cE("button",null,"Log In With Facebook");
        myFB.addEventListener("click",fbLogin);
    let myG =  cE("button","goo","Log In With Gmail");
        myG.addEventListener("click",gLogin);

    myLogIn.append(myLogoImg,myNameInput,myEmailInput,myPasswordInput,mySignInText,mySignInLink,myForget,mySignUp,myHrDiv,myFB,myG);
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
	let mySheild = cE("div", "shield");
	mySheild.addEventListener('click', function () {
		mySheild.style.display = "none";
		myAlert.style.display = "none";
	})
	let myAlert = cE("div", "alert");
	let myAlertImg = cE("img","alertImg","","src", boolean ? "img/checked.svg" : "img/warning.svg");
	let myAlertText = cE('div', "alertText", text);
	let myAlertBtnDiv = cE("div","alertBtnDiv");
	let myAlertBtn = cE('button', "alertBtn", "確認");
	myAlertBtn.addEventListener('click', function () {
		mySheild.style.display = "none";
		myAlert.style.display = "none";
		cb && cb();
    });
    myAlertBtnDiv.appendChild(myAlertBtn);
    if(cb) {
        let myAlertBtn2 = cE('button', "alertCancel", "取消");
        myAlertBtn2.addEventListener('click', function () {
            mySheild.style.display = "none";
            myAlert.style.display = "none";
        });
        myAlertBtnDiv.appendChild(myAlertBtn2);
    }
	myAlert.append(myAlertImg, myAlertText, myAlertBtnDiv);
	document.body.append(mySheild, myAlert);
}
