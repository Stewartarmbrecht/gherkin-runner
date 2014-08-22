/// <reference path="_references.js" />
(function ($) {
    $.fn.loadView = function (url, loadingClass) {
        /// <summary>
        /// Loads an html view into the provided target element.  If a text/html
        /// script include exists that has an id that matches the url with the forward slashes
        /// replaced with dashes ('/' = '-') and with then ending extension removed then the 
        /// html of the script include will be used.
        /// </summary>
        /// <param name="targetElement" type="Object">The dom element to load the view into.</param>
        /// <param name="url" type="String">The url of the view.</param>
        /// <param name="loadingClass" type="String">The css class to add and remove from the targetElement while loading the view.</param>

        if (typeof ($.Deferred) != 'function') {
            alert('viewLoader requires jQuery v1.5 or later.  You are using version ' + $.fn.jquery);
            return;
        }

        var ko = ko || {};
        // Do your awesome plugin stuff here
        var dfd = new $.Deferred();
        if (typeof(ko.cleanNode) == 'function')
            ko.cleanNode(this);
        var target = $(this);
        target.empty();
        if (loadingClass) {
            target.html('&nbsp;');
            target.addClass(loadingClass);
        }
        var viewId = '#' + url.replace(/\//g, '-').replace('.html', '').replace('.htm', '');
        var view = $(viewId);
        console.log(viewId);

        if (view[0]) {
            target.removeClass(loadingClass);
            target.html(view.html());
            dfd.resolve(view[0]);
        } else {
            $.get(url).then(
                function (data, textStatus, jqXhr) {
                    $('body').append(data);
                    target.removeClass(loadingClass);
                    target.html($(data).html());
                    dfd.resolve(data, textStatus, jqXhr);
                }, function (jqXhr, textStatus, errorThrown) {
                    dfd.reject(jqXhr, textStatus, errorThrown);
                });
        }
        return dfd.promise();
    };
})(jQuery);
