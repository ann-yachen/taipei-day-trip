import * as User from "./user.js"
User.UserController.init(); // Init user features

const orderNumber = document.getElementById("order-number");

let currentURL = window.location.href;
orderNumber.textContent = currentURL.split("=")[1];
