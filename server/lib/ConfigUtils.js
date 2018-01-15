/**
 * Created by Administrator on 2017/1/19.
 */
"use strict"

let Promise = require("promise");
var fs = require("fs");

let ConfigUtils = {
    data: {}
};

ConfigUtils.loadConfig = function (filePath) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filePath, "utf-8", function (err, data) {
            if (err) {
                reject(err);
                return false;
            }

            let configData = JSON.parse(data);
            resolve(configData);
        });
    });
};

module.exports = ConfigUtils;