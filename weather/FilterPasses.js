$(document).ready(function() {

    document.getElementById("close_popup").onclick = function() {
        HideFilterPopup()
    }

    window.onclick = function(event) {
        if (event.target == document.getElementById("filter_passes_popup")) {
            HideFilterPopup();
        }
    }
});

function ShowFilterPopup() {
    document.getElementById("filter_passes_popup").style.display = "block";
}

function HideFilterPopup() {
    document.getElementById("filter_passes_popup").style.display = "none";
}

function AddSatToFilter(e) {
    if (!filter.satellites.includes(e.options[e.selectedIndex].text)) {
        filter.satellites.push(e.options[e.selectedIndex].text)
        ShowSatsInFilter()
    }
}

function RemoveSatFromFilter(e) {
    var satName = e.parentNode.getElementsByTagName("span")[0].innerHTML;
    filter.satellites = filter.satellites.filter(e => e !== satName);
    e.parentNode.parentNode.removeChild(e.parentNode);
    ShowSatsInFilter()
}

function ShowSatsInFilter() {
    document.getElementById("sats_in_filter").innerHTML = "";
    filter.satellites.forEach(sat => {
        var clone = document.getElementById("filter_sat_template").cloneNode(true);
        clone.getElementsByTagName("span")[0].innerHTML = sat;
        document.getElementById("sats_in_filter").innerHTML += clone.innerHTML;
    })

}

function ApplyFilter() {
    document.getElementById("main_content").innerHTML = "";
    pass_count = 0;
    passes = []

    filter.before_date = document.getElementById("filter_before_date").valueAsNumber / 1000;
    filter.after_date = document.getElementById("filter_after_date").valueAsNumber / 1000;
    filter.min_elevation = document.getElementById("filter_min_elev").valueAsNumber;
    filter.max_elevation = document.getElementById("filter_max_elev").valueAsNumber;
    filter.min_sun_elevation = document.getElementById("filter_min_sun").valueAsNumber;
    filter.max_sun_elevation = document.getElementById("filter_max_sun").valueAsNumber;


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
    });

    HideFilterPopup();
}

//will return true if pass fits within filter, false if it doesnt
function Filter(path) {
    $.ajaxSetup({
        async: false
    });

    var value = null;

    $.getJSON(path, function(result) {
        if (
            (filter.satellites.length == 0 || filter.satellites.indexOf(result.satellite) != -1) &&
            !(document.getElementById("filter_before_date").valueAsNumber / 1000 <= result.aos) &&
            !(document.getElementById("filter_after_date").valueAsNumber / 1000 >= result.aos) &&
            !(document.getElementById("filter_min_elev").valueAsNumber >= result.max_elevation) &&
            !(document.getElementById("filter_max_elev").valueAsNumber <= result.max_elevation) &&
            !(document.getElementById("filter_min_sun").valueAsNumber >= result.sun_elev) &&
            !(document.getElementById("filter_max_sun").valueAsNumber <= result.sun_elev)
        ) {
            value = true;
        } else {
            value = false;
        }
    });

    while (value == null) {
        continue;
    }

    $.ajaxSetup({
        async: true
    });

    return value
}