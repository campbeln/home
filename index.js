//# npm install --save express
//# npm install --save xmlhttprequest

//# npm install --save tplink-smarthome-api
//# https://github.com/plasticrake/tplink-smarthome-api

//# sudo apt-get update
//# sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
//# echo sudo npm install --save canvas --unsafe-perm=true
//# npm install --save ecovacs-deebot
//# https://github.com/mrbungle64/ecovacs-deebot.js

const $express = require("express");
const $httpServer = $express();

//const $cors = require("cors");
const $bodyParser = require("body-parser");
const $home = require("./home/_require.js")($express);

//# .use the .require's in our $httpServer
$httpServer.use($bodyParser.json({ type: "*/*", inflate: true })); //# Support json encoded HTTP bodies
$httpServer.use($bodyParser.urlencoded({ extended: true })); //# Support encoded HTTP bodies
//$httpServer.use("/", require("./middleware/logger.js")($home));      //# Log every request

//# Spin up the $httpServer, barfing out the versions to the console as we go
$httpServer.listen(3501, "127.0.0.1", () => {
    console.log("##############################");
    console.log("# home_api on :" + 3501);
    console.log(
        "# started @ " +
            $home.type.date.format(Date.now(), "YYYY/MM/DD hh:mm:ss")
    );
    console.log("#");
    console.log("# ishJS v" + $home.config.ish().ver);
    console.log("# $home.app v" + $home.app.ver);
    console.log("##############################");
});

//# Middleware
// $httpServer.use("/v2", require("./middleware/auth.js")($home));
// $httpServer.use(require("./middleware/audit.js")($home));

//# Routes
require("./routes/_routes.js")($home, $httpServer);
