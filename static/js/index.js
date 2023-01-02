/* ================= Render Attractions ================= */
/* For rendering of attractions */       
const attractions = document.getElementById("attractions");

/* For fetching data of attractions from API, default setting is for window.load */
let page = 0;
let keyword = null;
let src = "/api/attractions?page=" + page;

/* Check if fetching is on-going to avoid fetching before the previous fetching finished */
let isLoading = false;

/* For infinite scrolling by observing footer which means the end of the page */
const footer = document.querySelector("footer");

/* Create the intersection observer to sense if target is in viewpoint */
const pageEndObserver = new IntersectionObserver((entries) => {
    if(entries[0].intersectionRatio > 0){
        return AttractionsController.showAttractions(page, keyword);
    }
});

/* Search icon for search */
const searchIcon = document.getElementById("search");
const searchKeyword = document.getElementById("keyword");

const AttractionsModel = {
    get: function(src){
        (async () => {
            try{
                const response = await fetch(src);
                const result = await response.json();
                AttractionsView.renderAttractions(result);
                AttractionsView.getNextPage(result);
                /* After fetching, record the page is not loading for next fetching */
                isLoading = false;
            }catch(err){
                console.log(err)
            }
        })();
    }
}

const AttractionsView = {
    renderAttractions: function(result){
        let attractionsData = result.data;

        /* If no attraction matches to keyword */
        if(attractionsData.length === 0){
            attractions.textContent = "沒有找到符合的景點，請重新輸入";
        }else{
            for(let i = 0; i < attractionsData.length; i++){
                let attraction = document.createElement("div");
                attraction.className = "attraction";

                /* Create image of attraction with hyperlink */                    
                let imageLink = document.createElement("a");
                imageLink.setAttribute("href", "/attraction/" + attractionsData[i]["id"]);
                imageLink.setAttribute("title", attractionsData[i]["name"]);
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
    },

    getNextPage: function(result){
        /* Check if the last page */
        if(result.nextPage === null){
            pageEndObserver.unobserve(footer); // Close the observer */
        }else{
            page = result.nextPage;
        }
        /* For next page fetching */
        if(keyword === null){
            src = "/api/attractions?page=" + page;
        }else{
            src = "/api/attractions?page=" + page + "&keyword=" + keyword;
        }
    }
}

const AttractionsController = {
    init: function(){
        /* Observe footer for loading next page */
        pageEndObserver.observe(footer);
        searchIcon.addEventListener("click", AttractionsController.searchAttractions);
    },

    showAttractions: function(page, keyword){
        /* Check if keyword exists */
        if(keyword === null){
            src = "/api/attractions?page=" + page;
        }else{
            src = "/api/attractions?page=" + page + "&keyword=" + keyword;
        }
        /* Check if the page is loading, if no, fetching */
        if(isLoading === false){
            isLoading = true; /* Record that the page is loading */
            AttractionsModel.get(src);
        }        
    },

    searchAttractions: function(){
        /* Clear section for attractions */
        attractions.innerHTML = "";

        /* Reset page and set keyword from input */
        page = 0;
        keyword = searchKeyword.value;

        /* If no scrolling before search, remove the first observation when window load */
        pageEndObserver.unobserve(footer);
        /* Then re-add the observation */
        pageEndObserver.observe(footer);
    }
}

/* ================= Show Categories for searching ================= */
/* For rendering categories of search */
const categories = document.getElementById("categories");

const categoriesMenu = document.querySelector(".search__categories");
const outOfCategoriesMenu = document.querySelector(".search__categories-close"); 

const CategoriesModel = {
    get: function(){
        (async () => {
            try{
                const response = await fetch("/api/categories");
                const result = await response.json();
                CategoriesView.renderCategories(result);
            }catch(err){
                console.log(err);
            }
        })();
    }
}

const CategoriesView = {
    renderCategories: function(result){
        let categoriesData = result.data;           
        for(let i = 0; i < categoriesData.length; i++){
            let category = document.createElement("div");
            category.textContent = categoriesData[i];
            category.className = "category";
            category.addEventListener("click", CategoriesController.selectCategory); /* Add event to select category for keyword */
            categories.appendChild(category);
        }
    },

    openCategoriesMenu: function(){
        categoriesMenu.className = "search__categories--open";
        outOfCategoriesMenu.style.display = "block";
        outOfCategoriesMenu.addEventListener("click", CategoriesView.closeCategoriesMenu);
    },

    closeCategoriesMenu: function(){
        categoriesMenu.className = "search__categories";
        outOfCategoriesMenu.style.display = "none";
    }
}

const CategoriesController = {
    init: function(){
        CategoriesModel.get(); // Get categories by fetching API
        searchKeyword.addEventListener("click", CategoriesView.openCategoriesMenu);
    },

    selectCategory: function(){
        searchKeyword.value = this.textContent;
        CategoriesView.closeCategoriesMenu();
    }
}

/* Export as module for attractions rendering and categories menu for keyword in index.html */
export {
    attractions,
    page,
    keyword,
    src,
    isLoading,
    footer,
    pageEndObserver,
    searchIcon,
    searchKeyword,
    AttractionsModel,
    AttractionsView,
    AttractionsController,

    categories,
    categoriesMenu,
    outOfCategoriesMenu,
    CategoriesModel,
    CategoriesView,
    CategoriesController
};