var db = require("../src/rtc/db/default-schema").RTC;

/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', {
      login: req.cookies.login,
        title: 'ДТП'
    });
};
