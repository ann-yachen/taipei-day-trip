let userData = {}; // Save user status

const currentPage = window.location.href; // Get URL of current page

const body = document.querySelector("body"); // Get body to freeze screen when user modal pop-up

/* Booking */
const userBooking = document.getElementById("user-booking");

/* User modal */
const user = document.getElementById("user");
const modal = document.querySelector(".user__modal");
const modalCloseIcon = document.querySelector(".user__modal__close-icon");

/* User form */
const modalTitle = document.querySelector(".user__modal-title");

const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");
const userPassword = document.getElementById("user-password");

const userActionButton = document.getElementById("user-action-btn");
const userActionResult = document.getElementById("user-action-result");
const userActionMessage = document.getElementById("user-action-msg");
const userActionSwitch = document.getElementById("user-action-switch");

/* User input validation */
const userNameError = document.getElementById("user-name-error");
const userEmailError = document.getElementById("user-email-error");
const userPasswordError = document.getElementById("user-password-error");

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
            user.textContent = "會員中心";
            user.setAttribute("title", "會員中心");
            user.addEventListener("click", UserView.redirectAccount);
            userBooking.addEventListener("click", UserView.redirectBooking);
        }
    },

    showModal: function(){
        modal.style.display = "block";
        body.style.overflow = "hidden"; // Lock scroll
    },
    closeModal: function(){
        modal.style.display = "none";
        body.style.overflow = "auto"; // Unlock scroll
    },

    switchRegister: function(){
        userName.style.display = "block";

        /* Clear eventListener at button and switch */
        userActionButton.removeEventListener("click", UserController.logIn);
        userActionSwitch.removeEventListener("click", UserView.switchRegister);
        
        /* Reset all inputs and error messages */
        userName.value = "";
        userEmail.value = "";
        userPassword.value = "";
        userName.style.border = "1px solid #CCCCCC";
        userEmail.style.border = "1px solid #CCCCCC";
        userPassword.style.border = "1px solid #CCCCCC";
        userNameError.textContent = "";
        userEmailError.textContent = "";
        userPasswordError.textContent = "";
        
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
        userName.style.display = "none";

        /* Clear eventListener at button and switch */
        userActionButton.removeEventListener("click", UserController.register);
        userActionSwitch.removeEventListener("click", UserView.switchLogIn); 
        userEmail.value = "";
        userPassword.value = "";        

        /* Reset all inputs and error messages */
        userName.value = "";
        userEmail.value = "";
        userPassword.value = "";
        userName.style.border = "1px solid #CCCCCC";
        userEmail.style.border = "1px solid #CCCCCC";
        userPassword.style.border = "1px solid #CCCCCC";
        userNameError.textContent = "";
        userEmailError.textContent = "";
        userPasswordError.textContent = "";

        modalTitle.textContent = "登入會員帳號";

        userActionButton.textContent = "登入帳戶";
        userActionButton.addEventListener("click", UserController.logIn);
        
        /* Clear result message*/
        userActionResult.textContent = "";
        
        userActionMessage.textContent = "還沒有帳戶？";
        userActionSwitch.textContent = "點此註冊";
        userActionSwitch.addEventListener("click", UserView.switchRegister);
    },

    /* Input validation for User */
    validateUserName: function(){
        if(!userName.checkValidity()){
            userName.style.border = "1px solid #FF2400";
            userNameError.textContent = " ⚠ " + userName.validationMessage;
        }else{
            userName.style.border = "1px solid #CCCCCC";
            userNameError.textContent = "";
            return userName.value;
        }
    },

    validateUserEmail: function(){
        if(!userEmail.checkValidity()){
            userEmail.style.border = "1px solid #FF2400";
            userEmailError.textContent = " ⚠ " + userEmail.validationMessage;
        }else{
            userEmail.style.border = "1px solid #CCCCCC";
            userEmailError.textContent = "";
            return userEmail.value;
        }
    },

    validateUserPassword: function(){
        if(!userPassword.checkValidity()){
            userPassword.style.border = "1px solid #FF2400";
            let errorMessage = userPassword.validationMessage;
            if(userPassword.validity.patternMismatch){
                errorMessage = "密碼須符合格式：8 位數以上，並且至少包含數字、小寫字母、大寫字母各 1。"
            }
            userPasswordError.textContent = " ⚠ " + errorMessage;
        }else{
            userPassword.style.border = "1px solid #CCCCCC";
            userPasswordError.textContent = "";
            return userPassword.value;
        }
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
    },

    redirectAccount: function(){
        window.location.href = "/account";
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
        /* Clear result message*/
        userActionResult.textContent = "";

        let name = UserView.validateUserName();
        let email = UserView.validateUserEmail();
        let password = UserView.validateUserPassword();
        if(name !== undefined && email !== undefined && password !== undefined){
            userActionButton.setAttribute("disabled", "disabled");
            UserModel.post(name, email, password);
        }
    },

    logIn: function(){
        /* Clear result message*/
        userActionResult.textContent = "";

        let email = UserView.validateUserEmail();
        let password = UserView.validateUserPassword();
        if(email !== undefined && password !== undefined){
            userActionButton.setAttribute("disabled", "disabled");
            UserModel.put(email, password);
        }
    },

    logOut: function(){
        this.setAttribute("disabled", "disabled");
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
    userName,
    userEmail,
    userPassword,
    userActionButton,
    userActionResult,
    userActionMessage,
    userActionSwitch,
    userNameError,
    userEmailError,
    userPasswordError,
    UserModel,
    UserView,
    UserController 
};