//# https://rainmachine.docs.apiary.io/#reference/
//# api.openweathermap.org
//# api.weather.gov
module.exports = function ($home) {
    let sAccessToken,
        $router = $home.app.services.router(),
        sBaseUrl = "http://" + $home.app.data.baseIP + "102:8081",
        eZones = {
            backyard: 0,
            backyard_drip: 1,
            front_sidewalk: 2,
            front_yard: 3,
            front_side_yard: 4,
            front_yard_drip: 5
        }
    ;

    //#
    $home.io.net.post(
        sBaseUrl + "/api/4/auth/login",
        { "pwd": $home.app.data.secrets.sprinklers.password, "remember": true },
        function (bStatus, oAPIResponse) {
            //oResponse.status(200).json(oAPIResponse.json);
            //console.log(bStatus, oAPIResponse.json.access_token);
            sAccessToken = $home.resolve(oAPIResponse.json, "access_token");
        }
        // /auth/check
    );


    //#
    $router.get("/", (oRequest, oResponse) => {
        /*let $nonStrictSSLRequest = require('request').defaults({strictSSL: false});
        $nonStrictSSLRequest(
            { url: "https://192.168.77.202:8080/api/apiVer" },
            function (err, oAPIResponse, sBody) {
                oResponse.status(200).json(JSON.parse(sBody));
            }
        );*/

        $home.io.net.get(sBaseUrl + "/api/apiVer", function (bStatus, oAPIResponse) {
            oResponse.status(200).json(oAPIResponse.json);
        });
    });


    //#
    $router.get("/start/:zone/:minutes", (oRequest, oResponse) => {
        let iZone = $home.type.int.mk(oRequest.params.zone, -1),
            iMinutes = $home.type.int.mk(oRequest.params.minutes, 5)
        ;

        //#
        iMinutes = (iMinutes > 20 || iMinutes < 1 ? 5 : iMinutes);

        //#
        switch (iZone) {
            case eZones.backyard:
            case eZones.backyard_drip:
            case eZones.front_sidewalk:
            case eZones.front_yard:
            case eZones.front_side_yard:
            case eZones.front_yard_drip: {
                $home.io.net.post(sBaseUrl + "/api/4/zone/" + iZone + "/start?access_token=" + sAccessToken, undefined, function (bStatus, oAPIResponse) {
                    oResponse.status(bStatus ? 200 : 400).json({ success: bStatus, response: oAPIResponse.json });
                });
                break;
            }
            default: {
                oResponse.status(404).json({ success: false });
                break;
            }
        }
    });


    //#
    $router.get("/stop/:zone", (oRequest, oResponse) => {
        let iZone = $home.type.int.mk(oRequest.params.zone, -1);

        //#
        switch (iZone) {
            case eZones.backyard:
            case eZones.backyard_drip:
            case eZones.front_sidewalk:
            case eZones.front_yard:
            case eZones.front_side_yard:
            case eZones.front_yard_drip: {
                $home.io.net.post(sBaseUrl + "/api/4/zone/" + iZone + "/stop?access_token=" + sAccessToken, undefined, function (bStatus, oAPIResponse) {
                    oResponse.status(bStatus ? 200 : 400).json({ success: bStatus, response: oAPIResponse.json });
                });
                break;
            }
            default: {
                $home.io.net.post(sBaseUrl + "/api/4/watering/stopall?access_token=" + sAccessToken, undefined, function (bStatus, oAPIResponse) {
                    oResponse.status(bStatus ? 200 : 400).json({ success: bStatus, response: oAPIResponse.json });
                });
                break;
            }
        }
    });


    //#
    $router.get("/all", (oRequest, oResponse) => {
        $home.io.net.get(sBaseUrl + "/api/4/zone?access_token=" + sAccessToken, function (bStatus, oAPIResponse) {
            oResponse.status(bStatus ? 200 : 400).json({ success: bStatus, response: oAPIResponse.json });
        });
    });


    //#
    $router.get("/stats", (oRequest, oResponse) => {
        $home.io.net.get(sBaseUrl + "/api/4/dailystats?access_token=" + sAccessToken, function (bStatus, oAPIResponse) {
            oResponse.status(200).json(oAPIResponse.json);
        });
    });


    return $router;
};
