import fs from "fs";

let Promise = require("promise");

let loadData = (filePath) => {
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

let listFilePath = (path, pathRegular) => {
    let filePaths = [];
    if (!fs.existsSync(path)) {
        return filePaths;
    }
    let stat = fs.lstatSync(path);
    if (stat.isDirectory()) {
        // 如果是目录则获取文件列表继续递归
        let files = fs.readdirSync(path);
        files.forEach(function (file) {
            let subPaths = listFilePath(path + "/" + file, pathRegular);
            filePaths = filePaths.concat(subPaths);
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

export default {
    loadData,
    listFilePath
};
