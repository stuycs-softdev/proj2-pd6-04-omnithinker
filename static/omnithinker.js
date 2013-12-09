var URL = "ws://" + location.hostname + ":" + location.port + "/socket";
var socket;

var docid;
var title;
var omnitoolbar;
var textbox;

var timeout_id = 0;
var last_text_hash = "";
var box_id = 0;

function get_keywords() {
    var keywords = [];
    textbox.find(".keyword").each(function() {
        if ($(this).text())
            keywords.push($(this).text());
    });
    return keywords;
}

function update_server() {
    keywords = get_keywords(textbox);
    var data = {"title": title.val(), "text": textbox.html(), "keywords": keywords};
    socket.send("UPDATE " + JSON.stringify(data));
    $("#tb-status").trigger("saved");
}

function gen_hash(s) {
    // http://stackoverflow.com/questions/7616461
    return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
}

function on_type() {
    var this_hash = gen_hash(title.val() + "|separator|" + textbox.html());
    if (this_hash != last_text_hash) {
        last_text_hash = this_hash;
        window.clearTimeout(timeout_id);
        timeout_id = window.setTimeout(update_server, 500, textbox);
        $("#tb-status").trigger("saving");
    }
}

function process_update(payload) {
    box_id++;
    topic = payload["Keyword"];
    data = "";
    definition = payload["Definition"];
    if (definition !== undefined) {
        data += "<p class='topic-definition'>" + definition + "</p>";
    }
    data += "<ul>";
    google = payload["GoogleArticles"];
    if (google !== undefined) {
        for (var i = 0; i < google["Links"].length; i++)
            data += '<li><a href="' + google["Links"][i] + '">' + google["Headline"][i] + "</a>: " + google["Blurbs"][i] + "</li>";
    }
    youtube = payload["Youtube"];
    if (youtube !== undefined) {
        for(var i = 0; i < youtube["Title"].length; i++) {
            if(youtube["Title"][i] == "") break;
            data += '<li><a href="' + youtube["Link"][i] + '">' + youtube["Title"][i] + "</a></li>";
        }
    }
    hsw = payload["HSWArticles"];
    if (hsw !== undefined) {
        for (var i = 0; i < hsw["Links"].length; i++) {
            if (hsw["Links"][i] != null)
                data += '<li><a href="' + hsw["Links"][i] + '">' + hsw["Headline"][i] + "</a>: " + hsw["Blurbs"][i] + "</li>";
        }
    }
    images = payload["Images"];
    nytimes = payload["NyTimesArticles"];
    if (nytimes !== undefined) {
        for (var i = 0; i < nytimes["Links"].length; i++) {
            if (nytimes["Links"][i] != null)
                data += '<li><a href="' + nytimes["Links"][i] + '">' + nytimes["Headline"][i] + "</a>: " + nytimes["Blurbs"][i] + "</li>";
        }
    }
    data += "</ul>"
    box = '<div id="topic-box-' + box_id + '" class="topic">';
    box += '<div id="topic-title-' + box_id + '" class="topic-title">' + topic + ' <a href="javascript:void(0);" class="topic-box-remove" id="topic-box-remove-' + box_id + '">&#10006;</a></div>';
    box += '<div id="topic-body-' + box_id + '" class="topic-body">' + data + "</div></div>";
    omnitoolbar.append(box);
    set_box_listeners(box_id);
}

function set_box_listeners(box_id) {
    var expanded_topics = 0;
    $(".topic-body").each(function() {
        if ($(this).is(":visible"))
            expanded_topics++;
    });
    if (expanded_topics > 3)
        $("#topic-body-" + box_id).hide();
    $("#topic-box-" + box_id).hide().slideDown(200);

    $("#topic-box-remove-" + box_id).click(function(b_id) {
        return function() {
            $("#topic-title-" + b_id).off("click");
            $("#topic-box-" + b_id).slideUp(200, function() { $(this).remove(); });
        }
    }(box_id));
    $("#topic-title-" + box_id).click(function(b_id) {
        return function() {
            var body = $("#topic-body-" + b_id);
            if (body.is(":visible"))
                $("#topic-body-" + b_id).slideUp(200);
            else
                $("#topic-body-" + b_id).slideDown(200);
        }
    }(box_id));
}

$(document).ready(function() {
    $("#textbox").rte("/static/common.css");
    title = $("#title");
    omnitoolbar = $("#omnitoolbar");
    socket = new WebSocket(URL);

    socket.onopen = function(event) {
        socket.send("HELLO " + docid);
    };

    socket.onmessage = function(evt) {
        if (evt.data.indexOf("READY") == 0) {
            var payload = JSON.parse(evt.data.substring(6));
            title.val(payload.title);
            textbox.html(payload.text);
            $("#tb-status").trigger("saved");
        }
        else if (evt.data.indexOf("UPDATE") == 0) {
            var payload = JSON.parse(evt.data.substring(7));
            process_update(payload);
        }
        else if (evt.data.indexOf("INVALID") == 0) {
            var payload = evt.data.substring(8);
            textbox.html('<div class="writer-error-box">' + payload + "</div>" + textbox.html());
            textbox.parent().parent()[0].designMode = "off";
            title.attr("disabled", "disabled");
            $("#tb-status").trigger("error");
            socket.close();
        }
        else if (evt.data == "GOODBYE") {
            socket.close();
        }
    };

    title.on("input", on_type);

    $("#tb-status").bind("saving", function() {
        $(this).removeClass("fa-exclamation-circle fa-check-circle").addClass("fa-spinner");
        $("#tb-status-text").text("Writing");
    });
    $("#tb-status").bind("saved", function() {
        $(this).removeClass("fa-exclamation-circle fa-spinner").addClass("fa-check-circle");
        $("#tb-status-text").text("Saved");
    });
    $("#tb-status").bind("error", function() {
        $(this).removeClass("fa-check-circle fa-spinner").addClass("fa-exclamation-circle");
        $("#tb-status-text").text("Error");
    });
});
