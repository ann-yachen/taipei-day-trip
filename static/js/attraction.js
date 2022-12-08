/* Get current URL to get attraction id for fetching */
let currentURL = window.location.href;
let id = currentURL.split("/")[4]; // ['https', '', '<ip>', 'attraction', '<id>']
let src = "/api/attraction/" + id;

/* Get elements for rendering infos */
const page_title = document.querySelector("title"); // HTML title
const name = document.getElementById("name");
const category = document.getElementById("category");
const mrt = document.getElementById("mrt");
const description = document.getElementById("description");
const address = document.getElementById("address")
const transport = document.getElementById("transport");
/* Get element for rendering images by carousel */      
const images = document.getElementById("carousel");
let imageIndex = 0;

/* Get elements to show price */
const timeMorning = document.getElementById("time-morning");
const timeAfternoon = document.getElementById("time-afternoon");
let price = document.getElementById("price");

/* Fetching attraction data by id */
fetch(src).then((response) => {
    return response.json();
}).then(render)
.catch((error) => {
    console.log(error);
});
function render(data){
    let attractionData = data.data;
    let attractionImages = data.data.images;
    renderInfo(attractionData);
    renderImages(attractionImages);
    showImages(imageIndex);
}

/* Rendering attraction infos and images */
function renderInfo(attractionData){
    page_title.textContent = attractionData.name;
    name.textContent = attractionData.name;
    category.textContent = attractionData.category;
    mrt.textContent = attractionData.mrt;
    description.textContent = attractionData.description;
    address.textContent = attractionData.address;
    transport.textContent = attractionData.transport;            
}
function renderImages(attractionImages){
    /* Create images */
    for(let i = 0; i < attractionImages.length; i++){
        let image = document.createElement("img");
        image.src = attractionImages[i];
        image.className = "carousel-image";
        images.appendChild(image);
    }
    /* Create prev/next buttons */
    let prev = document.createElement("img");
    prev.setAttribute("src", "/img/btn_leftArrow.png");
    prev.className = "carousel-prev";
    /* Set attribute "image-plus" = -1 to show the previous image */
    prev.setAttribute("image-plus", -1);          
    prev.addEventListener("click", () => { plusImages(prev.getAttribute("image-plus")) }); // Add event by anonymous function for passing "image-plus"
    images.appendChild(prev);
    let next = document.createElement("img");
    next.setAttribute("src", "/img/btn_rightArrow.png");
    next.className = "carousel-next";
    /* Set attribute "image-plus" = 1 to show the next image */
    next.setAttribute("image-plus", 1);           
    next.addEventListener("click", () => { plusImages(next.getAttribute("image-plus")) }); // Add event by anonymous function for passing "image-plus"
    images.appendChild(next);
    /* Create indicators for carousel */            
    let indicators = document.createElement("ol");
    indicators.className = "carousel-indicators";
    for(let i = 0; i < attractionImages.length; i++){
        let indicator = document.createElement("li");
        indicator.className = "indicator";
        /* Set attribute "image-to" as an indicator to show which image */
        indicator.setAttribute("image-to", i);
        indicator.addEventListener("click", () => { currentImage(indicator.getAttribute("image-to")) }); // Add event by anonymous function for passing "image-to"
        indicators.appendChild(indicator);
    }
    images.appendChild(indicators);
}
/* For prev/next button to show the previous/next image */
function plusImages(n){
    imageIndex += parseInt(n);
    showImages(imageIndex); // Pass imageIndex after changed
}
/* For indicator to show the xth image */
function currentImage(n){
    imageIndex = parseInt(n);
    showImages(imageIndex); // Pass imageIndex after changed
}
/* Control showing images */
function showImages(n){
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

/* Add event to change price */
timeMorning.addEventListener("click", changePrice);
timeAfternoon.addEventListener("click", changePrice);

function changePrice(){
    if(this.value == "afternoon"){
        price.textContent = "2500";
    }else{
        price.textContent = "2000";
    }
}