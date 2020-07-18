module.exports = function ($home, $httpServer) {
    let $router = $home.app.services.router();

    //# Setup the root/heartbeat route
    $router.get("/", (oRequest, oResponse) => {
        oResponse.status(200).json({
            message: "Hi 👋",
            time: new Date(),
            localTime: $home.type.date.format(new Date(), "YYYY-MM-DD HH:mm:ss")
        });
    }); //# "/"

    //# .use the various $routers in our $httpServer
    $httpServer.use("/", $router);
    $httpServer.use("/lights", require("./lights.js")($home));
    $httpServer.use("/garage", require("./garage.js")($home));
    $httpServer.use("/sprinklers", require("./sprinklers.js")($home));
    $httpServer.use("/vacuum", require("./vacuum.js")($home));
};
