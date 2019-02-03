var spa = null;
(function () {
     document.onreadystatechange = function () {
          if (document.readyState == "complete") {
               sauna = require('./module/sauna.js')
               spa = sauna(document.getElementById("contentapp"));
               spa.n.navigate("kproject");
          }
     };
})();