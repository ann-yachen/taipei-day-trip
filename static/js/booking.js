import * as User from "./user.js"

const welcomeMessage = document.querySelector(".booking__header");
const welcomeUserName = document.getElementById("welcome-user-name");

const booking = document.querySelector(".booking__body");
const bookingDeleteIcon = document.querySelector(".booking__body__delete-icon");
const bookingNone = document.querySelector(".booking__body--none");

/* Get elements to render booking info */
const image = document.getElementById("image");
const name = document.getElementById("name");
const date = document.getElementById("date");
const time = document.getElementById("time");
const price = document.getElementById("price");
const address = document.getElementById("address");

const contactName = document.getElementById("contact-name");
const contactEmail = document.getElementById("contact-email");
const contactPhone = document.getElementById("contact-phone");
const contactPhoneError = document.getElementById("contact-phone-error");

const totalPrice = document.getElementById("total-price");

/* Get element for payment */
const paymentButton = document.getElementById("payment-btn");

/* For Booking */
const BookingModel = {
    get: function(){
        /* Get booking by fetching */
        (async () => {
            try{
                const response = await fetch("/api/booking");
                const result = await response.json();
                if(result.error === true && response.status === 403){
                    window.location.href = "/";
                }else{
                    BookingView.showBooking(result);
                }
            }catch(err){
                console.log(err);
            }
        })();
    },

    delete: function(){
        (async () => {
            const requestOptions = { method: "DELETE" };
            try{
                const response = await fetch("/api/booking", requestOptions);
                const result = await response.json();
                if(result.ok === true){
                    window.location.href = "/booking";
                }
            }catch(err){
                console.log(err);
            }
        })();
    }
}

const BookingView = {
    showBooking: function(result){
        if(result.data === null){
            bookingNone.style.display = "block";
        }
        else{
            const attractionImage = document.createElement("img");
            attractionImage.setAttribute("src", result.data.attraction.image);
            attractionImage.className = "attraction-img";
            image.appendChild(attractionImage);
            name.textContent = result.data.attraction.name;
            date.textContent = result.data.date;
            if(result.data.time === "morning"){
                time.textContent = "上午 9 點至下午 4 點";
            }else{
                time.textContent = "下午 2 點至晚上 9 點";
            }
            price.textContent = result.data.price;
            totalPrice.textContent = result.data.price;
            address.textContent = result.data.attraction.address;
            booking.style.display = "block";          
        }
    }
}

const BookingController = {
    init: function(){
        bookingDeleteIcon.addEventListener("click", BookingController.deleteBooking);
    },

    /* Callback after getting user status  */
    getBooking: function(result){
        /* Check if user have logged in or not in advance */
        if(result.data === null){
            window.location.href = "/"; // If not, go back to homepage
        }else{ // If yes
            /* Update user information to booking form */
            welcomeUserName.textContent = result.data.name;
            welcomeMessage.style.display = "block";
            contactName.value = result.data.name;
            contactEmail.value = result.data.email;
            BookingModel.get();
        }
    },

    deleteBooking: function(){
        BookingModel.delete();
    }
}

/* Init user features */
User.UserController.init(BookingController.getBooking);

/* Init booking features */
BookingController.init();


/* ================= Payment: TapPay ================= */
TPDirect.setupSDK(126891, "app_GprUKxj17ZCLNKyHjPFN8l5kFQ4OyDcdMQL0tteOXK6947AIU5U6inFjEDSJ", "sandbox");

/* TapPay fields including credit card number, expiration date and ccv */
const fields = {
    number: {
        element: "#card-number",
        placeholder: "**** **** **** ****"
    },
    expirationDate: {
        element: document.getElementById("card-expiration-date"),
        placeholder: "MM / YY"
    },
    ccv: {
        element: "#card-ccv",
        placeholder: "ccv"
    }
}

/* Sytle for fields */
TPDirect.card.setup({
    fields: fields,
    styles: {
        // Style all elements
        "input": {
            "color": "gray",
        },
        
        // Style ccv field
        "input.ccv": {
            "font-size": "16px"
        },
        // Style expiration-date field
        "input.expiration-date": {
            "font-size": "16px"
        },
        // Style card-number field
        "input.card-number": {
            "font-size": "16px"
        },

        // Style focus state
        ":focus": {
            "color": "black"
        },
        // Style valid state
        ".valid": {
            "color": "#448899"
        },
        // Style invalid state
        ".invalid": {
            "color": "#FF2400"
        },

        // Media queries
        // Note that these apply to the iframe, not the root window.
        "@media screen and (max-width: 400px)": {
            "input": {
                "color": "orange"
            }
        }
    },

    /*
     This setting will show that after the card number is entered correctly, 
     the first six and last four digits of the credit card number will be *.
    */
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 0,
        endIndex: 11
    }
})

const OrderModel = {
    getTapPayPrime: function(e){
        e.preventDefault();
        
        // Get TapPay Fields status
        const tappayStatus = TPDirect.card.getTappayFieldsStatus();
        // Check if can getPrime or not
        if(tappayStatus.canGetPrime === false){
            alert("Cannot get prime.");
        }else{
            // Get prime
            TPDirect.card.getPrime((result) => {
                if(result.status !== 0){
                    alert("get prime error " + result.msg);
                }
                let prime =  result.card.prime;
                OrderModel.post(prime);
            })                 
        }
    },

    post: function(prime){
        (async () => {
            try{
                let bookingResponse = await fetch("/api/booking");
                let bookingResult = await bookingResponse.json();
                const order = bookingResult;
                order.price = order.data.price;
                delete order.data.price;
                order.trip = order.data;
                delete order.data;
                const contact = OrderView.getContactInfo();
                /* Check if contact infos have been filled */
                if(contact !== undefined){
                    const requestOptions = {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            prime,
                            order,
                            contact                    
                        })
                    };
                    OrderView.lockPaymentButton(); // Disable payment button to avoid sending request
                    const orderResponse = await fetch("/api/orders", requestOptions);
                    const orderResult = await orderResponse.json();
                    OrderView.getOrderResult(orderResult);
                }
            }catch(err){
                console.log(err);
            }
        })();
    }
}

const OrderView = {
    getOrderResult: function(result){
        if(result.error === true){
            alert(result.message);
            OrderView.lockPaymentButton();
        }else{
            window.location.href = "/thankyou?number=" + result.data.number; // Redirect to thankyou page
        }
    },

    getContactInfo: function(){
        let name = contactName.value;
        let email = contactEmail.value;
        let phone = contactPhone.value;
        if(phone === ""){
            contactPhoneError.textContent = "請輸入電話";
        }else{
            contactPhoneError.textContent = "";
            const contact = {
                "name": name,
                "email": email,
                "phone": phone
            }
            return contact;            
        }
    },

    lockPaymentButton: function(){
        paymentButton.setAttribute("disabled", "disabled");
        paymentButton.textContent = "付款中請稍候...";
    },
    
    unlockPaymentButton: function(){
        paymentButton.removeAttribute("disabled");
        paymentButton.textContent = "確認訂購並付款";
    }
}

const OrderController = {
    init: function(){
        paymentButton.addEventListener("click", OrderModel.getTapPayPrime);
    }
}

/* Init order features */
OrderController.init();