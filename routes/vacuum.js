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
            lastCommand: undefined,
            status: undefined,
            battery: undefined
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

                    $home.app.services.vacuum = {
                        rosie: $rosie
                    };

                    //#
                    $rosie.on("ChargeState", (sState) => {
                        oConfig.state = sState;
                        $home.io.event.fire("vacuum.state");
                    });
                    $rosie.on("BatteryInfo", (fBattery) => {
                        oConfig.battery = Math.round(fBattery);
                        $home.io.event.fire("vacuum.battery");
                    });
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
        let iCount = 0,
            oReturnVal = {
                connected: oConfig.connected,
                lastCommand: oConfig.lastCommand
            },
            fnFinalize = () => {
                oResponse.json($home.extend(oReturnVal, {
                    state: oConfig.state,
                    battery: oConfig.battery
                }));
            }
        ;

        //#
        if (oConfig.connected) {
            //#
            $home.io.event.watch("vacuum.state", function () {
                (++iCount > 1 && fnFinalize());
                return $home.io.event.unwatch;
            });
            $home.io.event.watch("vacuum.battery", function () {
                (++iCount > 1 && fnFinalize());
                return $home.io.event.unwatch;
            });
            $rosie.run("GetChargeState");
            $rosie.run("BatteryState");
        }
        //#
        else {
            oResponse.status(500).json(oReturnVal);
        }
    });

	//#
	$router.get("/clean", (oRequest, oResponse) => {
        //#
        if (oConfig.connected) {
            oConfig.lastCommand = "cleaning";

            $rosie.run("Clean");
            oResponse.json({
                connected: oConfig.connected,
                lastCommand: oConfig.lastCommand
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
	$router.get("/pause", (oRequest, oResponse) => {
        //#
        if (oConfig.connected) {
            oConfig.lastCommand = "paused";

            $rosie.run("Pause");
            oResponse.json({
                connected: oConfig.connected,
                lastCommand: oConfig.lastCommand
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
            oConfig.lastCommand = "charging";

            $rosie.run("Stop");
            $rosie.run("Charge");
            oResponse.json({
                connected: oConfig.connected,
                lastCommand: oConfig.lastCommand
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
	$router.get("/find", (oRequest, oResponse) => {
        //#
        if (oConfig.connected) {
            $rosie.run("PlaySound");
        }

        oResponse.json({
            connected: oConfig.connected,
            lastCommand: oConfig.lastCommand
        });
    });

	return $router;
};

/*
vacbot.run("Clean", mode, action);
vacbot.run("SpotArea", action, area);
vacbot.run("CustomArea", action, map_position, cleanings);
vacbot.run("Edge");
vacbot.run("Spot");
vacbot.run("Stop");
vacbot.run("Pause");
vacbot.run("Charge");
vacbot.run("GetCleanState");
vacbot.run("GetChargeState");
vacbot.run("GetBatteryState");
vacbot.run("PlaySound");
vacbot.run('GetLifeSpan', 'main_brush');
vacbot.run('GetLifeSpan', 'side_brush');
vacbot.run('GetLifeSpan', 'filter');
vacbot.run('GetWaterLevel');
vacbot.run('SetWaterLevel', level);
*/