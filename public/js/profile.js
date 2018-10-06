const dbHost = "https://beating-line.firebaseapp.com";
let authStatus = function(){
    return firebase.auth().currentUser;
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log(user);
        console.log('登入id',authStatus().uid);
        console.log("成功以"+user.providerData[0].providerId+"登入");
        showUserData(user);
        showProfilePic(user);
        showUserPic(user);
        document.querySelector(".memberIcon").addEventListener("click",function(){
            window.location = "/profile.html";
        });
        document.getElementById("logout").addEventListener("click",function(){alert("Log out of your account?!",false,logout)});

    } else {
        console.log("未登入");
        alert("You're logged out, go back to index in 3 seconds.", true);
		setTimeout(function () {
			window.location = "/index.html";
		}, 3000);
    }
});

let showUserData = function(user) {
    // app.removeElement(".nRight");
	console.log(user);

	let myTitle = cE("h2","profileTitle","Profile");
	// let myHr = cE("div","hr");

	// let profileDiv = cE("div", "profileDiv");
    let emailKey = cE("span", "profileKey", "Email");
    let emailValue = cE("input", "profileValue", user.userEmail, "id", "userEmail");
        emailValue.type = "text";
        emailValue.value = user.email;
        emailValue.disabled = true;
	let nameKey = cE("span", "profileKey","Name");
    let nameValue = cE("input", "profileValue", user.userName, "id", "userName");
        nameValue.type = "text";
        nameValue.value = user.displayName;
        nameValue.disabled = true;
    
        // profileDiv.append();

    let uploadPicButton = cE("button",null,"Upload Pic","id","uploadPicButton");
        uploadPicButton.style.display = "none";
        uploadPicButton.addEventListener("click",uploadProfilePic);
    let uploadPic = cE("input",null,null,"type","file");
        uploadPic.id = "uploadPic";
        uploadPic.style.display = "none";
    
    let renewProfileButton = cE("button",null,"Edit","id","renewProfileButton");
        renewProfileButton.addEventListener("click",renewProfile);
    let renewProfileCancel = cE("button",null,"Cancel","id","renewProfileCancel");
        renewProfileCancel.style.display = "none";
        renewProfileCancel.addEventListener("click",cancelRenewProfile);

    document.getElementById("profileContainer").append(
        myTitle, emailKey, emailValue, nameKey, nameValue, uploadPicButton, uploadPic, renewProfileButton, renewProfileCancel
    )
}

let showProfilePic = function(user) {
    let storage = firebase.storage();
    storage.ref(user.uid+'/main.jpg').getDownloadURL().then((url)=>{
        document.getElementById("profilePic").style.backgroundImage = "url("+url+")";
    }).catch( (req) => {
        console.log(req);
        let width = user.providerData[0].providerId == "facebook.com" ?"/picture/?width=200":"";
        if(user.photoURL) {
            document.getElementById("profilePic").style.backgroundImage = "url("+user.photoURL+width+")";
        }        
    })
}

let uploadProfilePic = function () {
	let image = document.getElementById("uploadPic").files[0];
    console.log(image);
    if (image) {
        let user = authStatus();
        // let storage = ourFirebase.storage();
        let imageRef = firebase.storage().ref(user.uid + "/").child("main.jpg");
        console.log(imageRef);
        imageRef.put(image).then((snapshot) => {
            console.log("Main Image Uploaded");
            console.log(snapshot);
            // storage.ref(authStatus().uid+'/main.jpg').getDownloadURL().then((url)=>{
            //     console.log(url);
            // 	user.updateProfile({photoURL:snapshop}).then((res) => {
            // 		alert("圖片上傳成功！",true);
            // 		console.log(res);
            // 	}).catch((error)=>{console.log(error)});
            // }).catch( (req) => {
            // 	console.log("Cannot get photo url."+req);
            // })
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

let renewProfile = function() {
	if (document.getElementById("renewProfileButton").textContent == "Done") {
		document.getElementById("userName").disabled = true;
		document.getElementById("renewProfileButton").textContent = "Edit";
		document.getElementById("renewProfileCancel").style.display = "none";
		document.getElementById("uploadPicButton").style.display = "none";
		document.getElementById("uploadPic").style.display = "none";
        
        let name = document.getElementById("userName").value;
        let newUserData = {
			userId: authStatus().uid,
			userName: name,
			userEmail: authStatus().email
            // providerId:user.providerData[0].providerId
        };

        firebase.auth().currentUser.updateProfile({displayName: name})
            .then(function() {
                console.log("Update display name to:",name);
                fetch(dbHost+"/exe/manageAccount", {
                    method:"POST",
                    body: JSON.stringify(newUserData),
                    mode: 'cors',
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(res => res.json())
                .catch(error => {
                    alert("Update fail, please try again.");
                    console.error("Update to database error:",error)
                })
                .then(response => {
                    alert("Update profile!", true);
                    console.log("Update to database success:",response);
				    console.log(authStatus());
                });
            }).catch(function(error) {
            // An error happened.
            alert("Update fail, please try again.");
            console.log("Update display name fail:",error);
        });

	} else {
		document.getElementById("userName").disabled = false;
		document.getElementById("renewProfileButton").textContent = "Done";
		document.getElementById("renewProfileCancel").style.display = "block";
		document.getElementById("uploadPicButton").style.display = "block";
		document.getElementById("uploadPic").style.display = "block";
	}
}

let cancelRenewProfile = function() {
    document.getElementById("userName").disabled = true;
    document.getElementById("userName").value = authStatus().displayName;
    document.getElementById("renewProfileButton").textContent = "Edit";
    document.getElementById("renewProfileCancel").style.display = "none";
    document.getElementById("uploadPicButton").style.display = "none";
    document.getElementById("uploadPic").style.display = "none";
}


let logout = function () {
	firebase.auth().signOut().then(function () {
		alert("Log out success, go back to index in 3 seconds.", true);
		console.log("email sign out")
		setTimeout(function () {
			window.location = "/index.html";
		}, 3000);
	}).catch(function (error) {
		alert("Log out fail, please try again.");
		console.log(error);
	})
}
