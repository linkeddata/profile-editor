var isInteger = function(a) {
    return ((typeof a !== 'number') || (a % 1 !== 0)) ? false : true;
};

stripSchema = function (url) {
    url = url.split('://');
    var schema = (url[0].substring(0, 4) == 'http')?url[0]:'';
    var path = (url[1].length > 0)?url[1]:url[0];
    return url[0]+'/'+url[1];
};

dirname = function(path) {
    return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
};

basename = function(path) {
    if (path.substring(path.length - 1) == '/') {
      path = path.substring(0, path.length - 1);
    }

    var a = path.split('/');
    return a[a.length - 1];
};

function getParam(name) {
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if( results == null ) {
    return "";
  } else {
    return decodeURIComponent(results[1]);
  }
}

// unquote string (utility)
function unquote(value) {
  if (value.charAt(0) == '"' && value.charAt(value.length - 1) == '"') {
      return value.substring(1, value.length - 1);
  }
  return value;
}

function parseLinkHeader(header) {
  var linkexp = /<[^>]*>\s*(\s*;\s*[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*")))*(,|$)/g;
  var paramexp = /[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*"))/g;

  var matches = header.match(linkexp);
  var rels = {};
  for (var i = 0; i < matches.length; i++) {
    var split = matches[i].split('>');
    var href = split[0].substring(1);
    var ps = split[1];
    var link = {};
    link.href = href;
    var s = ps.match(paramexp);
    for (var j = 0; j < s.length; j++) {
      var p = s[j];
      var paramsplit = p.split('=');
      var name = paramsplit[0];
      link[name] = unquote(paramsplit[1]);
    }

    if (link.rel !== undefined) {
      rels[link.rel] = link;
    }
  }

  return rels;
}