/// <reference path="_references.js" />
(function ($) {
    $.halApi = (function() {
        var _halApi = {};
        _halApi.requireRoot = null;
        _halApi.requireUrl = function (url) {
            return _halApi.requireRoot && url.indexOf(_halApi.requireRoot) == 0;
        };
        _halApi.setRequireRoot = function (url) {
            _halApi.requireRoot = url;
        };
        _halApi.ajax = function (method, href, postData) {
            var dfd = $.Deferred();
            var data = _halApi.data(href);
            var dataType = "json";
            if (method == "DELETE")
                dataType = "text"; //Deletes do not return any content.  if you set it to json then a parseError exception occurs.
            if (postData)
                data = postData;
            var ajaxSettings = {
                url: href,
                type: method,
                dataType: dataType,
                contentType: "application/json",
                data: data,
                cache: true
            };
            $.ajax(ajaxSettings).
                then(function (data) {
                    dfd.resolve(data);
                }).
                fail(function (jqXhr, textStatus, errorThrown) {
                    dfd.reject(errorThrown);
                });
            return dfd.promise();
        };
        _halApi.data = function(href) {
            if (_halApi.requireUrl(href))
                return { 'v': null };
            else
                return {};
        };
        _halApi.getRoot = function (url) {
            /// <summary>Gets the root representation of an API.</summary>
            /// <param name="url" type="string">The root url of the API.</param>
            var dfd = new $.Deferred();

            if (url) {
                if (_halApi.requireUrl(url)) {
                    require([url], function (rep) {
                        dfd.resolve(rep);
                    });
                } else {
                    _halApi.ajax('GET', url).then(function (data) {
                        dfd.resolve(data);
                    }, function (error) {
                        dfd.reject(error);
                    });
                }
            } else {
                dfd.reject(new Error('You must provide a valid url.'));
            }
            return dfd.promise();
        };
        _halApi.get = function (rep, linkName) {
            /// <summary>Issues a get against a representation's link that matches by the link name provided.</summary>
            /// <param name="rep" type="Object">The representation containing the link.</param>
            /// <param name="linkName" type="String">The name of the link to issue the get against.</param>

            var dfd = new $.Deferred();
            if (rep && linkName) {
                if (rep._embedded && rep._embedded[linkName]) {
                    dfd.resolve(rep._embedded[linkName]);
                } else {
                    var href = rep._links[linkName].href;
                    if (_halApi.requireUrl(href)) {
                        require([href], function(rep) {
                            dfd.resolve(rep);
                        });
                    } else {
                        _halApi.ajax('GET', href).
                            then(function (data) {
                                dfd.resolve(data);
                            }).
                            fail(function (error) {
                                dfd.reject(error);
                            });
                    }
                }
            } else {
                dfd.reject(new Error('You must provide a representation and a link name.'));
            }
            return dfd.promise();
        };
        _halApi.getEmbedded = function(rep, linkName) {
            if (rep && linkName) {
                if (rep._embedded && rep._embedded[linkName]) {
                    return rep._embedded[linkName];
                }
            }
        };
        _halApi.getLink = function(rep, linkName) {
            if (rep && linkName) {
                return rep._links[linkName];
            }
        };
        _halApi.getById = function(rep, linkName, id) {
            var dfd = new $.Deferred();
            if (rep && linkName) {
                var href = rep._links[linkName].href;
                if (href.indexOf('?') != -1) {
                    var hrefParts = href.split('?');
                    href = hrefParts[0] + "/" + id + hrefParts[1];
                } else {
                    href = href + "/" + id;
                }
                if (_halApi.requireUrl(href)) {
                    require([href], function(rep) {
                        dfd.resolve(rep);
                    });
                } else {
                    dfd = _halApi.ajax('GET', href).
                        then(function (data) {
                            dfd.resolve(data);
                        }).
                        fail(function (error) {
                            dfd.reject(error);
                        });
                }
            } else {
                dfd.reject(new Error('You must provide a representation and a link name.'));
            }
            return dfd.promise();
        };
        _halApi.post = function(parentRep, linkName, rep) {
            var dfd = new $.Deferred();
            if (parentRep && rep && linkName) {
                var href = parentRep._links[linkName].href;
                var repJSON = JSON.stringify(rep);
                if (_halApi.requireUrl(href)) {
                    require([href + "PostResult"], function(resultRep) {
                        dfd.resolve(resultRep);
                    });
                } else {
                    _halApi.ajax('POST', href, repJSON).
                        then(function (data) {
                            dfd.resolve(data);
                        }).
                        fail(function (error) {
                            dfd.reject(error);
                        });
                }
            } else {
                dfd.reject(new Error('You must provide a parent representation, link name, and representation.'));
            }
            return dfd.promise();
        };
        _halApi.put = function(parentRep, linkName, rep) {
            var dfd = new $.Deferred();
            if (parentRep && rep && linkName) {
                var href = parentRep._links[linkName].href;
                var repJSON = JSON.stringify(rep);
                if (_halApi.requireUrl(href)) {
                    require([href + "PutResult"], function(resultRep) {
                        dfd.resolve(resultRep);
                    });
                } else {
                    _halApi.ajax('PUT', href, repJSON).
                        then(function (data) {
                            dfd.resolve(data);
                        }).
                        fail(function (error) {
                            dfd.reject(error);
                        });
                }
            } else {
                dfd.reject(new Error('You must provide a parent representation, link name, and representation.'));
            }
            return dfd.promise();
        };
        _halApi.delete = function(rep) {
            var dfd = new $.Deferred();
            if (rep) {
                var href = rep._links['self'].href;
                if (_halApi.requireUrl(href)) {
                    dfd.resolve();
                } else {
                    _halApi.ajax('DELETE', href).
                        then(function (data) {
                            dfd.resolve(data);
                        }).
                        fail(function (error) {
                            dfd.reject(error);
                        });
                }
            } else {
                dfd.reject(new Error('You must provide a representation and link name.'));
            }
            return dfd.promise();
        };

        return {
            setRequireRoot: _halApi.setRequireRoot,
            getRoot: _halApi.getRoot,
            get: _halApi.get,
            getEmbedded: _halApi.getEmbedded,
            getLink: _halApi.getLink,
            getById: _halApi.getById,
            post: _halApi.post,
            put: _halApi.put,
            delete: _halApi.delete
        };
    })();
})(jQuery);
