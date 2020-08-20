exports.getDate =  function () {

    const today = new Date();   //standard object JS

    const options = {
        weekday : "long",
        day : "numeric",
        month: "long"
    };

    return today.toLocaleDateString("en-US", options);

    


}


exports.getDay = function() {

    const today = new Date();   //standard object JS

    const options = {
        weekday : "long",        
    };

    return today.toLocaleDateString("en-US", options);


}

