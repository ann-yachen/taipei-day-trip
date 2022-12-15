import * as User from "./user.js"
User.UserController.init();

/* For rendering of attractions */       
const attractions = document.getElementById("attractions");
/* For fetching data of attractions from API, default setting is for window.load */
let page = 0;
let keyword = null;
let src = "/api/attractions?page=" + page;
/* Check if fetching is on-going to avoid fetching before the previous fetching finished */
let isLoading = false; 
/* Create the intersection observer to sense if footer is in viewpoint, it means the end of page  */
const pageEndObserver = new IntersectionObserver((entries) => {
    if(entries[0].intersectionRatio > 0){
        return fetchAttractions(page, keyword);
    }
});
/* Start to observe footer for loading next page */        
pageEndObserver.observe(document.querySelector("footer"));
window.load = fetchCategories();
/* For search by keyword */
function searchAttractions(){
    /* Reset page, set keyword and clear section for attractions*/
    page = 0;
    keyword = document.getElementById("keyword").value;
    attractions.innerHTML = "";
    /* If no scrolling before search, remove the observation when window load */
    pageEndObserver.unobserve(document.querySelector("footer"));
    /* Then re-add the observation */
    pageEndObserver.observe(document.querySelector("footer"));
}
/* Fetch data of attractions */
function fetchAttractions(page, keyword){
    /* Check if keyword exists */
    if(keyword === null){
        src = "/api/attractions?page=" + page;
    }else{
        src = "/api/attractions?page=" + page + "&keyword=" + keyword;
    }
    /* Check if the page is loading, if no, fetching */
    if(isLoading === false){
        isLoading = true; /* Record that the page is loading */
        /* Fetch */
        fetch(src).then((response) => {
            return response.json();
        }).then(renderAttractions);                
    }
}
function renderAttractions(data){
    let attractionsData = data.data;
    /* If no attraction matches to keyword */
    if(attractionsData.length == 0){
        attractions.textContent = "沒有找到符合的景點，請重新輸入";
    }else{
        for(let i = 0; i < attractionsData.length; i++){
            let attraction = document.createElement("div");
            attraction.className = "attraction";
                /* Create image of attraction with hyperlink */                    
            let imageLink = document.createElement("a");
            imageLink.setAttribute("href", "/attraction/" + attractionsData[i]["id"]);                 
            let image = document.createElement("img");
            image.setAttribute("src", attractionsData[i]["images"][0]);
            image.className = "attraction-img";
            imageLink.appendChild(image);                    
            attraction.appendChild(imageLink);                    
            /* Create name of attraction */                   
            let name = document.createElement("div");
            name.textContent =  attractionsData[i]["name"];
            name.className = "attraction-name";               
            attraction.appendChild(name);
            /* Create infos of attraction */                
            let infos = document.createElement("div");
            infos.className = "attraction-infos";
            /* Add info: MRT */
            let mrt = document.createElement("div");
            mrt.textContent =  attractionsData[i]["mrt"];
            mrt.className = "attraction-mrt";
            infos.appendChild(mrt);
            /* Add info: category */
            let category = document.createElement("div");
            category.textContent =  attractionsData[i]["category"];
            category.className = "attraction-category";
            infos.appendChild(category);              
            attraction.appendChild(infos);
            /* Append all div into attraction */
            attractions.appendChild(attraction);                
        }
    }
    /* Check if the last page */
    if(data.nextPage === null){
        /* Close the observer */
        pageEndObserver.unobserve(document.querySelector("footer"));
    }else{
        page = data.nextPage;                
    }
    /* For next page fetching */
    if(keyword === null){
        src = "/api/attractions?page=" + page;
    }else{
        src = "/api/attractions?page=" + page + "&keyword=" + keyword;
    }
    isLoading = false; /* After fetching, record the page is not loading for next fetching */
}

/* For fetching API to get all categories */
const categoriesMenu = document.querySelector(".categories-menu");
const outOfCategoriesMenu = document.querySelector(".out-of-categories-menu"); 
function fetchCategories(){
    fetch("/api/categories").then((response) => {
        return response.json();
    }).then(getCategories);
}
function getCategories(data){
    let categoriesData = data["data"];           
    let categories = document.getElementById("categories");
    for(let i = 0; i < categoriesData.length; i++){
        let category = document.createElement("div");
        category.textContent = categoriesData[i];
        category.className = "category";
        category.addEventListener("click", selectCategory); /* Add event to select category for keyword */
        categories.appendChild(category);
    }
}
/* Open and close categories menu */
function openCategoriesMenu(){
    categoriesMenu.className = "categories-menu--open";
    outOfCategoriesMenu.style.display = "block";
}
function closeCategoriesMenu(){
    categoriesMenu.className = "categories-menu";
    outOfCategoriesMenu.style.display = "none";
}
/* Put category into search box */
function selectCategory(){
    let keyword = document.getElementById("keyword");
    keyword.value = this.textContent;
    closeCategoriesMenu(); /* Close the menu with categories */
}