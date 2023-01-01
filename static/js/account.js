import { UserController } from "./user.js";

let orderList = {};

const logOut = document.getElementById("log-out");

const accountUserName = document.getElementById("account-user-name");
const accountUserEmail = document.getElementById("account-user-email");

const orderHistory = document.getElementById("order-history");

const UserAccountModel = {
    get: function(){
       (async () => {
            try{
                const response = await fetch("/api/orders");
                const result = await response.json();
                UserAccountView.showOldOrders(result);
            }catch(err){
                console.log(err);
            }
       })(); 
    },

    getByNumber: function(orderNumber){
        (async () => {
            try{
                const response = await fetch("/api/order/" + orderNumber);
                const result = await response.json();
                UserAccountView.showOrderByNumber(result);
            }catch(err){
                console.log(err);
            }
       })();        
    }
}

const UserAccountView = {
    renderUserData: function(result){
        accountUserName.textContent = result.data.name;
        accountUserEmail.textContent = result.data.email;
    },

    showOldOrders: function(result){
        if(result.data === null){
            orderHistory.textContent = "目前沒有任何已預訂的行程";
        }else{
            let oldOrdersData = result.data;
            for(let i = 0; i < oldOrdersData.length; i++){
                let orderNumber = oldOrdersData[i].number;
                orderList[orderNumber] = i;
                UserAccountView.renderOldOrder(oldOrdersData[i]);
            }
        }
    },

    renderOldOrder: function(oldOrderData){
        let orderFragment = document.createDocumentFragment();

        let order = document.createElement("div");
        order.className = "order";
        order.setAttribute("order-number", oldOrderData.number);

        let orderInfo = document.createElement("div");
        orderInfo.className = "order__info";

        let orderNumber = document.createElement("div");
        orderNumber.className = "order-number";
        orderNumber.textContent = "#" + oldOrderData.number;

        /* Get creating date from order number */
        let orderCreateDate = document.createElement("div");
        orderCreateDate.textContent = oldOrderData.number.substring(0, 4) + "-" + oldOrderData.number.substring(4, 6) + "-" + oldOrderData.number.substring(6, 8);
        
        let orderStatus = document.createElement("div");
        if(oldOrderData.status === 1){
            orderStatus.style.color = "#448899";
            orderStatus.textContent = "已完成付款";
        }else{
            orderStatus.style.color = "#FF2400";
            orderStatus.textContent = "未完成付款";
        }
        
        let orderPrice = document.createElement("div");
        orderPrice.textContent = "新台幣 " + oldOrderData.price + " 元";

        let orderDetails = document.createElement("button");
        orderDetails.textContent = "訂單詳情";
        orderDetails.setAttribute("order-number", oldOrderData.number);
        orderDetails.addEventListener("click", UserAccountController.showOrderDetails);

        orderInfo.append(orderNumber, orderCreateDate, orderStatus, orderPrice, orderDetails);

        order.appendChild(orderInfo);
        orderFragment.appendChild(order);

        orderHistory.appendChild(orderFragment);
    },

    showOrderByNumber: function(result){
        if(result.error !== true){
            /* Create element for rendering order details */
            let orderDetails = document.createElement("div");
            orderDetails.className = "order__details";

            let orderTripsData = result.data.trip;
            for(let i = 0; i < orderTripsData.length; i++){
                let orderTrip = UserAccountView.renderOrderTrip(orderTripsData[i]);
                orderDetails.appendChild(orderTrip);
            }

            /* Get target order by order number */
            let orderIndex = orderList[result.data.number];
            let targetOrder = document.getElementsByClassName("order")[orderIndex];
            targetOrder.appendChild(orderDetails);
        }
    },

    renderOrderTrip: function(orderTripData){
        /* Create DocumentFragment for each booking rendering */
        let orderTripFragment = document.createDocumentFragment();
        
        /* Create trip */
        let trip = document.createElement("div");
        trip.className = "trip";
        
        /* Create booking content */
        let content = document.createElement("div");
        content.className = "content";

        /* Add attraction image into content */
        let image = document.createElement("div");
        image.className = "image";
        let attractionImage = document.createElement("img");
        attractionImage.setAttribute("src", orderTripData.attraction.image);
        attractionImage.className = "attraction-img";
        image.appendChild(attractionImage);

        /* Add attraction info into content */
        let info = document.createElement("div");
        info.className = "info";

        let name = document.createElement("div");
        name.className = "attraction-name";
        name.textContent = "台北一日遊：" + orderTripData.attraction.name;

        let date = document.createElement("div");
        let dateTitle = document.createElement("span");
        dateTitle.className = "sub-title";
        dateTitle.textContent = "日期：";
        date.appendChild(dateTitle);
        date.append(orderTripData.date);

        let time = document.createElement("div");
        let timeTitle = document.createElement("span");
        timeTitle.className = "sub-title";
        timeTitle.textContent = "時間：";
        time.appendChild(timeTitle);
        if(orderTripData.time === "morning"){
            time.append("上午 9 點至下午 2 點");
        }else{
            time.append("下午 2 點至晚上 7 點");
        }

        let price = document.createElement("div");
        let priceTitle = document.createElement("span");
        priceTitle.className = "sub-title";
        priceTitle.textContent = "費用：";
        price.appendChild(priceTitle);
        price.append("新台幣 ", orderTripData.price, " 元");

        let address = document.createElement("div");
        let addressTitle = document.createElement("span");
        addressTitle.className = "sub-title";
        addressTitle.textContent = "地點：";
        address.appendChild(addressTitle);
        address.append(orderTripData.attraction.address);

        /* Add all attraction infos into info and append to content with image */
        info.append(name, date, time, price, address);
        content.append(image, info);

        /* Create hr */
        let hr = document.createElement("hr");
        hr.className = "hr-solid";

        trip.append(content, hr);
        orderTripFragment.appendChild(trip);

        return orderTripFragment;
    }
}

const UserAccountController = {
    init: function(result){
        if(result.data === null){
            window.location.href = "/";
        }else{
            logOut.addEventListener("click", UserController.logOut);
            UserAccountView.renderUserData(result);
            UserAccountModel.get();
        }
    },

    showOrderDetails: function(){
        let orderNumber = this.getAttribute("order-number");
        this.setAttribute("disabled", "disabled");
        UserAccountModel.getByNumber(orderNumber);

        /* Remove showOrderDetails event */
        this.removeEventListener("click", UserAccountController.showOrderDetails);
        this.addEventListener("click", UserAccountView.closeOrderDetails);
    }
}

export {
    orderList,
    logOut,
    accountUserName,
    accountUserEmail,
    orderHistory,

    UserAccountModel,
    UserAccountView,
    UserAccountController
};