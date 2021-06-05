
function autoReloadOnServerChange() {
    $.get('/last_static_update').done((result) => {
        // initialize
        const max_age = Number(result.max_age);
        const rand_check_number = Number(result.rand_check_number);
        setInterval(_ => {
            $.get({
                url: '/last_static_update',
                cache: false,
                data: {max_age, rand_check_number}
            }).done((result) => {
                if (Number(result.max_age) > max_age || result.rand_check_number !== rand_check_number) {
                    window.location.reload();
                    //console.log('refresh', Number(result.max_age), max_age, result.rand_check_number, rand_check_number);
                }
            }).fail((xhr, textStatus, errorThrown) =>
                console.log(`${xhr.responseText || textStatus}`)
            );

        }, 15000);
    });
}

// auto refresh on static or app reload
autoReloadOnServerChange();
