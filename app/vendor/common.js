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

// notifications
(function($){
  var config = window.NotifierjsConfig = {
    defaultTimeOut: 5000,
    position: "top",
    notificationStyles: {
      padding: "12px",
      margin: "0 0 6px 0",
      backgroundColor: "#fff",
      opacity: 1,
      color: "#000",
      boxShadow: "#999 0 0 12px",
      width: "100%",
      height: "50px"
    },
    notificationStylesHover: {
      opacity: 1,
      boxShadow: "#000 0 0 12px"
    },
    container: $("<div></div>")
  };

  $(function() {
    config.container.css("position", "fixed");
    config.container.css("z-index", 9999);
    config.container.css(config.position, "0");
    config.container.css("width", "100%");
    config.container.appendTo(document.body);
  });

  function getNotificationElement() {
    return $("<div>").css(config.notificationStyles).bind('hover', function() {
      $(this).css(config.notificationStylesHover);
    }, function() {
      $(this).css(config.notificationStyles);
    });
  }

  var Notifier = window.Notifier = {};

  Notifier.notify = function(message, title, iconUrl, txtcolor, bgcolor, timeOut) {
    var notificationElement = getNotificationElement();
    notificationElement.addClass('valign-wrapper center');

    if (bgcolor) {
      notificationElement.css("background-color", bgcolor);
    }

    timeOut = timeOut || config.defaultTimeOut;

    if (iconUrl) {
      var iconElement = $("<i>");
      iconElement.attr('class', iconUrl);
      if (txtcolor) {
        iconElement.addClass(txtcolor);  
      }
      iconElement.addClass('small');
      iconElement.addClass('valign');
      iconElement.css("display", "inline-block!important");
      notificationElement.append(iconElement);
    }

    var textElement = $("<div/>").css({
      padding: '0 12px'
    }).addClass('valign');

    if (title) {
      var titleElement = $("<div/>");
      titleElement.append(document.createTextNode(title));
      titleElement.css("font-weight", "bold");
      titleElement.addClass('valign');
      textElement.append(titleElement);
    }

    if (message) {
      var messageElement = $("<div/>");
      messageElement.addClass("truncate");
      if (txtcolor) {
        messageElement.addClass(txtcolor);
      }
      messageElement.css("display", "inline-block!important");
      messageElement.append(document.createTextNode(message));
      textElement.append(messageElement);
    }

    setTimeout(function() {
      notificationElement.animate({ opacity: 0 }, 400, function(){
        notificationElement.remove();
      });
    }, timeOut);

    notificationElement.bind("click", function() {
      notificationElement.hide();
    });

    notificationElement.append(textElement);
    config.container.prepend(notificationElement);
  };

  Notifier.info = function(message, title) {
    Notifier.notify(message, title, 'mdi-action-info-outline blue-text');
  };
  Notifier.warning = function(message, title) {
    Notifier.notify(message, title, 'mdi-alert-warning', 'white-text', '#fb8c00');
  };
  Notifier.error = function(message, title) {
    Notifier.notify(message, title, 'mdi-action-highlight-remove', 'white-text', '#e53935', 10000);
  };
  Notifier.success = function(message, title) {
    Notifier.notify(message, title, 'mdi-action-done', 'black-text', '#69f0ae');
  };

}(jQuery));