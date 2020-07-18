//################################################################################################
/** @file async/await Networking mixin for ish.js
 * @mixin ish.io.net.async
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2020, Nick Campbell
 * @ignore
 */ //############################################################################################
/*global module, define, require, XMLHttpRequest, ActiveXObject */  //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
(function () {
    'use strict';

    function init(core) {
        //################################################################################################
        /** Collection of async/await Networking-based functionality.
         * @namespace ish.io.net.async
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.io, function (oProtected) {
            var oBase = {   //# GET, POST, PUT, PATCH, DELETE, HEAD + TRACE, CONNECT, OPTIONS - https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods
                get: function (oOptions) {
                    return function (sUrl) {
                        return xhrAsPromise("GET", sUrl, oOptions /*, undefined*/);
                    };
                },
                post: function (oOptions) {
                    return function (sUrl, oBody) {
                        return xhrAsPromise("POST", sUrl, oOptions, oBody);
                    };
                },
                put: function (oOptions) {
                    return function (sUrl, oBody) {
                        return xhrAsPromise("PUT", sUrl, oOptions, oBody);
                    };
                },
                "delete": function (oOptions) {
                    return function (sUrl) {
                        return xhrAsPromise("DELETE", sUrl, oOptions /*, undefined*/);
                    };
                },
                head: function (oOptions) {
                    return function (sUrl) {
                        return xhrAsPromise("HEAD", sUrl, oOptions /*, undefined*/);
                    };
                }
            };

            //#
            function xhrAsPromise(sVerb, sUrl, oOptions, oBody) {
                var bResponseTypeText;

                //#
                function setupXhr(fnPromiseResolve, fnPromiseReject) {
                    var a_sKeys, oData, iMS, i,
                        $xhr = oProtected.net.getXhr()
                    ;

                    //# Setup the $xhr callback
                    $xhr.onreadystatechange = function () {
                        //# If the request is finished and the .responseType is ready
                        if ($xhr.readyState === 4) {
                            oData = {
                                status: $xhr.status,
                                url: sUrl,
                                verb: sVerb,
                                async: true,
                                aborted: false,
                                loaded: (($xhr.status >= 200 && $xhr.status <= 299) || ($xhr.status === 0 && sUrl.substr(0, 7) === "file://")),
                                response: $xhr[bResponseTypeText ? 'responseText' : 'response'],
                                text: (bResponseTypeText ? $xhr.responseText : null),
                                json: (bResponseTypeText ? core.type.fn.tryCatch(JSON.parse)($xhr.responseText) : null)
                            };

                            //#
                            if (oProtected.net.xhrOptions.cache) {
                                core.resolve(true, oProtected.net.cache, [sVerb.toLowerCase(), sUrl], oData);
                            }

                            //# If no oData was .loaded and we have a oOptions.wait, recurse via setTimeout to run another $xhr instance (calculating the iMS as we go)
                            if (
                                !oData.loaded &&
                                core.type.fn.is(oOptions.wait) &&
                                core.type.int.is(iMS = oOptions.wait(oOptions.attempts++))
                            ) {
                                setTimeout(function () {
                                    $xhr = setupXhr(fnPromiseResolve, fnPromiseReject);
                                }, iMS);
                            }
                            //# If the oData .loaded successfully, fnPromiseResolve
                            else if (oData.loaded) {
                                fnPromiseResolve(oData);
                            }
                            //# Else the oData didn't .loaded, so fnPromiseReject
                            else {
                                fnPromiseReject(oData);
                            }
                        }
                    };

                    //#
                    $xhr.open(sVerb, sUrl, true);
                    if (core.type.obj.is(oOptions.headers)) {
                        a_sKeys = core.type.obj.ownKeys(oOptions.headers);
                        for (i = 0; i < a_sKeys.length; i++) {
                            $xhr.setRequestHeader(a_sKeys[i], oOptions.headers[a_sKeys[i]]);
                        }
                    }
                    if (core.type.str.is(oOptions.mimeType, true)) {
                        $xhr.overrideMimeType(oOptions.mimeType); // 'application/json; charset=utf-8' 'text/plain'
                    }
                    if (core.type.str.is(oOptions.contentType, true)) {
                        $xhr.setRequestHeader('Content-Type', oOptions.contentType); //# 'text/plain'
                    }
                    if (core.type.str.is(oOptions.responseType, true)) {
                        $xhr.responseType = oOptions.responseType; //# 'text'
                    }
                    if (!oOptions.useCache) {
                        $xhr.setRequestHeader("Cache-Control", "no-cache, max-age=0");
                    }

                    return $xhr;
                } //# setupXhr


                //# Ensure the passed oOptions .is an .obj then set bResponseTypeText
                oOptions = core.type.obj.mk(oOptions);
                bResponseTypeText = (!oOptions.responseType || (core.type.str.is(oOptions.responseType, true) && oOptions.responseType.trim().toLowerCase() === "text"));

                //# Wrap the new Promise() call, returning undefined if it's unavailable
                try {
                    return new Promise(function (resolve, reject) {
                        var $xhr = setupXhr(resolve, reject);
                        $xhr.send(oBody);
                    });
                } catch(e) {
                    //return undefined;
                }
            } //# xhrAsPromise


            //# Return the core.io.net functionality
            //#########
            /** Callback utilized by <code>ish.io.net.async</code> on completion of a XMLHttpRequest request.
             * @callback fnIshIoNetAsyncCallback
             * @param {object} oResponse Value representing the results of the request:
             *      @param {integer} oResponse.status Value representing the XMLHttpRequest's <code>status</code>.
             *      @param {string} oResponse.url Value representing the URL of the request.
             *      @param {string} oResponse.verb Value representing the HTTP Verb of the request.
             *      @param {boolean} oResponse.async Value representing if the request was asynchronous.
             *      @param {boolean} oResponse.aborted Value representing if the request was aborted prior to completion.
             *      @param {boolean} oResponse.loaded Value representing if the URL was successfully loaded.
             *      @param {variant} oResponse.response Value representing the XMLHttpRequest's <code>responseText</code> or <code>response</code>.
             *      @param {string} oResponse.text Value representing the XMLHttpRequest's <code>responseText</code>.
             *      @param {object} oResponse.json Value representing the XMLHttpRequest's <code>responseText</code> as parsed JSON.
             */ //#####
            return {
                net: {
                    //#########
                    /** Provides an interface that retries up to the passed number of attempts before returning an unsuccessful result.
                     * @function ish.io.net:async
                     * @returns {object} =interface Value representing the following properties:
                     *      @returns {object} =interface.get {@link: ish.io.net.get}.
                     *      @returns {object} =interface.put {@link: ish.io.net.put}.
                     *      @returns {object} =interface.post {@link: ish.io.net.post}.
                     *      @returns {object} =interface.delete {@link: ish.io.net.delete}.
                     *      @returns {object} =interface.head {@link: ish.io.net.head}.
                     *      @returns {object} =interface.crud {@link: ish.io.net.crud}.
                     */ //#####
                    async: core.extend(
                        //#########
                        /** Provides an interface that retries up to the passed number of attempts before returning an unsuccessful result.
                         * @function ish.io.net:async.!
                         * @param {object|function} [vOptions] Value representing a function called per attempt that returns the number of milliseconds between each call; <code>iWaitMilliseconds = oOptions.wait(iAttemptCount)</code> or the desired options:
                         *      @param {integer|function} [vOptions.wait=500] Value representing the number of milliseconds (1/1000ths of a second) or function called per attempt that returns the number of milliseconds between each call; <code>iWaitMilliseconds = oOptions.wait(iAttemptCount)</code>.
                         *      @param {integer} [vOptions.maxAttempts=5] Value representing the maximum number of attempts before returning an unsuccessful result.
                         * @returns {object} =interface Value representing the following properties:
                         *      @returns {object} =interface.get {@link: ish.io.net.get}.
                         *      @returns {object} =interface.put {@link: ish.io.net.put}.
                         *      @returns {object} =interface.post {@link: ish.io.net.post}.
                         *      @returns {object} =interface.delete {@link: ish.io.net.delete}.
                         *      @returns {object} =interface.head {@link: ish.io.net.head}.
                         *      @returns {object} =interface.crud {@link: ish.io.net.crud}.
                         */ //#####
                        function (vOptions) {
                            //#
                            return oProtected.net.netInterfaceFactory(
                                oBase,
                                oProtected.net.processOptions(vOptions)
                            );
                        },
                        oProtected.net.netInterfaceFactory(oBase /*, undefined*/)
                        // ,{
                        //     //#########
                        //     /** Calls the passed GraphQL Service URL via the <code>POST</code> HTTP Verb.
                        //      * @function ish.io.net.post
                        //      * @param {string} sURL Value representing the URL to interrogate.
                        //      * @param {string} sQuery Value representing the GraphQL query.
                        //      * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                        //      *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                        //      *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                        //      *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                        //      *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                        //      *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                        //      *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                        //      *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                        //      *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                        //      */ //#####
                        //     gql: function (sUrl, sQuery) {
                        //         var oReturnVal = xhrAsPromise("POST", sUrl, oRetry, oBody);
                        //         oReturnVal.send(sQuery);
                        //         return oReturnVal;
                        //     }
                        // }
                    ) //# io.net.async
                }
            };
        }); //# core.io.net

        //# .fire the plugin's loaded event
        core.io.event.fire("ish.io.net.async");
    }


    //# If we are running server-side
    //#     NOTE: Compliant with UMD, see: https://github.com/umdjs/umd/blob/master/templates/returnExports.js
    //#     NOTE: Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports, like Node.
    if (typeof module === 'object' && module.exports) { //if (typeof module !== 'undefined' && this.module !== module && module.exports) {
        module.exports = init;
    }
    //# Else if we are running in an .amd environment, register as an anonymous module
    else if (typeof define === 'function' && define.amd) {
        define([], init);
    }
    //# Else we are running in the browser, so we need to setup the _document-based features
    else {
        init(document.querySelector("SCRIPT[ish]").ish);
    }
}());
