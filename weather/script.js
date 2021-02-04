var api_url = "http://felixperron.ddns.net:5000"
var pass_count = 0;

//get the first five passes
$.ajax({
    url: api_url + "/get/pass?pass_count=5",
    type: "GET",
    dataType: "json"
}).done(function (response) {
    console.log(response);
})

$(document).ready(function () {

});