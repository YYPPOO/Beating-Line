const cE = (type, v0, v1, k2, v2) => {
  const myElement = document.createElement(type);
  myElement.className = v0;
  myElement.textContent = v1 ? v1 : "";
  myElement[k2] = v2;
  return myElement;
};

const app = {};
app.get = id => document.getElementById(id);
app.event = (id, event, callback) => {
  document.getElementById(id).addEventListener(event, callback);
};

const showUserPic = data => {
  const storage = firebase.storage();
  storage.ref(authStatus().uid + '/main.jpg').getDownloadURL()
    .then(url => {
      document.querySelector(".memberIcon").src = url;
    })
    .catch(req => {
      document.querySelector(".memberIcon").src = data.photoURL ? data.photoURL : "../img/member.svg";
    })
};

function alert(text, isSuccess, callback) {
  document.activeElement.blur();
  const lastSheild = document.querySelector(".shield");
  lastSheild && lastSheild.parentNode.removeChild(lastSheild);
  const lastAlert = document.querySelector(".alert");
  lastAlert && lastAlert.parentNode.removeChild(lastAlert);

  const closeAlert = function () {
    document.removeEventListener("keydown", handleAlertKeyPress);
    mySheild.parentNode.removeChild(mySheild);
    myAlert.parentNode.removeChild(myAlert);
  }
  const handleAlertKeyPress = event => {
    event.stopImmediatePropagation();
    switch (event.keyCode) {
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

  const mySheild = cE("div", "shield");
  mySheild.addEventListener('click', closeAlert)
  const myAlert = cE("div", "alert");
  const myAlertImg = cE("img", "alertImg", "", "src", isSuccess ? "img/checked.svg" : "img/warning.svg");
  const myAlertText = cE('div', "alertText", text);
  const myAlertBtnDiv = cE("div", "alertBtnDiv");
  const myAlertBtn = cE('button', "alertBtn", "Okay");
  myAlertBtn.addEventListener('click', function () {
    closeAlert();
    typeof callback === 'function' && callback();
  });
  document.addEventListener("keydown", handleAlertKeyPress);
  myAlertBtnDiv.appendChild(myAlertBtn);
  if (typeof callback === 'function') {
    const myAlertBtn2 = cE('button', "alertCancel", "Cancel");
    myAlertBtn2.addEventListener('click', closeAlert);
    myAlertBtnDiv.appendChild(myAlertBtn2);
  }
  myAlert.append(myAlertImg, myAlertText, myAlertBtnDiv);
  document.body.append(mySheild, myAlert);
}
