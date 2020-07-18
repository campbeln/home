//################################################################################################
/** @file Networking mixin for ish.js
 * @mixin ish.io.net
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2020, Nick Campbell
 */ //############################################################################################
/*global module, define, require, XMLHttpRequest, ActiveXObject */  //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
(function () {
    'use strict';

    function init(core, fetch, XHRConstructor) {
        //################################################################################################
        /** Collection of Networking-based functionality.
         * @namespace ish.io.net
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.io, function (oProtected) {
            var oCache = {},
                oXHROptions = {
                    async: true,
                    cache: true,
                    useCache: false
                    //beforeSend: undefined,
                    //onreadystatechange: undefined
                },
                oBase = {   //# GET, POST, PUT, PATCH, DELETE, HEAD + TRACE, CONNECT, OPTIONS - https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods
                    xhr: {
                        get: function (oRetry) {
                            return function (sUrl, vCallback) {
                                var oReturnVal = xhr("GET", oXHROptions.async, sUrl, vCallback, oRetry /*, undefined*/);
                                oReturnVal.send();
                                return oReturnVal;
                            };
                        },
                        post: function (oRetry) {
                            return function (sUrl, oBody, vCallback) {
                                var oReturnVal = xhr("POST", oXHROptions.async, sUrl, vCallback, oRetry, oBody);
                                oReturnVal.send(oBody);
                                return oReturnVal;
                            };
                        },
                        put: function (oRetry) {
                            return function (sUrl, oBody, vCallback) {
                                var oReturnVal = xhr("PUT", oXHROptions.async, sUrl, vCallback, oRetry, oBody);
                                oReturnVal.send(oBody);
                                return oReturnVal;
                            };
                        },
                        "delete": function (oRetry) {
                            return function (sUrl, vCallback) {
                                var oReturnVal = xhr("DELETE", oXHROptions.async, sUrl, vCallback, oRetry /*, undefined*/);
                                oReturnVal.send();
                                return oReturnVal;
                            };
                        },
                        head: function (oRetry) {
                            return function (sUrl, vCallback) {
                                var oReturnVal = xhr("HEAD", oXHROptions.async, sUrl, vCallback, oRetry /*, undefined*/);
                                oReturnVal.send();
                                return oReturnVal;
                            };
                        }
                    },
                    xhrAsync: {
                        get: function (oOptions) {
                            return function (sUrl) {
                                return xhrAsync("GET", sUrl, oOptions /*, undefined*/);
                            };
                        },
                        post: function (oOptions) {
                            return function (sUrl, oBody) {
                                return xhrAsync("POST", sUrl, oOptions, oBody);
                            };
                        },
                        put: function (oOptions) {
                            return function (sUrl, oBody) {
                                return xhrAsync("PUT", sUrl, oOptions, oBody);
                            };
                        },
                        "delete": function (oOptions) {
                            return function (sUrl) {
                                return xhrAsync("DELETE", sUrl, oOptions /*, undefined*/);
                            };
                        },
                        head: function (oOptions) {
                            return function (sUrl) {
                                return xhrAsync("HEAD", sUrl, oOptions /*, undefined*/);
                            };
                        }
                    },
                    fetch: {
                        get: function (oOptions) {
                            return function (sUrl) {
                                return fetcher("GET", sUrl, oOptions /*, undefined*/);
                            };
                        },
                        post: function (oOptions) {
                            return function (sUrl, oBody) {
                                return fetcher("POST", sUrl, oOptions, oBody);
                            };
                        },
                        put: function (oOptions) {
                            return function (sUrl, oBody) {
                                return fetcher("PUT", sUrl, oOptions, oBody);
                            };
                        },
                        "delete": function (oOptions) {
                            return function (sUrl) {
                                return fetcher("DELETE", sUrl, oOptions /*, undefined*/);
                            };
                        },
                        head: function (oOptions) {
                            return function (sUrl) {
                                return fetcher("HEAD", sUrl, oOptions /*, undefined*/);
                            };
                        }
                    }
                }
            ;

            //#
            function fetcher() {

            } //# fetcher

            //# Wrapper for an XHR AJAX call
            function xhr(sVerb, bAsync, sUrl, vCallback, oRetry, oBody) {
                var iMS, bValidRequest, bResponseTypeText,
                    $xhr = oProtected.net.getXhr(),
                    bAbort = false,
                    oData = core.resolve(oCache, [sVerb.toLowerCase(), sUrl])
                ;

                //# If a function was passed rather than an object, object-ize it (else we assume its an object with at least a .fn)
                if (core.type.fn.is(vCallback)) {
                    vCallback = { fn: vCallback, arg: null /*, cache: oXHROptions.cache, useCache: oXHROptions.useCache */ };
                }
                bResponseTypeText = (!vCallback.responseType || (core.type.str.is(vCallback.responseType, true) && vCallback.responseType.trim().toLowerCase() === "text"));
                oRetry = core.type.obj.mk(oRetry);

                //# Determine if this is a bValidRequest
                bValidRequest = ($xhr && core.type.str.is(sUrl, true));

                //# If we are supposed to .useCache and we were able to find the oData in the oCache
                if ((vCallback.useCache || oXHROptions.useCache) && core.type.obj.is(oData)) {
                    //#
                    core.resolve($xhr, 'fromCache', true); //# $xhr.fromCache = true;
                    vCallback.fn( /* bSuccess, oData, vArg, $xhr */
                        (oData.status === 200 || (oData.status === 0 && oData.url.substr(0, 7) === "file://")),
                        oData,
                        vCallback.arg,
                        $xhr
                    );
                }
                //# Else if we were able to collect an $xhr object and we have an sUrl
                else if (bValidRequest) {
                    //# Setup the $xhr callback
                    //$xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    $xhr.onreadystatechange = function () {
                        //# If the request is finished and the .responseText is ready
                        if ($xhr.readyState === 4) {
                            oData = {
                                status: $xhr.status,
                                url: sUrl,
                                verb: sVerb,
                                async: bAsync,
                                aborted: bAbort,
                                loaded: (($xhr.status >= 200 && $xhr.status <= 299) || ($xhr.status === 0 && sUrl.substr(0, 7) === "file://")),
                                response: $xhr[bResponseTypeText ? 'responseText' : 'response'],
                                text: bResponseTypeText ? $xhr.responseText : null,
                                json: bResponseTypeText ? core.type.fn.tryCatch(JSON.parse)($xhr.responseText) : null
                            };
                            oData.data = oData.json; //# TODO: Remove

                            //#
                            if (vCallback.cache || oXHROptions.cache) {
                                core.resolve(true, oCache, [sVerb.toLowerCase(), sUrl], oData);
                            }

                            //# If no oData was .loaded, we haven't bAbort'ed and we have a oRetry, recurse via setTimeout to run another $xhr instance
                            if (
                                !oData.loaded &&
                                !bAbort &&
                                core.type.fn.is(oRetry.wait) &&
                                core.type.int.is(iMS = oRetry.wait(oRetry.attempts++))
                            ) {
                                setTimeout(function () {
                                    //if (arguments.length === 6) {
                                        xhr(sVerb, bAsync, sUrl, vCallback, oRetry, oBody)
                                            .send(oBody)
                                        ;
                                    /*}
                                    else {
                                        xhr(sVerb, bAsync, sUrl, vCallback, oRetry)
                                            .send()
                                        ;
                                    }*/
                                }, iMS);
                            }
                            //#
                            else {
                                vCallback.fn(/* bSuccess, oData, vArg, $xhr */
                                    !bAbort && oData.loaded,
                                    oData,
                                    vCallback.arg,
                                    $xhr
                                );
                            }
                        }
                    };
                }
                //# Else we were unable to collect the $xhr, so signal a failure to the vCallback.fn
                else {
                    core.type.fn.call(vCallback.fn, [false, null, vCallback.arg, $xhr]);
                }

                return {
                    xhr: $xhr,
                    send: function(vBody, fnHook) {
                        var a_sKeys, i,
                            sBody = ""
                        ;

                        //# If we were able to collect an $xhr object and we have an sUrl, .open and .send the request now
                        if (bValidRequest) {
                            $xhr.open(sVerb, sUrl, !!bAsync);

                            //#
                            if (core.type.str.is(vBody)) {
                                sBody = vBody;
                            }
                            else if (core.type.obj.is(vBody)) {
                                sBody = JSON.stringify(vBody);
                            }
                            else if (core.type.is.value(vBody)) {
                                sBody = core.type.str.mk(vBody);
                            }

                            //#
                            if (core.type.fn.is(fnHook)) {
                                fnHook($xhr);
                            }
                            //#
                            else {
                                if (core.type.obj.is(vCallback.headers)) {
                                    a_sKeys = core.type.obj.ownKeys(vCallback.headers);
                                    for (i = 0; i < a_sKeys.length; i++) {
                                        $xhr.setRequestHeader(a_sKeys[i], vCallback.headers[a_sKeys[i]]);
                                    }
                                }
                                if (core.type.str.is(vCallback.mimeType, true)) {
                                    $xhr.overrideMimeType(vCallback.mimeType); // 'application/json; charset=utf-8' 'text/plain'
                                }
                                if (core.type.str.is(vCallback.contentType, true)) {
                                    $xhr.setRequestHeader('Content-Type', vCallback.contentType); //# 'text/plain'
                                }
                                if (core.type.str.is(vCallback.responseType, true)) {
                                    $xhr.responseType = vCallback.responseType; //# 'text'
                                }
                                if (!vCallback.useCache) {
                                    $xhr.setRequestHeader("Cache-Control", "no-cache, max-age=0");
                                }
                            }

                            $xhr.send(sBody || null);
                        }
                    },
                    abort: function () {
                        bAbort = true;
                        $xhr.abort();
                        core.io.console.warn("ish.io.net: Aborted " + sVerb + " " + sUrl);
                    }
                };
            } //# xhr
            xhr.options = function (oOptions) {
                core.extend(oXHROptions, oOptions);
                return oXHROptions;
            }; //# xhr.options


            //#
            function xhrAsync(sVerb, sUrl, oOptions, oBody) {
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
                } catch (e) {
                    //return undefined;
                }
            } //# xhrAsync

            //#
            core.extend(oProtected, {
                net: {
                    cache: oCache,
                    xhrOptions: oXHROptions,

                    //#
                    getXhr: function () {
                        var $returnVal;

                        //# IE5.5+ (ActiveXObject IE5.5-9), based on http://toddmotto.com/writing-a-standalone-ajax-xhr-javascript-micro-library/
                        try {
                            $returnVal = new XHRConstructor('MSXML2.XMLHTTP.3.0');
                        } catch (e) { core.type.is.ish.expectedErrorHandler(e); }

                        return $returnVal;
                    }, //# getXhr

                    //#
                    processOptions: function (vOptions) {
                        var iWait,
                            oReturnVal /* = undefined*/
                        ;

                        //# If we were passed vOptions to process
                        if (arguments.length === 1) {
                            //# Create a local copy of vOptions then ensure the vOptions are properly set into our oReturnVal
                            oReturnVal = core.extend({
                                //wait: 500,
                                //maxAttempts: 5
                            }, vOptions);
                            iWait = (core.type.int.mk(oReturnVal.wait, 500));
                            oReturnVal.maxAttempts = core.type.int.mk(oReturnVal.maxAttempts, 5);
                            oReturnVal.attempts = 1;
                            oReturnVal.wait = (core.type.fn.is(oReturnVal.wait) ? oReturnVal.wait : function (iAttemptCount) {
                                return (
                                    iAttemptCount < oReturnVal.maxAttempts ?
                                    iWait :
                                    null
                                );
                            });
                        }

                        return oReturnVal;
                    }, //# processOptions,


                    //#
                    netInterfaceFactory: function (oBaseFns, oRetry) {
                        return {
                            //#########
                            /** Represents the HTTP Request Verbs as a CRUD (Create, Read, Update, Delete) interface.
                             * @function ish.io.net.crud
                             * @$asProperty
                             * @ignore
                             */ //#####
                            crud: {
                                //#########
                                /** Calls the passed URL to create a new entity (via <code>PUT</code>).
                                 * @function ish.io.net.crud:create
                                 * @param {string} sURL Value representing the URL to interrogate.
                                 * @param {object} [oBody] Value representing the body of the request.
                                 * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                                 *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                                 *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                                 *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                                 *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                                 *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                                 *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                                 *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                                 *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                                 */ //#####
                                create: oBaseFns.put(oRetry),

                                //#########
                                /** Calls the passed URL to read an entity (via <code>GET</code>).
                                 * @function ish.io.net.crud:read
                                 * @param {string} sURL Value representing the URL to interrogate.
                                 * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                                 *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                                 *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                                 *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                                 *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                                 *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                                 *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                                 *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                                 *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                                 */ //#####
                                read: oBaseFns.get(oRetry),

                                //#########
                                /** Calls the passed URL to update an entity (via <code>POST</code>).
                                 * @function ish.io.net.crud:update
                                 * @param {string} sURL Value representing the URL to interrogate.
                                 * @param {object} [oBody] Value representing the body of the request.
                                 * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                                 *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                                 *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                                 *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                                 *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                                 *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                                 *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                                 *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                                 *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                                 */ //#####
                                update: oBaseFns.post(oRetry),

                                //#########
                                /** Calls the passed URL to remove an entity (via <code>DELETE</code>).
                                 * @function ish.io.net.crud:delete
                                 * @param {string} sURL Value representing the URL to interrogate.
                                 * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                                 *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                                 *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                                 *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                                 *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                                 *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                                 *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                                 *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                                 *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                                 */ //#####
                                'delete': oBaseFns.delete(oRetry)
                            }, //# io.net.async.crud

                            //#########
                            /** Calls the passed URL via the <code>GET</code> HTTP Verb.
                             * @function ish.io.net.get
                             * @param {string} sURL Value representing the URL to interrogate.
                             * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                             *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                             *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                             *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                             *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                             *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                             *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                             *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                             *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                             */ //#####
                            get: oBaseFns.get(oRetry),

                            //#########
                            /** Calls the passed URL via the <code>PUT</code> HTTP Verb.
                             * @function ish.io.net.put
                             * @param {string} sURL Value representing the URL to interrogate.
                             * @param {object} [oBody] Value representing the body of the request.
                             * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                             *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                             *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                             *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                             *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                             *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                             *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                             *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                             *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                             */ //#####
                            put: oBaseFns.put(oRetry),

                            //#########
                            /** Calls the passed URL via the <code>POST</code> HTTP Verb.
                             * @function ish.io.net.post
                             * @param {string} sURL Value representing the URL to interrogate.
                             * @param {object} [oBody] Value representing the body of the request.
                             * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                             *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                             *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                             *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                             *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                             *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                             *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                             *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                             *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                             */ //#####
                            post: oBaseFns.post(oRetry),

                            //#########
                            /** Calls the passed URL via the <code>DELETE</code> HTTP Verb.
                             * @function ish.io.net.delete
                             * @param {string} sURL Value representing the URL to interrogate.
                             * @param {function|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                             *      @param {function} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                             *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                             *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                             *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                             *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                             *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                             *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                             *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                             */ //#####
                            'delete': oBaseFns.delete(oRetry),

                            //#########
                            /** Calls the passed URL via the <code>HEAD</code> HTTP Verb.
                             * @function ish.io.net.head
                             * @param {string} sURL Value representing the URL to interrogate.
                             * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                             *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                             *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                             *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                             *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                             *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                             *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                             *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                             *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                             */ //#####
                            head: oBaseFns.head(oRetry),

                            //#########
                            /** Calls the passed URL simulating a ping via the <code>HEAD</code> HTTP Verb.
                             * @function ish.io.net.ping
                             * @param {string} sURL Value representing the URL to interrogate.
                             * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                             *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                             *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                             *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                             *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                             *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                             *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                             *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                             *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                             */ //#####
                            ping: function (sUrl, vCallback) {
                                oBaseFns.head(oRetry)(sUrl, vCallback || function (/* bSuccess, oData, vArg, $xhr */) {});
                            }
                        };
                    } //# netInterfaceFactory
                }
            });


            //# Return the core.io.net functionality
            //#########
            /** Callback utilized by <code>ish.io.net</code> on completion of a XMLHttpRequest request.
             * @callback fnIshIoNetCallback
             * @param {boolean} bSuccess Value representing if the request returned successfully.
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
             * @param {variant} vArg Value representing the value passed in the original call as <code>vCallback.arg</code>.
             * @param {object} $xhr Value representing the underlying <code>XMLHttpRequest</code> management object.
             */ //#####
            return {
                net: core.extend(
                    //#########
                    /** Provides an interface that retries up to the passed number of attempts before returning an unsuccessful result.
                     * @function ish.io.net.!
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
                            oBase.xhr,
                            oProtected.net.processOptions(vOptions)
                        );
                    },
                    oProtected.net.netInterfaceFactory(oBase.xhr /*, undefined*/),
                    {
                        //#########
                        /** Provides access to the request cache.
                         * @function ish.io.net.cache
                         * @param {object} oImportCache Value representing the cached entries to import into the current cache as <code>verb.url.data</code>.
                         * @returns {object} Value representing the request cache.
                         */ //#####
                        cache: function (oImportCache) {
                            core.extend(oCache, oImportCache);
                            return oCache;
                        }, //# io.net.cache

                        //#########
                        /** XMLHttpRequest (XHR) management function.
                         * @function ish.io.net.xhr
                         * @param {string} sVerb Value representing the HTTP Verb.
                         * @param {boolean} bAsync Value representing if the HTTP request is to be asynchronous.
                         * @param {string} sUrl Value representing the URL to interrogate.
                         * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                         *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                         *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                         *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                         *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                         *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                         *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                         *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                         *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                         * @param {function} [fnRetry] Value representing the function to be called when the request is to be retried.
                         * @param {object} [oBody] Value representing the body of the request.
                         * @returns {object} =interface Value representing the following properties:
                         *      @returns {function} =interface.send Sends the request; <code>send(vBody, fnHook)</code>:
                         *          <table class="params">
                         *              <tr><td class="name"><code>vBody</code><td><td class="type param-type">variant | object<td><td class="description last">Value representing the body of the call.</td></tr>
                         *              <tr><td class="name"><code>fnHook</code><td><td class="type param-type">function<td><td class="description last">Value representing the function to be called before the request is sent via the underlying <code>XMLHttpRequest</code> management object; <code>fnHook($xhr)</code>.</td></tr>
                         *          </table>
                         *      @returns {function} =interface.abort Aborts the request; <code>abort()</code>.
                         *      @returns {object} =interface.xhr Value representing the underlying <code>XMLHttpRequest</code> management object.
                         */ //#####
                        xhr: function (sVerb, bAsync, sUrl, vCallback, fnRetry, oBody) {
                            return xhr(
                                sVerb, bAsync, sUrl, vCallback,
                                oProtected.net.processOptions({ wait: fnRetry }),
                                oBody
                            );
                        },
                        //xhr.options = xhr.options,

                        //#########
                        /** IP-based type functionality.
                         * @function ish.io.net.ip
                         * @$asProperty
                         * @ignore
                         */ //#####
                        ip: {
                            //#########
                            /** Determines if the passed value represents an IP.
                             * @function ish.io.net.ip:is
                             * @param {variant} x Value to interrogate.
                             * @returns {integer} Value representing the type of IP; <code>4</code> representing an IPv4, <code>6</code> representing an IPv6 and <code>0</code> (<code>falsey</code>) representing a non-IP.
                            */ //#####
                            is: core.extend(
                                function (x) {
                                    return (
                                        core.app.ip.is.v4(x) ?
                                        4 :
                                            core.app.ip.is.v6(x) ?
                                            6 :
                                            0
                                    );
                                }, function () {
                                    //# Create the reIPv4 and mega reIPv6 RegEx based on the various valid patters |'ed together
                                    //#     NOTE: The RegEx's are set as RegEx's below for intellisense/highlighting/etc and not for any other reason
                                    var reIPv4 = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                                        reIPv6 = new RegExp('^(?:' +
                                            /(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/                              .source + '|' +
                                            /(?:[0-9a-fA-F]{1,4}:){1,7}:/                                           .source + '|' +
                                            /(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}/                           .source + '|' +
                                            /(?:[0-9a-fA-F]{1,4}:){1,5}:(?:[0-9a-fA-F]{1,4}:)[0-9a-fA-F]{1,4}/      .source + '|' +
                                            /(?:[0-9a-fA-F]{1,4}:){1,4}:(?:[0-9a-fA-F]{1,4}:){2}[0-9a-fA-F]{1,4}/   .source + '|' +
                                            /(?:[0-9a-fA-F]{1,4}:){1,3}:(?:[0-9a-fA-F]{1,4}:){3}[0-9a-fA-F]{1,4}/   .source + '|' +
                                            /(?:[0-9a-fA-F]{1,4}:){1,2}:(?:[0-9a-fA-F]{1,4}:){4}[0-9a-fA-F]{1,4}/   .source + '|' +
                                            /(?:[0-9a-fA-F]{1,4}:){1,1}:(?:[0-9a-fA-F]{1,4}:){5}[0-9a-fA-F]{1,4}/   .source + '|' +
                                            /::(?:(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?/                     .source +
                                        ')$'
                                    );

                                    return {
                                        //#########
                                        /** Determines if the passed value represents an IPv4.
                                         * @function ish.io.net.ip:is:v4
                                         * @param {variant} x Value to interrogate.
                                         * @returns {boolean} Value representing if the passed value represents an IPv4.
                                        */ //#####
                                        v4: function (x) {
                                            return reIPv4.test(x + "");
                                        }, //# core.app.ip.is.v4

                                        //#########
                                        /** Determines if the passed value represents an IPv6.
                                         * @function ish.io.net.ip:is:v6
                                         * @param {variant} x Value to interrogate.
                                         * @returns {boolean} Value representing if the passed value represents an IPv6.
                                        */ //#####
                                        v6: function (x) {
                                            return reIPv6.test(x + "");
                                        } //# core.app.ip.is.v6
                                    };
                                }()
                            ) //# core.app.ip.is
                        }, //# core.app.ip


                        //#########
                        /** Enumeration of HTTP Status Codes.
                         * @function ish.io.net.status
                         * @$asProperty
                         * @returns {object} =status Value representing the following properties:
                         *      @returns {object} =status.info Value representing 1xx HTTP status codes.
                         *      @returns {object} =status.success Value representing 2xx HTTP status codes.
                         *      @returns {object} =status.redirection Value representing 3xx HTTP status codes.
                         *      @returns {object} =status.clientError Value representing 4xx HTTP status codes.
                         *      @returns {object} =status.serverError Value representing 5xx HTTP status codes.
                         */ //#####
                        status: {
                            info: {
                                continue: 100,
                                switchingProtocols: 101,
                                processing: 102,
                                earlyHints: 103
                            },
                            success: {
                                ok: 200,
                                created: 201,
                                accepted: 202,
                                nonAuthInfo: 203,
                                noContent: 204,
                                resetContent: 205,
                                partialContent: 206,
                                multiStatus: 207,
                                alreadyReported: 208,
                                imUsed: 226
                            },
                            redirection: {
                                multipleChoices: 300,
                                movedPermanently: 301,
                                found: 302,
                                seeOther: 303,
                                notModified: 304,
                                useProxy: 305,
                                switchProxy: 306,
                                temporaryRedirect: 307,
                                permanentRedirect: 30
                            },
                            clientError: {
                                badRequest: 400,
                                unauthorized: 401,
                                paymentRequired: 402,
                                forbidden: 403,
                                notFound: 404,
                                methodNotAllowed: 405,
                                notAcceptable: 406,
                                proxyAuthRequired: 407,
                                requestTimeout: 408,
                                conflict: 409,
                                gone: 410,
                                lengthRequired: 411,
                                preconditionFailed: 412,
                                payloadTooLarge: 413,
                                uriTooLong: 414,
                                unsupportedMediaType: 415,
                                rangeNotSatisfiable: 416,
                                expectationFailed: 417,
                                imATeapot: 418,
                                misdirectedRequest: 421,
                                unprocessableEntity: 422,
                                locked: 423,
                                failedDependency: 424,
                                upgradeRequired: 426,
                                preconditionRequired: 428,
                                tooManyRequests: 429,
                                requestHeaderFieldsTooLarge: 431,
                                unavailableForLegalReasons: 451
                            },
                            serverError: {
                                internalServerError: 500,
                                notImplemented: 501,
                                badGateway: 502,
                                serviceUnavailable: 503,
                                gatewayTimeout: 504,
                                httpVersionNotSupported: 505,
                                variantAlsoNegotiates: 506,
                                insufficientStorage: 507,
                                loopDetected: 508,
                                notExtended: 510,
                                networkAuthRequired: 511
                            }
                        } //# io.net.status
                    }
                )
            };
        }); //# core.io.net

        //# .fire the plugin's loaded event
        core.io.event.fire("ish.io.net");
    }


    //# If we are running server-side
    //#     NOTE: Compliant with UMD, see: https://github.com/umdjs/umd/blob/master/templates/returnExports.js
    //#     NOTE: Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports, like Node.
    if (typeof module === 'object' && module.exports) { //if (typeof module !== 'undefined' && this.module !== module && module.exports) {
        module.exports = function (core) {
            init(core, require('node-fetch'), require("xmlhttprequest").XMLHttpRequest);
        };
    }
    //# Else if we are running in an .amd environment, register as an anonymous module
    else if (typeof define === 'function' && define.amd) {
        define([], function (core) {
            init(core, XMLHttpRequest || ActiveXObject);
        });
    }
    //# Else we are running in the browser, so we need to setup the _document-based features
    else {
        /*global ActiveXObject: false */ //# JSHint "ActiveXObject variable undefined" error suppressor
        init(document.querySelector("SCRIPT[ish]").ish, document.fetch, XMLHttpRequest || ActiveXObject);
    }
}());
