module.exports = function ($express) {
    //# .require ishJS + extensions
    //#     TODO: NPM-ify ishJS to require("@ish"), require("@ish/io.net"), etc.?
    const $ish = require("./ish/ish.js");
    require("./ish/ish.oop.inherit.js")($ish);
    require("./ish/ish.oop.overload.js")($ish);
    require("./ish/ish.type-ex.js")($ish);
    require("./ish/ish.type.enum.js")($ish);
    require("./ish/ish.type.date-format.js")($ish);
    require("./ish/ish.io.net.js")($ish);
    require("./ish/ish.io.web.js")($ish);
    require("./ish/ish.io.csv.js")($ish);

    //# Setup $ish.app and our .config
    require("./app.js")($ish, $express);
    require("./config/secrets.js")($ish, $express);

    // $ish.app.config = $ish.extend(
    //     $ish.app.config,
    //     require($ish.app.config.args[0] || "../config/prod.js")
    // );

    //# Now that $ish.app is setup, .require the remaining .app logic
    //require("./app.config.js")($ish);
    //require("./app.clients.walmart.js")($ish);

    return $ish;
};
