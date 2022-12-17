import * as User from "./user.js"

/* ================= Render Attraction ================= */
/* Get current URL to get attraction id for fetching */
let currentURL = window.location.href;
let attractionId = currentURL.split("/")[4]; // ['https', '', '<ip>', 'attraction', '<id>']
let src = "/api/attraction/" + attractionId;

/* Get elements for rendering infos */
const pageTitle = document.querySelector("title"); // HTML title
const name = document.getElementById("name");
const category = document.getElementById("category");
const mrt = document.getElementById("mrt");
const description = document.getElementById("description");
const address = document.getElementById("address")
const transport = document.getElementById("transport");

/* Get element for rendering images by carousel */      
const images = document.getElementById("carousel");
let imageIndex = 0;

/* Fetching attraction data by id */
const AttractionModel = {
    get: function(){
        (async () => {
            try{
                const response = await fetch(src);
                const result = await response.json();
                const attractionData = result.data;
                const attractionImages = result.data.images;
                AttractionView.renderInfo(attractionData);
                AttractionView.renderImages(attractionImages);
                AttractionView.showCarouselImages(imageIndex); // Change images as carousel
            }catch(err){
                console.log(err);
            }
        })();
    }
 }

const AttractionView = {
    renderInfo: function(attractionData){
        pageTitle.textContent = attractionData.name;
        name.textContent = attractionData.name;
        category.textContent = attractionData.category;
        mrt.textContent = attractionData.mrt;
        description.textContent = attractionData.description;
        address.textContent = attractionData.address;
        transport.textContent = attractionData.transport;
    },

    renderImages: function(attractionImages){
        /* Create images */
        for(let i = 0; i < attractionImages.length; i++){
            let image = document.createElement("img");
            image.src = attractionImages[i];
            image.className = "carousel-image";
            images.appendChild(image);
        }
        /* Create prev/next buttons */
        let prev = document.createElement("img");
        prev.setAttribute("src", "/img/attraction/btn_leftArrow.png");
        prev.className = "carousel-prev";
        /* Set attribute "image-plus" = -1 to show the previous image */
        prev.setAttribute("image-plus", -1);
        /* Add event by anonymous function for passing "image-plus" */    
        prev.addEventListener("click", () => { AttractionView.plusCarouselImages(prev.getAttribute("image-plus")) });
        images.appendChild(prev);
        let next = document.createElement("img");
        next.setAttribute("src", "/img/attraction/btn_rightArrow.png");
        next.className = "carousel-next";
        /* Set attribute "image-plus" = 1 to show the next image */
        next.setAttribute("image-plus", 1);
        /* Add event by anonymous function for passing "image-plus" */
        next.addEventListener("click", () => { AttractionView.plusCarouselImages(next.getAttribute("image-plus")) });
        images.appendChild(next);
        /* Create indicators for carousel */            
        let indicators = document.createElement("ol");
        indicators.className = "carousel-indicators";
        for(let i = 0; i < attractionImages.length; i++){
            let indicator = document.createElement("li");
            indicator.className = "indicator";
            /* Set attribute "image-to" as an indicator to show which image */
            indicator.setAttribute("image-to", i);
            /* Add event by anonymous function for passing "image-to" */
            indicator.addEventListener("click", () => { AttractionView.currentCarouselImage(indicator.getAttribute("image-to")) });
            indicators.appendChild(indicator);
        }
        images.appendChild(indicators);
    },

    /* For prev/next button to show the previous/next image */
    plusCarouselImages: function(n){
        imageIndex += parseInt(n);
        AttractionView.showCarouselImages(imageIndex); // Pass imageIndex after changed
    },

    /* For indicator to show the xth image */
    currentCarouselImage: function(n){
        imageIndex = parseInt(n);
        AttractionView.showCarouselImages(imageIndex); // Pass imageIndex after changed
    },

    showCarouselImages: function(n){
        /* Get all images and indicators */
        let images = document.getElementsByClassName("carousel-image");
        let indicators = document.getElementsByClassName("indicator");
        /* If the next image index is out of range, go back to the first one */
        if (n >= images.length){
            imageIndex = 0;
        }
        /* If the previous image index is out of range, go back to the last one */    
        if(n < 0){
            imageIndex = images.length - 1;
        }
        /* Hidden all images in advance */
        for(let i = 0; i < images.length; i++){
            images[i].style.display = "none";  
        }
        /* Change all indicators to inactive in advance */
        for(let i = 0; i < indicators.length; i++){
            indicators[i].className = indicators[i].className.replace(" active", "");
        }
        /* Show the image by current index and change itsindicator to active */
        images[imageIndex].style.display = "block";  
        indicators[imageIndex].className += " active";       
    }
}

const AttractionController = {
    init: function(){
        AttractionModel.get();
    }
}

/* ================= Attraction Booking ================ */
 /* Get elements for changing price */
const timeMorning = document.getElementById("time-morning");
const timeAfternoon = document.getElementById("time-afternoon");

 /* Get elements for booking */
const bookingButton = document.getElementById("booking-btn");
const dateError = document.getElementById("date-error");

const BookingAttractionModel = {
    post: function(attractionId, date, time, price){
        (async () => {
            try{
                const requestOptions = {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        "attractionId": attractionId,
                        "date": date,
                        "time": time,
                        "price": price                   
                    })
                };
                const response = await fetch("/api/booking", requestOptions);
                const result = await response.json();
                BookingAttractionView.showBookingStatus(result);                
            }catch(err){
                console.log(err);
            }
        })();
    }
}

const BookingAttractionView = {
    changePrice: function(){
        if(this.value == "afternoon"){
            price.textContent = "2500";
        }else{
            price.textContent = "2000";
        }
    },

    /* Callback after getting user status */
    switchBooking: function(result){
        /* Check if user have logged in or not in advance */
        if(result.data === null || result.error === true){
            bookingButton.addEventListener("click", User.UserView.showModal); // If not, need to log in in advance
        }else{
            bookingButton.addEventListener("click", BookingAttractionController.booking);
        }
    },

    showBookingStatus: function(result){
        if(result.ok === true){
            window.location.href = "/booking";
        }
    }
}

const BookingAttractionController = {
    init: function(){
        timeMorning.addEventListener("click", BookingAttractionView.changePrice);
        timeAfternoon.addEventListener("click", BookingAttractionView.changePrice);
    },

    booking: function(){
        let attractionId = window.location.href.split("/")[4];
        let date = document.getElementById("date").value;
        let time;
        let times = document.getElementsByName("time");
        for(let i = 0; i < times.length; i++){
            if(times[i].checked){
                time = times[i].value;
            }
        }
        let price = document.getElementById("price").textContent;
        if(date === ""){
            dateError.textContent = "請選擇日期";
        }else{
            BookingAttractionModel.post(attractionId, date, time, price);            
        }
    }
}

/* Init user features */
User.UserController.init(BookingAttractionView.switchBooking);

/* Init attraction and booking features */
AttractionController.init();
BookingAttractionController.init();

