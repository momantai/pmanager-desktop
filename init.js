var spa = null;
(function () {
     document.onreadystatechange = function () {
          if (document.readyState == "complete") {
               var sauna = require("./js/sauna");
               spa = sauna(document.getElementById("contentapp"));
               spa.n.navigate("home");
          }
     }; 
})();