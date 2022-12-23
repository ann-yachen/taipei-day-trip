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
        beginIndex: 6,
        endIndex: 11
    }
})


// call TPDirect.card.getPrime when user submit form to get tappay prime
// $('form').on('submit', onSubmit)
function onSubmit(event) {
    event.preventDefault();

    // Get TapPay Fields status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();

    // Check can getPrime
    if(tappayStatus.canGetPrime === false){
        alert('can not get prime');
        return
    }

    // Get prime
    TPDirect.card.getPrime((result) => {
        if(result.status !== 0){
            alert("get prime error " + result.msg)
            return
        }
        alert('get prime success, prime: ' + result.card.prime)
    })
}

const paymentButton = document.getElementById("payment-btn");
paymentButton.addEventListener("click", onSubmit);