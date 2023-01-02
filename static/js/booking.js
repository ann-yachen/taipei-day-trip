const welcomeMessage = document.querySelector(".bookings__header");
const welcomeUserName = document.getElementById("welcome-user-name");

const bookings = document.querySelector(".bookings__body");
const bookingsNone = document.querySelector(".bookings__body--none");
const bookingsFooter = document.querySelector(".bookings__footer");

const contactName = document.getElementById("contact-name");
const contactEmail = document.getElementById("contact-email");
const contactPhone = document.getElementById("contact-phone");
const contactNameError = document.getElementById("contact-name-error");
const contactEmailError = document.getElementById("contact-email-error");
const contactPhoneError = document.getElementById("contact-phone-error");

const totalPrice = document.getElementById("total-price");

/* Get element for payment */
const cardNumberError = document.getElementById("card-number-error");
const cardExpirationDateError = document.getElementById("card-expiration-date-error");
const cardCCVError = document.getElementById("card-ccv-error");
const paymentButton = document.getElementById("payment-btn");

/* ================= Booking ================= */
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

    delete: function(bookingId){
        (async () => {
            const requestOptions = {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    "bookingId": bookingId
                })
            };
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
            bookingsNone.style.display = "block";
            bookingsFooter.style.display = "none";
        }
        else{
            let bookingsData = result.data;
            for(let i = 0; i < bookingsData.length; i++){
                BookingView.renderBooking(bookingsData[i]);
            }
            bookings.style.display = "block";
            BookingView.showTotalPrice(bookingsData);
            bookingsFooter.style.display = "block";
        }
    },

    renderBooking: function(bookingData){
        /* Create DocumentFragment for each booking rendering */
        let fragment = document.createDocumentFragment();

        /* Create booking */
        let booking = document.createElement("div");
        booking.className = "booking";
        
        /* Create booking content */
        let content = document.createElement("div");
        content.className = "content";

        /* Add attraction image into content */
        let image = document.createElement("div");
        image.className = "image";
        let attractionImage = document.createElement("img");
        attractionImage.setAttribute("src", bookingData.attraction.image);
        attractionImage.className = "attraction-img";
        image.appendChild(attractionImage);

        /* Add attraction info into content */
        let info = document.createElement("div");
        info.className = "info";

        let name = document.createElement("div");
        name.className = "attraction-name";
        name.textContent = "台北一日遊：" + bookingData.attraction.name;

        let date = document.createElement("div");
        let dateTitle = document.createElement("span");
        dateTitle.className = "sub-title";
        dateTitle.textContent = "日期：";
        date.appendChild(dateTitle);
        date.append(bookingData.date);

        let time = document.createElement("div");
        let timeTitle = document.createElement("span");
        timeTitle.className = "sub-title";
        timeTitle.textContent = "時間：";
        time.appendChild(timeTitle);
        if(bookingData.time === "morning"){
            time.append("上午 9 點至下午 2 點");
        }else{
            time.append("下午 2 點至晚上 7 點");
        }

        let price = document.createElement("div");
        let priceTitle = document.createElement("span");
        priceTitle.className = "sub-title";
        priceTitle.textContent = "費用：";
        price.appendChild(priceTitle);
        price.append("新台幣 ", bookingData.price, " 元");

        let address = document.createElement("div");
        let addressTitle = document.createElement("span");
        addressTitle.className = "sub-title";
        addressTitle.textContent = "地點：";
        address.appendChild(addressTitle);
        address.append(bookingData.attraction.address);

        /* Add all attraction infos into info and append to content with image */
        info.append(name, date, time, price, address);
        content.append(image, info);

        /* Create delete icon of booking */
        let bookingDeleteIcon = document.createElement("div");
        bookingDeleteIcon.className = "booking__delete-icon";
        bookingDeleteIcon.setAttribute("booking-id", bookingData.id);
        let deleteIcon = document.createElement("img");
        deleteIcon.setAttribute("src", "/img/booking/icon_delete.png");
        deleteIcon.setAttribute("title", "刪除行程");
        bookingDeleteIcon.appendChild(deleteIcon);
        bookingDeleteIcon.addEventListener("click", BookingController.deleteBooking);

        /* Create hr */
        let hr = document.createElement("hr");
        hr.className = "hr-solid";

        booking.append(content, bookingDeleteIcon, hr);
        fragment.appendChild(booking);

        /* Add DocumentFragment with booking into bookings */
        bookings.appendChild(fragment);
    },

    showTotalPrice: function(bookingsData){
        let totalbookingsPrice = 0;
        for(let i = 0; i < bookingsData.length; i++){
            totalbookingsPrice += bookingsData[i].price;
        }
        totalPrice.textContent = totalbookingsPrice;
    }
}

