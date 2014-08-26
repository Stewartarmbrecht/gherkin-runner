/// <reference path="/App/services/_references.js" />
(function ($, breeze) {
    $.restfulBreeze = (function () {
        breeze.NamingConvention.camelCase.setAsDefault();
        var _this = {};
        _this.rootUrl = null;
        _this.setRootUrl = function (rootUrl) {
            _this.rootUrl = rootUrl;
        };
        _this.api = null;
        _this.metadataStore = null;
        _this.getMetadataStore = function () {
            if (!_this.metadataStore)
                _this.metadataStore = new breeze.MetadataStore();
            return _this.metadataStore;
        };
        _this.getManager = function (linkName, rep, urlIsQuery) {
            var url = rep._links[linkName].href;
            if (urlIsQuery)
                url = '/' + url.split('/')[1];
            url = _this.rootUrl + url;
            if (!rep)
                rep = _this.api;

            return new breeze.EntityManager({ serviceName: url, metadataStore: _this.getMetadataStore() });
        };
        _this.executeQuery = function (linkName, rep) {
            var url = rep._links[linkName].href.split('/')[2];
            var dfd = $.Deferred();
            var manager = _this.getManager(linkName, rep, true);
            manager.executeQuery(url).
                then(function (data) {
                    dfd.resolve(data);
                }).
                fail(function (error) {
                    if (dfd.state() == "resolved")
                        throw error;
                    else
                        dfd.reject(error);
                });
            return dfd.promise();
        };
        return {
            getManager: _this.getManager,
            executeQuery: _this.executeQuery,
            setRootUrl: _this.setRootUrl,
            getMetadataStore: _this.getMetadataStore
        };
    })();
})(jQuery, breeze);