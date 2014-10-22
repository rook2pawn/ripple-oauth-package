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

var decodeJwt = function (token) {
    var base64urlDecode = function(str) {
      return new Buffer(base64urlUnescape(str), 'base64').toString();
    };

    var base64urlUnescape = function(str) {
      str += Array(5 - str.length % 4).join('=');
      return str.replace(/\-/g, '+').replace(/_/g, '/');
    }
    var segments = token.split('.');

    if (segments.length !== 3) {
      throw new Error('Not enough or too many segments');
    }

    // All segment should be base64
    var headerSeg = segments[0];
    var payloadSeg = segments[1];
    var signatureSeg = segments[2];

    // base64 decode and parse JSON
    var header = JSON.parse(base64urlDecode(headerSeg));
    var payload = JSON.parse(base64urlDecode(payloadSeg));
    return {
      header: header,
      payload: payload,
      signature: signatureSeg
    }
}

// check blobvault lib/signer.js for encoding

//var encodeJwt = 
var generateJwt = function() {
    return { 
        header: 
        { alg: 'RS256',
        kid: '7a9512f62ab19c790fb540b8a0533f59372f251c' },
        payload: 
        { iss: 'accounts.google.com',
        sub: '100841815741670953619',
        azp: '841077041629.apps.googleusercontent.com',
        at_hash: '_cfLGEyiU3U6hdG4e2rSMQ',
        aud: '841077041629.apps.googleusercontent.com',
        c_hash: 'WC7i8-lsGSEmaDijWx9IUA',
        iat: 1413928928,
        exp: 1413932828 },
        signature: 'BZ57t4wy67OdzUsyewdxH_Q_qLmStYnWz7f1d9mn6K95haJ3HoFErdxjGpaHWu0aZhkyks_l_gA4SgB5fuv51ASzivgjqOO24lo2e4U-hraCyFTYpw67B4xZs0-eNXQhPrHbvfhfC0tX98T1hr7fx8jfV4dpfSJvvXB1hmFwmAM' 
    }
}

exports.atob = atob;
exports.btoa = btoa;
exports.decodeJwt = decodeJwt;
