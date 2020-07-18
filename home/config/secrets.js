//#
module.exports = function ($home) {
    'use strict';

    $home.app.data.secrets = {
        vacuum: {
            username: undefined,
            password: undefined,
            country: undefined,
            continent: undefined
        },

        garage: {
            password: undefined
        },

        location: { //# https://www.latlong.net/
            lat: undefined,
            long: undefined
        },
    };
};
