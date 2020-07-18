const $fs = require("fs");

module.exports = function ($home, $express) {
    $home.app = {
        ver: "0.1.2020-06-21",

        //# stub for environment-specific config
        config: {
            //# Remove `node index.js` from process.argv (NOTE: ignores any flags sent to `node` itself)
            args: process.argv.slice(2),
        },

        //# stub for application data
        data: {
            baseIP: "192.168.80.",

            //# stub for secrets config
            secrets: {}
        },

        //# collection of external services
        services: {
            fs: $fs,

            webserver: $express,

            router: function () {
                var $returnVal = $express.Router();

                //# Configure our .router to use CORS
                /*$returnVal.use((oRequest, oResponse, fnContinue) => {
                    let sOrigin = oRequest.headers.origin;

                    //# If the oRequest is from a .corsWhitelist sOrigin we trust, set the CORS header
                    if (
                        $home.app.config.security.corsWhitelist.indexOf(
                            sOrigin
                        ) > -1
                    ) {
                        oResponse.setHeader(
                            "Access-Control-Allow-Origin",
                            sOrigin
                        );
                    }

                    //# Setup the other required headers then fnContinue the oRequest through the proper $route
                    //#     NOTE: CRUD = PUT,GET/POST,POST,DELETE
                    //oResponse.setHeader('Access-Control-Allow-Origin', '*');
                    oResponse.setHeader(
                        "Access-Control-Allow-Methods",
                        "GET,POST,PUT,DELETE"
                    );
                    oResponse.setHeader(
                        "Access-Control-Allow-Headers",
                        "X-Requested-With,content-type,Authorization"
                    );
                    oResponse.setHeader(
                        "Access-Control-Allow-Credentials",
                        true
                    );

                    fnContinue();
                }); //# CORS*/

                return $returnVal;
            }, //# router

            multipartForm: function () {
                return new $formidable.IncomingForm();
            }
        } //# $home.app.services

    }; //# $home.app

    //# .load the .enums into $home.type.enum
    /*$home.type.enum.load({
        clients: {}, //# Stub for client-specific values

        noteTypes: [
            { value: undefined, label: "system" },
            { value: 1, label: "user" },
            { value: 2, label: "email" },
            { value: 3, label: "sms" },
            { value: 100, label: "warning" },
            { value: 101, label: "error" },
        ],

        bankAccountType: {
            checking: "ca",
            savings: "sa",
            none: "na",
        },
    });*/
};
