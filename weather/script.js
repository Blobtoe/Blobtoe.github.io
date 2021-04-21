
var pass_count = 0;
var passes = [];
var filter = {
    satellites: [],
    before_date: null,
    after_date: null,
    min_elevation: null,
    max_elevation: null,
    min_sun_elevation: null,
    max_sun_elevation: null
};

//get the first five passes
$.ajax({
    url: "/api/weather/get/pass?pass_count=5"
    + (filter.satellites.length == 0 ? "" : "&satellites=" + filter.satellites.join(",")) 
    + (!filter.before_date ? "" : "&before=" + filter.satellites.join(","))
    + (!filter.after_date ? "" : "&after=" + filter.after_date.join(","))
    + (!filter.min_elevation ? "" : "&min_elevation=" + filter.min_elevation.join(","))
    + (!filter.max_elevation ? "" : "&max_elevation=" + filter.max_elevation.join(","))
    + (!filter.min_sun_elevation ? "" : "&min_sun_elevation=" + filter.min_sun_elevation.join(","))
    + (!filter.max_sun_elevation ? "" : "&max_sun_elevation=" + filter.max_sun_elevation.join(",")),
    type: "GET",
    dataType: "json"
}).done(function (response) {
    response.forEach(pass => {
        passes.push(pass);
        ShowPass(pass);
    });

    //show everything once everything is loaded
    document.getElementById("loading").style.display = "none";
    document.getElementById("next_pass").style.display = "block";
    document.getElementsByClassName("seperator")[0].style.display = "block";
    document.getElementById("main_content").style.display = "block";
    document.getElementById("footer_div").style.display = "block";

    //show the next pass when the user scrolls down enough
    $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() == $(document).height()) {
            pass_count++;
            $.ajax({
                url: "/api/weather/get/pass?pass_count=5&before=" + passes[passes.length-1].aos
                + (filter.satellites.length == 0 ? "" : "&satellites=" + filter.satellites.join(",")) 
                + (!filter.after_date ? "" : "&after=" + filter.after_date.join(","))
                + (!filter.min_elevation ? "" : "&min_elevation=" + filter.min_elevation.join(","))
                + (!filter.max_elevation ? "" : "&max_elevation=" + filter.max_elevation.join(","))
                + (!filter.min_sun_elevation ? "" : "&min_sun_elevation=" + filter.min_sun_elevation.join(","))
                + (!filter.max_sun_elevation ? "" : "&max_sun_elevation=" + filter.max_sun_elevation.join(",")),
                type: "GET",
                dataType: "json"
            }).done(function (response) {
                response.forEach(pass => {
                    passes.push(pass);
                    ShowPass(pass);     
                });
            })
        }

        //show the back to top button when use scrolls down 2000 pixels
        if ($(this).scrollTop() >= 2000) {
            document.getElementById("top_button").style.display = "block";
        } else {
            document.getElementById("top_button").style.display = "none"
        }
    })
});

//get next pass info, then display it
$.ajax({
    url: "/api/weather/get/next/pass",
    type: "GET",
    dataType: "json"
}).done(function (response) {
    ShowNextPassInfo(response[0]);
});

function DateToString(date) {
    //reformat the date into a nice string
    const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: '2-digit', hour: "numeric", minute: "2-digit", second: "2-digit", timeZoneName: "short"}) 
    const [{ value: month },,{ value: day },,{ value: year },,{value: hour},,{value: minute},,{value: second},,{value: dayPeriod},,{value: timeZoneName}] = dateTimeFormat.formatToParts(date)
    dateString = `${month} ${day}, ${year} at ${hour}:${minute}:${second} ${dayPeriod} ${timeZoneName}`
    return dateString
}

function ScrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

//toggle the visibility of the next pass info
function ToggleNextPassInfo () {
    var button = document.getElementById("next_pass_more_info_button");
    var info = document.getElementById("next_pass_info");
    if (button.value == "More Info") {
        button.value = "Less Info";
        info.style.display = "block"
    } else {
        button.value = "More Info";
        info.style.display = "none"
    }
}

//copied from stack overflow or something lol
function CountDownTimer(dt, id)
{
    var end = new Date(dt).toLocaleString("en-US", {timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone});
    end = new Date(end);

    var _second = 1000;
    var _minute = _second * 60;
    var _hour = _minute * 60;
    var _day = _hour * 24;
    var timer;

    function showRemaining() {
        var now = new Date();
        var distance = end - now;
        if (distance < 0) {

            clearInterval(timer);
            document.getElementById(id).innerHTML = 'Recording Pass...';
            return;
        }
        var days = Math.floor(distance / _day);
        var hours = Math.floor((distance % _day) / _hour);
        var minutes = Math.floor((distance % _hour) / _minute);
        var seconds = Math.floor((distance % _minute) / _second);

        document.getElementById(id).innerHTML = " Next pass in about " + days + ' days ';
        document.getElementById(id).innerHTML += hours + ' hrs ';
        document.getElementById(id).innerHTML += minutes + ' mins ';
        document.getElementById(id).innerHTML += seconds + ' secs';
    }

    timer = setInterval(showRemaining, 1000);
}

function ShowNextPassInfo(json) {
    //next pass info

    //start the countdown to the start of the next pass
    var date = new Date(0).setUTCSeconds(json.aos)

    CountDownTimer(date, 'countdown')
    //fill in info about the next pass
    document.getElementById("next_pass_sat").innerHTML = "Satellite: " + json.satellite;
    document.getElementById("next_pass_max_elev").innerHTML = "Max Elevation: " + json.max_elevation + "°";
    document.getElementById("next_pass_tca_azimuth").innerHTML = "TCA Azimuth: " + json.azimuth_tca;
    document.getElementById("next_pass_frequency").innerHTML = "Frequency: " + json.frequency + " Hz";
    document.getElementById("next_pass_aos").innerHTML = "AOS: " + DateToString(date);
    document.getElementById("next_pass_los").innerHTML = "LOS: " + DateToString(new Date(0).setUTCSeconds(json.los));
    return false;
}