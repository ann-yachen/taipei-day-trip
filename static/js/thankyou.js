const orderNumber = document.getElementById("order-number");

let currentURL = window.location.href;
orderNumber.textContent = currentURL.split("=")[1];
