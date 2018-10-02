
let authStatus = function(){
    return firebase.auth().currentUser;
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log(user);
        console.log('登入id',authStatus().uid);
        console.log("成功以"+user.providerData[0].providerId+"登入");
        showUserPic(user);

        document.querySelector(".memberIcon").addEventListener("click",function(){
            window.location = "/profile.html";
        });
    } else {
        console.log("未登入");
        alert("您已登出！即將在 3 秒後跳轉頁面…", true);
		setTimeout(function () {
			window.location = "/index.html";
		}, 3000);
    }
});

document.getElementById("logout").addEventListener("click",function(){alert("即將登出您的帳戶？！",false,logout)});

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
