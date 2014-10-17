var atob = function (str) {
    return new Buffer(str, 'base64').toString('binary');
}
var btoa = function(str) {
    var buffer;
    if (str instanceof Buffer) {
      buffer = str;
    } else {
      buffer = new Buffer(str.toString(), 'binary');
    }
    return buffer.toString('base64');
}
var qs = require('querystring')

$(window).ready(function() {
    $('#grantpassword').click(function() {
        // oauth static URL bounce
        var url = window.location.protocol + '//' + window.location.hostname + ':3000/
        window.location.replace(url)
    });
/*
    $('#mybutton').click(function() {
        var basic = "Basic " + 'thom:nightworld'
        var b64_basic = btoa(basic)
        var data = {
            grant_type:'password',
            username:'thom',
            password:'nightworld'
        }
        var success = function(data) {
            console.log("Sucess data:", data)
        }
        var url = window.location.protocol + '//' + window.location.hostname + ':3000/oauth/token';
        console.log(window.location)
        $.ajax({
            type: "POST",
            url: url,
            data: qs.stringify(data),
            success: success,
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Basic "+b64_basic);
            }
        });
    })
*/
})
