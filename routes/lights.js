const $kasa = require('tplink-smarthome-api').Client;

//#
module.exports = function ($home) {
    let $router = $home.app.services.router(),
        enumIPs = {
            frontdoor: $home.app.data.baseIP + "10",        //# B0:95:75:0D:18:3D - Switch - Front Door Chandelier
            porch: $home.app.data.baseIP + "11",            //# B0:95:75:0D:19:38 - Switch - Porch Lights
            kitchen: $home.app.data.baseIP + "12",          //# 68:FF:7B:CC:CF:A7 - Switch3 - Kitchen

            upstairs: $home.app.data.baseIP + "20",         //# 98:DA:C4:C8:47:B1 - Switch3 - Upstairs Hallway Switch

            livingroom: $home.app.data.baseIP + "30",       //# 1C:3B:F3:22:A8:46 - Plug - Living Room Lamp
            frontroom: $home.app.data.baseIP + "31",        //# 1C:3B:F3:23:27:AA - Plug - Front Room Lamp
            plug3: $home.app.data.baseIP + "32",            //# 1C:3B:F3:23:11:BF - Plug - 3
            plug4: $home.app.data.baseIP + "33",            //# 1C:3B:F3:23:11:A7 - Plug - 4
            xmas: $home.app.data.baseIP + "50"              //# B0:95:75:0D:18:4A - Switch - XMas Light Switch
        }
    ;

    //#
    $home.app.services.lights = {
        kasa: new $kasa()
    };


    //# Traverse the enumIPs, using the keys as the base path for the API
    Object.keys(enumIPs).forEach(function (sKey) {
        //#
        $router.get("/" + sKey + "/:operation", (oRequest, oResponse) => {
            //let oQueryString = $home.io.web.queryString.parse(oRequest.url);
            let bOperation = $home.type.bool.mk.fuzzy(oRequest.params.operation, false),
                oData = {
                    operation: (bOperation ? "on" : "off"),
                    status: bOperation
                }
            ;

            $home.app.services.lights.kasa.getDevice({host: enumIPs[sKey]}).then(($device)=>{
                $device.setPowerState(bOperation);
                //$device.togglePowerState();
                $device.getSysInfo().then((oAPIResponse) => {
                    oData.response = oAPIResponse;
                    oResponse.status(200).json(oData);
                });
            });
        });
    });


    //#
    $router.get("/", (oRequest, oResponse) => {
        // Look for devices, log to console, and turn them on
        $home.app.services.lights.kasa.startDiscovery().on('device-new', ($device) => {
            $device.getSysInfo().then((oData) => {
                oResponse.status(200).json(oData);
            });
        });
    });


    return $router;
};
