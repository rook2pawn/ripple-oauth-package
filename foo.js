var hyperglue = require('hyperglue');
var permissions = require('./lib/permissions')
var html = [
    '<div id="rows">',
    '<div class="row">',
    '<span class="name"></span>',
    '<span class="message"></span>',
    '</div>',
    '</div>'
].join('\n');

var list = permissions.list;
list = list.map(function(item) {
    return { '.name' : item, '.message' : 'Perform operation ' + item }
})

console.log(hyperglue(html, {
    '.row': list
}).outerHTML);
