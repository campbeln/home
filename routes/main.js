module.exports = function ($home) {
    let $router = $home.app.services.router();

    //#
    $router.get("/", (oRequest, oResponse) => {
        oResponse.status(200).send("Hi 👋");
    });

    return $router;
};