const BookingController = {
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
        let bookingId = this.getAttribute("booking-id");

        BookingModel.delete(bookingId);
    }
}


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
    getTapPayPrime: function(contact){
        // Get TapPay Fields status
        const tappayStatus = TPDirect.card.getTappayFieldsStatus();

        // Check if can getPrime or not
        if(tappayStatus.canGetPrime === false){
            switch(tappayStatus.status.number){
                case 1:{
                    document.getElementById("card-number").style.border = "1px solid #FF2400";
                    cardNumberError.textContent = "請填寫卡片號碼";
                    break;
                }
                case 2:{
                    document.getElementById("card-number").style.border = "1px solid #FF2400";
                    cardNumberError.textContent = "卡片號碼有誤";
                    break;
                }
            }
            switch(tappayStatus.status.expiry){
                case 1:{
                    document.getElementById("card-expiration-date").style.border = "1px solid #FF2400";
                    cardExpirationDateError.textContent = "請填寫過期時間";
                    break;
                }
                case 2:{
                    document.getElementById("card-expiration-date").style.border = "1px solid #FF2400";
                    cardExpirationDateError.textContent = "過期時間有誤";
                    break;
                }
            }
            switch(tappayStatus.status.ccv){
                case 1:{
                    document.getElementById("card-ccv").style.border = "1px solid #FF2400";
                    cardCCVError.textContent = "請填寫驗證密碼";
                    break;
                }
                case 2:{
                    document.getElementById("card-ccv").style.border = "1px solid #FF2400";
                    cardCCVError.textContent = "驗證密碼有誤";
                    break;
                }
            }
        }else{
            /* Reset error messages */
            document.getElementById("card-number").style.border = "1px solid #EEEEEE";
            document.getElementById("card-expiration-date").style.border = "1px solid #EEEEEE";
            document.getElementById("card-ccv").style.border = "1px solid #EEEEEE";
            cardNumberError.textContent = "";
            cardExpirationDateError.textContent = "";
            cardCCVError.textContent = "";

            // Get prime
            TPDirect.card.getPrime((result) => {
                if(result.status !== 0){
                    alert("get prime error " + result.msg);
                }
                let prime =  result.card.prime;
                OrderModel.post(prime, contact);
            })
        }
    },

    post: function(prime, contact){
        (async () => {
            try{
                /* Get booking data from api */
                let bookingResponse = await fetch("/api/booking");
                let bookingResult = await bookingResponse.json();
                const order = bookingResult;
                order.price = 0;
                for(let i = 0; i < order.data.length; i++){
                    delete order.data[i].id; // Remove booking id
                    order.price += order.data[i].price;
                    delete order.data[i].price; // Remove price for each booking
                }
                order.trip = order.data;
                delete order.data; // Remove booking data after organization
                /* Get contact infos */
                //const contact = OrderView.getContactInfo();
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

    /* Input validation for contact infos */
    validateContactName: function(){
        if(!contactName.checkValidity()){
            contactName.style.border = "1px solid #FF2400";
            contactNameError.textContent = " ⚠ " + contactName.validationMessage;          
        }else{
            contactName.style.border = "1px solid #CCCCCC";
            contactNameError.textContent = "";
            return contactName.value;
        }
    },

    validateContactEmail: function(){
        if(!contactEmail.checkValidity()){
            contactEmail.style.border = "1px solid #FF2400";
            contactEmailError.textContent = " ⚠ " + contactEmail.validationMessage;          
        }else{
            contactEmail.style.border = "1px solid #CCCCCC";
            contactEmailError.textContent = "";
            return contactEmail.value;
        }
    },

    validateContactPhone: function(){
        if(!contactPhone.checkValidity()){
            contactPhone.style.border = "1px solid #FF2400";
            contactPhoneError.textContent = " ⚠ " + contactPhone.validationMessage;          
        }else{
            contactPhone.style.border = "1px solid #CCCCCC";
            contactPhoneError.textContent = "";
            return contactPhone.value;
        }
    },

    /* Lock payment button when payment is on-going */
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
        paymentButton.addEventListener("click", OrderController.payment);
    },
    
    payment: function(){
        let contact = {};
        let name = OrderView.validateContactName();
        let email = OrderView.validateContactEmail();
        let phone = OrderView.validateContactPhone();
        if(name !== undefined && email !== undefined && phone !== undefined){
            contact = {
                "name": name,
                "email": email,
                "phone": phone
            }
            OrderModel.getTapPayPrime(contact);
        }
    }
}

/* Export as module for rendering booking and order */
export {
    welcomeMessage,
    welcomeUserName,
    bookings,
    bookingsNone,
    bookingsFooter,
    contactName,
    contactEmail,
    contactPhone,
    contactNameError,
    contactEmailError,
    contactPhoneError,
    totalPrice,
    cardNumberError,
    cardExpirationDateError,
    cardCCVError,
    paymentButton,
    BookingModel,
    BookingView,
    BookingController,
    
    fields,
    OrderModel,
    OrderView,
    OrderController
};