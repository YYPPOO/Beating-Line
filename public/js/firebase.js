const dbHost = "https://beating-line.firebaseapp.com";

const authStatus = () => firebase.auth().currentUser;

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log(user);
    showUserPic(user);
    document.getElementById("memberName").textContent = "Hello, " + user.displayName;
    getUserBeatList(user.uid);
    console.log("Log in with " + user.providerData[0].providerId);
    getRedirectResult();
  } else {
    console.log("Log out.");
  }
});

// facebook log in --------------------------------------------
const fbLogin = () => {
  const provider = new firebase.auth.FacebookAuthProvider();
  firebase.auth().signInWithRedirect(provider);
  alert("Page is reloading...", true);
};

// google log in ----------------------------------------------
const gLogin = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithRedirect(provider);
  alert("Page is reloading...", true);
}

// confirm FB or google log in state, update back-end user database
const getRedirectResult = () => {
  firebase.auth().getRedirectResult()
    .then(result => {
      if (!(result && result.user)) throw new Error('fetch error');
      const user = firebase.auth().currentUser;
      const userData = {
        userName: user.displayName,
        userEmail: user.email,
        userId: user.uid,
        providerId: user.providerData[0].providerId
      };
      return fetch(dbHost + "/exe/manageAccount", {
        method: "POST",
        body: JSON.stringify(userData),
        mode: 'cors',
        headers: {
          "Content-Type": "application/json"
        }
      })
    })
    .then(res => res.json())
    .then(response => {
      console.log("Log in success:", response);
    })
    .catch(error => console.error("Fetch error:", error));
}

// email password log in --------------------------------------------
const signIn = () => {
  const email = document.getElementById("logInEmail").value;
  const password = document.getElementById("logInPassword").value;
  if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email)) {
    alert("Email error, please try again.");
    return;
  }
  if (password.length < 4) {
    alert("Password error, please try again.");
    return;
  }
  alert("Delivering the data.", true);
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Log in success.", true);
      document.location.reload();
    })
    .catch(error => {
      console.log(error);
      if (error.code == "auth/invalid-email" || error.code == "auth/user-not-found") {
        return alert("Email error, please try again.");
      }
      if (error.code == "auth/wrong-password") {
        return alert("Password error, please try again.");
      }
      alert(error.message);
    });
}

// email password sign up ---------------------------------------------
const signUp = () => {
  const email = document.getElementById("logInEmail").value;
  const password = document.getElementById("logInPassword").value;
  const name = document.getElementById("logInName").value;
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
  alert("Delivering the data.", true);
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      const user = firebase.auth().currentUser;
      user.updateProfile({ displayName: name })
        .then(() => {
          // Update successful.
          user.sendEmailVerification()
            .then(() => {
              console.log(user);
              console.log("Email sent.");
              const userData = {
                userName: user.displayName,
                userEmail: user.email,
                userId: user.uid,
                providerId: user.providerData[0].providerId
              };
              fetch(dbHost + "/exe/manageAccount", {
                method: "POST",
                body: JSON.stringify(userData),
                headers: {
                  "Content-Type": "application/json"
                }
              })
                .then(res => res.json())
                .catch(error => console.error("Create account data error:", error))
                .then(response => {
                  alert("Sign up success, and the verify email is send. Reload in 3 seconds.", true);
                  setTimeout(() => { document.location.reload() }, 3000);
                })
            })
            .catch(error => {
              console.log("send mail fail:" + error);
            });
        }).catch(error => {
          console.log("update profile fail:" + error);
        });
    })
    .catch(error => {
      console.log(error);
      if (error.code == "auth/weak-password") {
        return alert("The password is too weak, please try again.");
      }
      if (error.code == "auth/email-already-in-use") {
        return alert("This Email is already registered, please try again.")
      }
      alert(error.message);
    });
}

const resetPassword = () => {
  const email = document.getElementById("logInEmail").value;
  if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email)) {
    alert("Please enter your email.");
    return;
  }
  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alert("The reset password email is send. Reload in 3 seconds.", true)
      console.log("Email sent!")
      setTimeout(document.location.reload(), 3000);
    })
    .catch(error => {
      alert("Email error, please try again.");
      console.log(error);
    });
}

const goToProfile = () => {
  saveBeatToLocalStorage();
  window.location = "/profile.html";
}

