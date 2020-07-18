module.exports = function ($home) {
    "use strict";

    let $rosie,
        $router = $home.app.services.router()
    ;

    const $vacuumSdk = require('ecovacs-deebot'),
        $vacuumApi = $vacuumSdk.EcoVacsAPI,
        //VacBot = $vacuum.VacBot,
        oConfig = {
            username: $home.app.data.secrets.vacuum.username,
            password: $vacuumApi.md5($home.app.data.secrets.vacuum.password),
            machineId: $vacuumApi.md5(require('node-machine-id').machineIdSync()),
            country: $home.app.data.secrets.vacuum.country.toLowerCase(),
            continent: $home.app.data.secrets.vacuum.continent.toLowerCase(),
            connected: undefined,
            status: undefined
        },
        $vacuums = new $vacuumApi(oConfig.machineId, oConfig.country, oConfig.continent);
    ;

    //#
    $vacuums.connect($home.app.data.secrets.vacuum.username, $vacuumApi.md5($home.app.data.secrets.vacuum.password))
        .then(() => {
            $vacuums.devices()
                .then((a_oDevices) => {
                    $rosie = $vacuums.getVacBot($vacuums.uid, $vacuumApi.REALM, $vacuums.resource, $vacuums.user_access_token, a_oDevices[0], oConfig.continent);
                    $rosie.on("ready", (/* oEvent */) => {
                        oConfig.connected = true;
                    });
                    $rosie.connect_and_wait_until_ready();
                })
            ;
        })
        .catch((e) => {
            oConfig.connected = false;
            console.error("$home.app.services.vacuum: Failure connecting to $rosie!");
        })
    ; //# $vacuums.connect


	//#
	$router.get("/", (oRequest, oResponse) => {
        oResponse.json({
            connected: oConfig.connected,
            status: oConfig.status
        });
    });

	//#
	$router.get("/clean", (oRequest, oResponse) => {
        //#
        if (oConfig.connected) {
            oConfig.status = "cleaning";

            $rosie.run("Clean");
            oResponse.json({
                connected: oConfig.connected,
                status: oConfig.status
            });
        }
        //#
        else {
            oResponse.json({
                connected: oConfig.connected
            });
        }
    });

	//#
	$router.get("/stop", (oRequest, oResponse) => {
        //#
        if (oConfig.connected) {
            oConfig.status = "charging";

            $rosie.run("Stop");
            $rosie.run("Charge");
            oResponse.json({
                connected: oConfig.connected,
                status: oConfig.status
            });
        }
        //#
        else {
            oResponse.json({
                connected: oConfig.connected
            });
        }
    });

	//#
	$router.get("/battery", (oRequest, oResponse) => {
        //#
        if (oConfig.connected) {
            $rosie.run("BatteryState");
            $rosie.on("BatteryInfo", (fBattery) => {
                oResponse.json({
                    batteryPercent: Math.round(fBattery),
                    status: oConfig.status
                });
            });
        }
        //#
        else {
            oResponse.json({
                connected: oConfig.connected
            });
        }
	});

	return $router;
};
