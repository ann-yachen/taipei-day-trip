let userData = {}; // Save user status

const currentPage = window.location.href; // Get URL of current page

/* Booking */
const userBooking = document.getElementById("user-booking");

/* User modal */
const user = document.getElementById("user");
const modal = document.querySelector(".user__modal");
const modalCloseIcon = document.querySelector(".user__modal__close-icon");

/* User form */
const modalTitle = document.querySelector(".user__modal-title");
const userActionButton = document.getElementById("user-action-btn");
const userActionResult = document.getElementById("user-action-result");
const userActionMessage = document.getElementById("user-action-msg");
const userActionSwitch = document.getElementById("user-action-switch");

/* UserModel to get result by fetching API */
const UserModel = {
    post: function(name, email, password){
        (async () => {
            const requestOptions = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    "name": name,
                    "email": email,
                    "password": password                    
                })
            };
            try{
                const response = await fetch("/api/user", requestOptions);
                const result = await response.json();
                UserView.showMessage(result, "register");                
            }catch(err){
                console.log(err);
            }
        })();
    },

    get: function(callback){
        (async () => {
            try{
                const response = await fetch("/api/user/auth");
                const result = await response.json();
                UserView.showUserStatus(result);
                if(callback !== undefined){ // If there is a callback
                    callback(result); // Do something            
                }
            }catch(err){
                console.log(err);
            }
        })();
    },

    put: function(email, password){
        (async () => {
            const requestOptions = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    "email": email,
                    "password": password
                })
            };
            try{
                const response = await fetch("/api/user/auth", requestOptions);
                const result = await response.json();
                UserView.showMessage(result, "logIn");                 
            }catch(err){
                console.log(err);                
            }
           
        })();
    },

    delete: function(){
        (async () => {
            const requestOptions = { method: "DELETE" };
            try{
                const response = await fetch("/api/user/auth", requestOptions);
                const result = await response.json();
                UserView.showMessage(result, "logOut");                
            }catch(err){
                console.log(err);
            }
        })();
    }
}

/* UserView for rendering */
const UserView = {
    showUserStatus: function(result){
        if(result.data === null || result.error === true){
            user.textContent = "登入/註冊";
            user.addEventListener("click", UserView.showModal);
            userBooking.addEventListener("click", UserView.showModal);
        }else{
            userData = result;
            user.textContent = "登出系統";
            user.setAttribute("title", "登出系統");
            user.addEventListener("click", UserController.logOut);
            userBooking.addEventListener("click", UserView.redirectBooking);
        }
    },

    showModal: function(){
        modal.style.display = "block";
        document.querySelector("body").style.overflow = "hidden"; // Lock scroll
    },
    closeModal: function(){
        modal.style.display = "none";
        document.querySelector("body").style.overflow = "auto"; // Unlock scroll
    },

    switchRegister: function(){
        const userName = document.getElementById("user-name");
        userName.style.display = "block";

        /* Clear eventListener at button and switch */
        userActionButton.removeEventListener("click", UserController.logIn);
        userActionSwitch.removeEventListener("click", UserView.switchRegister);
        /* Clear value in input */        
        document.getElementById("user-name").value = "";
        document.getElementById("user-email").value = "";
        document.getElementById("user-password").value = "";

        modalTitle.textContent = "註冊會員帳戶";
        
        userActionButton.textContent = "註冊帳戶";
        userActionButton.addEventListener("click", UserController.register);
        
        /* Clear result message*/
        userActionResult.textContent = "";

        userActionMessage.textContent = "已經有帳戶？";
        userActionSwitch.textContent = "點此登入";
        userActionSwitch.addEventListener("click", UserView.switchLogIn);
    },

    switchLogIn: function(){
        const userName = document.getElementById("user-name");
        userName.style.display = "none";

        /* Clear eventListener at button and switch */
        userActionButton.removeEventListener("click", UserController.register);
        userActionSwitch.removeEventListener("click", UserView.switchLogIn); 
        document.getElementById("user-email").value = "";
        document.getElementById("user-password").value = "";

        modalTitle.textContent = "登入會員帳號";

        userActionButton.textContent = "登入帳戶";
        userActionButton.addEventListener("click", UserController.logIn);
        
        /* Clear result message*/
        userActionResult.textContent = "";
        
        userActionMessage.textContent = "還沒有帳戶？";
        userActionSwitch.textContent = "點此註冊";
        userActionSwitch.addEventListener("click", UserView.switchRegister);
    },

    showMessage: function(result, userAction){
        if(result.ok){
            userActionResult.className = "user-action-result--ok";
            switch (userAction){
                case "register":{
                    userActionResult.textContent = "註冊成功";
                    break;    
                }
                case "logIn":{
                    userActionResult.textContent = "登入成功";
                    UserView.reloadPage();
                    break; 
                }                    
                case "logOut":{
                    UserView.reloadPage();
                    break;
                } 
            }
        }
        if(result.error){
            userActionResult.className = "user-action-result--error";
            userActionResult.textContent = result.message;
        }        
    },

    reloadPage: function(){
        window.location.href = currentPage;
    },

    redirectBooking: function(){
        window.location.href = "/booking";
    }
}

/* UserController for user function control */
const UserController = {
    init: function(callback){
        modalCloseIcon.addEventListener("click", UserView.closeModal);
        userActionButton.addEventListener("click", UserController.logIn);
        userActionSwitch.addEventListener("click", UserView.switchRegister);      
        UserModel.get(callback); // Get user status then do something
    },

    register: function(){
        let name = document.getElementById("user-name").value;
        let email = document.getElementById("user-email").value;
        let password = document.getElementById("user-password").value;
        UserModel.post(name, email, password);
    },

    logIn: function(){
        let email = document.getElementById("user-email").value;
        let password = document.getElementById("user-password").value;
        UserModel.put(email, password);
    },

    logOut: function(){
        UserModel.delete();
    }
}

/* Export as module for nav and getting user status*/
export {
    userData,
    currentPage,
    userBooking,
    user, 
    modal,
    modalCloseIcon, 
    modalTitle, 
    userActionButton,
    userActionResult,
    userActionMessage,
    userActionSwitch,
    UserModel,
    UserView,
    UserController 
};