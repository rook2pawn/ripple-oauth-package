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
    console.log("Ready!")
    $('input#modify').click(function() {
        console.log("CLICK!")
        var href = $('a#authlink').attr('href')
        href = href.replace('CLIENT_ID',$('input#client_id').val())
        href = href.replace('REDIRECT_URI',$('input#redirect_uri').val())
        console.log(href)
        $('a#authlink').attr('href',href)
    })
})
