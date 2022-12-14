import { getUserStatus } from "./user.js" // Import UserModel.get

const welcomeUserName = document.getElementById("welcome-user-name");

const booking = document.querySelector(".booking__body");
const bookingDeleteIcon = document.querySelector(".booking__body__delete-icon");
const bookingNone = document.querySelector(".booking__body--none");

const image = document.getElementById("image");
const name = document.getElementById("name");
const date = document.getElementById("date");
const time = document.getElementById("time");
const price = document.getElementById("price");
const address = document.getElementById("address");

const contactName = document.getElementById("contact-name");
const contactEmail = document.getElementById("contact-email");

const totalPrice = document.getElementById("total-price");

const BookingModel = {
    get: function(userData){
        /* Check if user logged in or not in advance*/
        if(userData.data === null){
            window.location.href = "/"; // If not, go back to homepage
        }else{ // If yes
            /* Update user information to booking form */
            welcomeUserName.textContent = userData.data.name;
            contactName.value = userData.data.name;
            contactEmail.value = userData.data.email;

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
        }        
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
            let attractionImage = document.createElement("img");
            attractionImage.setAttribute("src", result.data.attraction.image);
            attractionImage.className = "attraction-img";
            image.appendChild(attractionImage);
            name.textContent = result.data.attraction.name;
            date.textContent = result.data.date;
            if(result.data.time === "morning"){
                time.textContent = "上半天";
            }else{
                time.textContent = "下半天";
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
        getUserStatus(BookingModel.get);
    },

    deleteBooking: function(){
        BookingModel.delete();
    }
}

BookingController.init();


