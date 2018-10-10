const cE = (type,v0,v1,k2,v2) => {
    let myElement = document.createElement(type);
    myElement.className = v0;
    myElement.textContent = v1 ? v1:"";
    myElement[k2] = v2;
    return myElement;
};

let showUserPic = function(data){
    let storage = firebase.storage();
    storage.ref(authStatus().uid+'/main.jpg').getDownloadURL().then((url)=>{
        console.log(url);
        document.querySelector(".memberIcon").src = url;
    }).catch( (req) => {
        // console.log(req);
        // let width = data.providerData[0].providerId == "facebook.com" ?"/picture/?width=200":"";
        document.querySelector(".memberIcon").src=data.photoURL?data.photoURL:"../img/member.svg"; //+width;
    })
};

function alert(text, boolean, cb) {
    document.activeElement.blur();
    let lastSheild = document.querySelector(".shield");
        lastSheild && lastSheild.parentNode.removeChild(lastSheild);
    let lastAlert = document.querySelector(".alert");
        lastAlert && lastAlert.parentNode.removeChild(lastAlert);
    
    let closeAlert = function() {
        document.removeEventListener("keydown",handleAlertKeyPress);
        mySheild.parentNode.removeChild(mySheild);
		myAlert.parentNode.removeChild(myAlert);
    }
    let handleAlertKeyPress = function(e) {
        e.stopImmediatePropagation();
        switch(e.keyCode) {
            case 32: //" "
                myAlertBtn.click();
                break;
            case 13: //enter
                myAlertBtn.click();
                break;
            case 27: //esc
                closeAlert();
                break;
        }
    };

	let mySheild = cE("div", "shield");
	mySheild.addEventListener('click',closeAlert)
	let myAlert = cE("div", "alert");
	let myAlertImg = cE("img","alertImg","","src", boolean ? "img/checked.svg" : "img/warning.svg");
	let myAlertText = cE('div', "alertText", text);
	let myAlertBtnDiv = cE("div","alertBtnDiv");
    let myAlertBtn = cE('button', "alertBtn", "Okay");
	myAlertBtn.addEventListener('click', function () {
        closeAlert();
		cb && cb();
    });
    document.addEventListener("keydown",handleAlertKeyPress);
    myAlertBtnDiv.appendChild(myAlertBtn);
    if(cb) {
        let myAlertBtn2 = cE('button', "alertCancel", "Cancel");
        myAlertBtn2.addEventListener('click',closeAlert);
        myAlertBtnDiv.appendChild(myAlertBtn2);
    }
    myAlert.append(myAlertImg, myAlertText, myAlertBtnDiv);
	document.body.append(mySheild, myAlert);
}
