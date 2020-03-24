/*
 Intensify by TEMPLATED
 templated.co @templatedco
 Released for free under the Creative Commons Attribution 3.0 license (templated.co/license)
 */

(function ($) {

    skel.breakpoints({
        xlarge: '(max-width: 1680px)',
        large: '(max-width: 1280px)',
        medium: '(max-width: 980px)',
        small: '(max-width: 736px)',
        xsmall: '(max-width: 480px)'
    });

    $(function () {

        var $window = $(window),
            $body = $('body'),
            $header = $('#header');

        // Disable animations/transitions until the page has loaded.
        $body.addClass('is-loading');

        $window.on('load', function () {
            window.setTimeout(function () {
                $body.removeClass('is-loading');
            }, 100);
        });

        // Fix: Placeholder polyfill.
        $('form').placeholder();

        // Prioritize "important" elements on medium.
        skel.on('+medium -medium', function () {
            $.prioritize(
                '.important\\28 medium\\29',
                skel.breakpoint('medium').active
            );
        });

        // Scrolly.
        $('.scrolly').scrolly({
            offset: function () {
                return $header.height();
            }
        });

        // Menu.
        $('#menu')
            .append('<a href="#menu" class="close"></a>')
            .appendTo($body)
            .panel({
                delay: 500,
                hideOnClick: true,
                hideOnSwipe: true,
                resetScroll: true,
                resetForms: true,
                side: 'right'
            });
        // Enquire
        $('#enquire').click(event => {
            $('#enquiry-form').fadeIn('slow');
            $('#enquiry-list').fadeOut('slow');
            $('#block_body').slideUp('slow');
            $('[name=enquiry-name]').focus();
        });
        // Enquire cancel
        $('#enquiry-cancel').click(event => {
                $('#enquiry-form').fadeOut();
                $('#enquiry-list').fadeIn();
                $('#block_body').slideDown('slow');
            }
        );
        // Enquire submit
        $('#enquiry-submit').click(event => {
            $('#enquiry-form').fadeOut('slow');
            $('#enquiry-list').fadeIn('slow');
            $('#block_body').slideDown('slow');
            $('#message').fadeIn('slow');

            $.ajax({
                    url: '/enquiry/submit',
                    type: 'POST',
                    dataType: 'json',
                    data: $('form#enquiry-form').serialize(),
                }
            ).then(setTimeout(_ => $('#message').fadeOut('slow'), 5000)
            ).fail((xhr, textStatus, errorThrown) =>
                this.message(`${xhr.responseText}`)
            );
            event.preventDefault();
        });
    });

})(jQuery);
