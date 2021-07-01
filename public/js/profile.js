const authStatus = () => firebase.auth().currentUser;

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log(user);
    console.log('登入id', authStatus().uid);
    console.log("成功以" + user.providerData[0].providerId + "登入");
    showUserData(user);
    showProfilePic(user);
    document.getElementById("logout").addEventListener("click", function () { alert("Log out of your account?!", false, logout) });

  } else {
    console.log("未登入");
    alert("You're logged out, go back to index in 3 seconds.", true);
    setTimeout(() => {
      window.location = "/index.html";
    }, 3000);
  }
});

const showUserData = user => {
  const myTitle = cE("h2", "profileTitle", "Profile");
  const emailKey = cE("span", "profileKey", "Email");
  const emailValue = cE("input", "profileValue", user.userEmail, "id", "userEmail");
  emailValue.type = "text";
  emailValue.value = user.email;
  emailValue.disabled = true;
  const nameKey = cE("span", "profileKey", "Name");
  const nameValue = cE("input", "profileValue", user.userName, "id", "userName");
  nameValue.type = "text";
  nameValue.value = user.displayName;
  nameValue.disabled = true;

  const uploadPicButton = cE("button", null, "Upload Pic", "id", "uploadPicButton");
  uploadPicButton.style.display = "none";
  uploadPicButton.addEventListener("click", uploadProfilePic);
  const uploadPic = cE("input", null, null, "type", "file");
  uploadPic.id = "uploadPic";
  uploadPic.style.display = "none";

  const renewProfileButton = cE("button", null, "Edit", "id", "renewProfileButton");
  renewProfileButton.addEventListener("click", renewProfile);
  const renewProfileCancel = cE("button", null, "Cancel", "id", "renewProfileCancel");
  renewProfileCancel.style.display = "none";
  renewProfileCancel.addEventListener("click", cancelRenewProfile);

  document.getElementById("profileContainer").append(
    myTitle, emailKey, emailValue, nameKey, nameValue, uploadPicButton, uploadPic, renewProfileButton, renewProfileCancel
  )
}

const showProfilePic = user => {
  const storage = firebase.storage();
  storage.ref(user.uid + '/main.jpg').getDownloadURL()
    .then(url => {
      document.getElementById("profilePic").style.backgroundImage = "url(" + url + ")";
    })
    .catch(error => {
      console.log(error);
      const width = user.providerData[0].providerId == "facebook.com" ? "/picture/?width=200" : "";
      if (user.photoURL) {
        document.getElementById("profilePic").style.backgroundImage = "url(" + user.photoURL + width + ")";
      }
    })
}

const uploadProfilePic = () => {
  const image = document.getElementById("uploadPic").files[0];
  if (image) {
    const user = authStatus();
    const imageRef = firebase.storage().ref(user.uid + "/").child("main.jpg");
    imageRef.put(image).then((snapshot) => {
      console.log("Main Image Uploaded");
      console.log(snapshot);
      alert("Upload success!", true);
      cancelRenewProfile();
      showProfilePic(user);
      showUserPic(user);
    }).catch((error) => {
      console.log("Main Image Error:" + error);
      alert("Upload fail, please try again. : (");
    });
  } else {
    alert("Please select an image.");
  }
}

const renewProfile = () => {
  if (document.getElementById("renewProfileButton").textContent == "Done") {
    document.getElementById("userName").disabled = true;
    document.getElementById("renewProfileButton").textContent = "Edit";
    document.getElementById("renewProfileCancel").style.display = "none";
    document.getElementById("uploadPicButton").style.display = "none";
    document.getElementById("uploadPic").style.display = "none";

    const name = document.getElementById("userName").value;
    const newUserData = {
      userId: authStatus().uid,
      userName: name,
      userEmail: authStatus().email
    };

    firebase.auth().currentUser.updateProfile({ displayName: name })
      .then(() => {
        console.log("Update display name to:", name);
        return fetch(dbHost + "/exe/manageAccount", {
          method: "POST",
          body: JSON.stringify(newUserData),
          mode: 'cors',
          headers: {
            "Content-Type": "application/json"
          }
        });
      })
      .then(res => res.json())
      .then(response => {
        alert("Update profile!", true);
        console.log("Update to database success:", response);
      })
      .catch(function (error) {
        alert("Update fail, please try again.");
        console.log("Update display name fail:", error);
      });
  } else {
    document.getElementById("userName").disabled = false;
    document.getElementById("renewProfileButton").textContent = "Done";
    document.getElementById("renewProfileCancel").style.display = "block";
    document.getElementById("uploadPicButton").style.display = "block";
    document.getElementById("uploadPic").style.display = "block";
  }
}

const cancelRenewProfile = () => {
  document.getElementById("userName").disabled = true;
  document.getElementById("userName").value = authStatus().displayName;
  document.getElementById("renewProfileButton").textContent = "Edit";
  document.getElementById("renewProfileCancel").style.display = "none";
  document.getElementById("uploadPicButton").style.display = "none";
  document.getElementById("uploadPic").style.display = "none";
}

const logout = () => {
  firebase.auth().signOut()
    .then(() => {
      alert("Log out success. Page is reloading.", true);
      setTimeout(() => {
        window.location = "/index.html";
      }, 3000);
    })
    .catch(error => {
      alert("Log out fail, please try again.");
      console.log(error);
    })
}
