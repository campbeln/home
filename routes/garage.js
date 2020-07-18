module.exports = function ($home) {
    let $router = $home.app.services.router(),
        sUrl = "http://" + $home.app.data.baseIP + "105"        //# 5C:CF:7F:D6:F4:88
    ;

    //#
    $router.get("/", (oRequest, oResponse) => {
        $home.io.net.get(sUrl + "/jc", function (bStatus, oAPIResponse) {
            let oData = oAPIResponse.json;

            //#
            oData.distCM = $home.type.int.mk(oData.dist);
            delete oData.dist;
            oData.door = (oData.door == 0 ? "closed" : "open");
            oData.vehicle = (oData.vehicle == 1 ? "present" : (oData.vehicle == 0 ? "none" : "unknown"));
            oData.readCount = $home.type.int.mk(oData.rcnt);
            delete oData.rcnt;
            oData.firmwareVer = oData.fwv;
            delete oData.fwv;
            //oData.name = oData.name;
            //oData.mac = oData.mac;
            oData.wifiChipID = oData.cid;
            delete oData.cid;
            oData.wifiSignalStrengthDb = $home.type.int.mk(oData.rssi);
            delete oData.rssi;
            //oData.temp = oData.temp;      //# H/T Sensor?
            //oData.humid = oData.humid;    //# H/T Sensor?

            oResponse.status(200).json(oData);
        });
    });


    //#
    $router.get("/door/:operation", (oRequest, oResponse) => {
        let bOperation = $home.type.bool.mk.fuzzy(
                oRequest.params.operation,
                false,
                $home.type.bool.mk.fuzzy.truthy.concat(['open', 'up']),
                $home.type.bool.mk.fuzzy.falsy.concat(['close', 'down'])
            ),
            oData = {
                running: false,
                operation: (bOperation ? "open" : "close")
            }
        ;

        //#
        $home.io.net.get(sUrl + "/cc?dkey=" + $home.app.data.secrets.garage.password + "&" + oData.operation + "=1", function (bStatus, oAPIResponse) {
            oData.response = oAPIResponse.json;
            oResponse.status(bStatus ? 200 : 400).json(oData);
        });
    });

    //#
    $router.get("/log", (oRequest, oResponse) => {
        $home.io.net.get(sUrl + "/jl", function (bStatus, oAPIResponse) {
            let oData = oAPIResponse.json;

            //#
            /*oData.distCM = $home.type.int.mk(oData.dist);
            delete oData.dist;
            oData.door = (oData.door == 0 ? "closed" : "open");
            oData.vehicle = (oData.vehicle == 1 ? "present" : (oData.vehicle == 0 ? "none" : "unknown"));
            oData.readCount = $home.type.int.mk(oData.rcnt);
            delete oData.rcnt;
            oData.firmwareVer = oData.fwv;
            delete oData.fwv;
            //oData.name = oData.name;
            //oData.mac = oData.mac;
            oData.wifiChipID = oData.cid;
            delete oData.cid;
            oData.wifiSignalStrengthDb = $home.type.int.mk(oData.rssi);
            delete oData.rssi;
            //oData.temp = oData.temp;      //# H/T Sensor?
            //oData.humid = oData.humid;    //# H/T Sensor?*/

            oResponse.status(200).json(oData);
        });
    });

    return $router;
};
