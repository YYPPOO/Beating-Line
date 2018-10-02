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
        document.getElementById("logout").addEventListener("click",function(){alert("即將登出您的帳戶？！",false,logout)});

    } else {
        console.log("未登入");
        alert("您已登出！即將在 3 秒後跳轉頁面…", true);
		setTimeout(function () {
			window.location = "/index.html";
		}, 3000);
    }
});

let showUserData = function(user) {
    // app.removeElement(".nRight");
	console.log(user);

	let myTitle = cE("h2","profileTitle","個人資料");
	// let myHr = cE("div","hr");

	// let profileDiv = cE("div", "profileDiv");
    let emailKey = cE("span", "profileKey", "Email");
    let emailValue = cE("input", "profileValue", user.userEmail, "id", "userEmail");
        emailValue.type = "text";
        emailValue.value = user.email;
        emailValue.disabled = true;
	let nameKey = cE("span", "profileKey","顯示名稱");
    let nameValue = cE("input", "profileValue", user.userName, "id", "userName");
        nameValue.type = "text";
        nameValue.value = user.displayName;
        nameValue.disabled = true;
    
        // profileDiv.append();

    let uploadPicButton = cE("button",null,"上傳頭像","id","uploadPicButton");
        uploadPicButton.style.display = "none";
        uploadPicButton.addEventListener("click",uploadProfilePic);
    let uploadPic = cE("input",null,null,"type","file");
        uploadPic.id = "uploadPic";
        uploadPic.style.display = "none";
    
    let renewProfileButton = cE("button",null,"更改資料","id","renewProfileButton");
        renewProfileButton.addEventListener("click",renewProfile);
    let renewProfileCancel = cE("button",null,"取消","id","renewProfileCancel");
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
		alert("圖片上傳成功！", true);
		cancelRenewProfile();
		showProfilePic(user);
		showUserPic(user);
	}).catch((error) => {
		console.log("Main Image Error:" + error);
		alert("圖片上傳失敗 : (");
	});
}

let renewProfile = function() {
	if (document.getElementById("renewProfileButton").textContent == "確認資料") {
		document.getElementById("userName").disabled = true;
		document.getElementById("renewProfileButton").textContent = "更改資料";
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
                    alert("資料更新失敗，請再試一次 :(");
                    console.error("Update to database error:",error)
                })
                .then(response => {
                    alert("資料更改成功！", true);
                    console.log("Update to database success:",response);
				    console.log(authStatus());
                });
            }).catch(function(error) {
            // An error happened.
            alert("資料更新失敗，請再試一次 :(");
            console.log("Update display name fail:",error);
        });

	} else {
		document.getElementById("userName").disabled = false;
		document.getElementById("renewProfileButton").textContent = "確認資料";
		document.getElementById("renewProfileCancel").style.display = "block";
		document.getElementById("uploadPicButton").style.display = "block";
		document.getElementById("uploadPic").style.display = "block";
	}
}

let cancelRenewProfile = function() {
    document.getElementById("userName").disabled = true;
    document.getElementById("userName").value = authStatus().displayName;
    document.getElementById("renewProfileButton").textContent = "更改資料";
    document.getElementById("renewProfileCancel").style.display = "none";
    document.getElementById("uploadPicButton").style.display = "none";
    document.getElementById("uploadPic").style.display = "none";
}


let logout = function () {
	firebase.auth().signOut().then(function () {
		alert("成功登出！即將在 3 秒後跳轉頁面…", true);
		console.log("email sign out")
		setTimeout(function () {
			window.location = "/index.html";
		}, 3000);
	}).catch(function (error) {
		alert("登出失敗，請再試一次 :(");
		console.log(error);
	})
}