const popUpLogIn = () => {
  saveBeatToLocalStorage();
  if (authStatus() !== null) {
    return;
  }

  const closeLogIn = function () {
    mySheild.parentNode.removeChild(mySheild);
    myLogIn.parentNode.removeChild(myLogIn);
  }

  const mySheild = cE("div", "logInShield");
  mySheild.addEventListener('click', closeLogIn);

  const myLogIn = cE("div", "logIn");
  const myLogInDiv = cE("div", "logInDiv");
  const myLogoImg = cE("img", "logInImg", null, "src", "img/logo.svg");

  const myNameInput = cE("input", "logInName", null, "placeholder", "Name");
  const myEmailInput = cE("input", "logInEmail", null, "placeholder", "Email");
  const myPasswordInput = cE("input", "logInPassword", null, "placeholder", "********");

  myNameInput.type = "text";
  myNameInput.id = "logInName";
  myEmailInput.type = "email";
  myEmailInput.id = "logInEmail";
  myPasswordInput.type = "password";
  myPasswordInput.id = "logInPassword";

  const mySignLink = cE("a", "logInText", "Already have an account? Sign in here.");
  mySignLink.addEventListener("click", function() { // TODO: remove 'this' next line to use arrow function
    const logging = this.textContent === "Already have an account? Sign in here.";
    //true = sign up to sign in, false = sign in to sign up
    mySignLink.textContent = logging ? "Don't have an account? Sign up here." : "Already have an account? Sign in here.";
    myForget.textContent = logging ? "Forget password?" : "";
    myNameInput.style.display = logging ? "none" : "block";
    mySignButton.textContent = logging ? "Sign In" : "Sign Up";
    mySignButton.removeEventListener("click", logging ? signUp : signIn);
    mySignButton.addEventListener("click", logging ? signIn : signUp);
  })

  const myForget = cE("a", "logInText", "", "id", "forgetPassword");
  myForget.addEventListener("click", resetPassword);

  const mySignButton = cE("button", "", "Sign Up");
  mySignButton.addEventListener("click", signUp);

  const myPolicyDiv = cE("div", "policyDiv");
  const myPolicyText = cE("span", "policyText");
  myPolicyText.innerHTML = "Agree our <a class='logInText' target='_blank' href='terms.html'>Terms</a> and <a class='logInText' target='_blank' href='privacy.html'>Privacy Policy</a> by clicking.";
  myPolicyDiv.append(myPolicyText);

  const myHrDiv = cE("div", "divideLine");
  const myLine = cE("span", "hrLine");
  const myOr = cE("span", "logInOr", "or Sign in with community account.");
  const myLineTwo = cE("span", "hrLine");

  myHrDiv.append(myLine, myOr, myLineTwo);

  const myAlertBtnDiv = cE("div", "alertBtnDiv");
  const myFB = cE("img", "logInIcon", "", "src", "img/facebook.svg");
  myFB.addEventListener("click", fbLogin);
  const myG = cE("img", "logInIcon", "", "src", "img/google.svg");
  myG.addEventListener("click", gLogin);

  myAlertBtnDiv.append(myFB, myG);

  myLogInDiv.append(myLogoImg, myNameInput, myEmailInput, myPasswordInput, mySignLink, myForget, mySignButton, myPolicyDiv, myHrDiv, myAlertBtnDiv);
  myLogIn.appendChild(myLogInDiv);

  document.body.append(mySheild, myLogIn);
}

const getUserBeatList = uid => {
  fetch(dbHost + "/exe/getUserBeat?userId=" + uid, { method: "GET" })
    .then(res => res.json())
    .then(response => {
      if (!response.error) showUserBeatList(response, uid);
    })
    .catch(error => {
      console.error("Load user beat error: ", error);
    });
}

const showUserBeatList = (userBeatList, uid) => {
  const myBeatListBtn = cE("button", "beatListBtn", "My Beat ");
  myBeatListBtn.id = "myBeat";
  myBeatListBtn.addEventListener("click", () => {
    myBeatListBtn.classList.toggle("beatListBtnShow");
    myBeatListDiv.classList.toggle("beatListDivShow");
  })
  document.getElementById("sideNav").appendChild(myBeatListBtn);
  const myBeatListDiv = cE("div", "beatListDiv");
  for (let i in userBeatList) {
    const myBeatDiv = cE("div", "beatDiv");
    const myBeat = cE("div", "beatName", userBeatList[i], "id", i);
    myBeat.addEventListener("click", () => {
      fetch(dbHost + "/exe/getBeat?id=" + i, {
        method: "GET",
        headers: new Headers({
          "Content-Type": "application/json"
        })
      })
      .then(res => res.json())
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
          beat.beatId = i;
          document.getElementById("bpm").value = beat.bpm;
          for (let k = 0; k < beat.trackQty; k++) {
            document.getElementById("trackSetVolume" + k).value = beat.volume[k];
          }
          decideLength(mediaQuery);
          state.playing && app.reset();
          window.history.pushState(null, beat.beatName, "index.html?id=" + beat.beatId);
        })
        .catch(error => {
          console.error("Load beat error:", error)
        });
    })
    const myBeatDelete = cE("div", "deleteBeat", "X");
    myBeatDelete.addEventListener("click", () => {
      alert("Delete the beat?!", false, () => {
        deleteBeat(i, uid);
      });
    })
    myBeatDiv.append(myBeat, myBeatDelete);
    myBeatListDiv.appendChild(myBeatDiv);
  }
  document.getElementById("sideNav").appendChild(myBeatListDiv);
}

const deleteBeat = (deleteBeatId, uid) => {
  fetch(dbHost + "/exe/deleteBeat?beatId=" + deleteBeatId + "&userId=" + uid, {
    method: "delete"
  })
  .then(res => res.json())
    .then(response => {
      console.log(response);
      alert("Beat delete.", true);
      removeUserBeatList();
      getUserBeatList(authStatus().uid);
      if (beat.beatId == deleteBeatId) {
        beat.beatId = "";
        window.history.replaceState(null, "", "index.html");
      }
    }).catch(error => {
      console.log(error);
      alert("Beat delete fail, please try again.")
    })
}

const removeUserBeatList = () => {
  const beatListBtn = document.querySelector(".beatListBtn");
  beatListBtn && beatListBtn.parentNode.removeChild(beatListBtn);
  const beatListDiv = document.querySelector(".beatListDiv");
  beatListDiv && beatListDiv.parentNode.removeChild(beatListDiv);
}