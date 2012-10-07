"use strict";

/* $(document)
    .ajaxStart(blockUI)
    .ajaxStop(unblockUI); */

function blockUI() {
    $.blockUI({
        message: '<h1 style="height:40px;weight:40px;">Загрузка...</h1>'
    });
}

window.onerror = function (error, file, line) {

};

// XXX: getScript(), but we load sync
function loadScript(url) {
    $.ajax({
        url : url,
        dataType : "script",
        async : false,
        cache: false
    });
};


