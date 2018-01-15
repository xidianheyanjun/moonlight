/**
 * Created by Administrator on 2017/1/19.
 */
"use strict"

let fs = require("fs");
let FileUtils = {};

FileUtils.listFilePath = function (path, pathRegular) {
    let filePaths = [];
    if (!fs.existsSync(path)) {
        return filePaths;
    }

    let stat = fs.lstatSync(path);
    if (stat.isDirectory()) {
        // 如果是目录则获取文件列表继续递归
        let files = fs.readdirSync(path);
        files.forEach(function (file) {
            let controllerPaths = FileUtils.listFilePath(path + "/" + file, pathRegular);
            filePaths = filePaths.concat(controllerPaths);
        });
    } else {
        if (pathRegular) {
            if (pathRegular.test(path)) {
                filePaths.push(path);
            }
        } else {
            filePaths.push(path);
        }
    }

    return filePaths;
};

module.exports = FileUtils;