/**
 * Created by Administrator on 2017/1/19.
 */
"use strict"

let path = require("path");

let fileUtils = require("./FileUtils");
let Resolver = require("./Resolver");
let Log = require("./Log");
let Dao = require("./Dao");
let responseCode = require("../util/response-code");

class Dispatcher {
    constructor(configData) {
        let self = this;
        self["config"] = configData;
        self["cacheController"] = {};

        // 获取controller文件路径
        let controllerModulePath = path.join(path.dirname(__dirname), self["config"]["init"]["modulePath"]);
        let controllerPathRegular = new RegExp(self["config"]["init"]["controllerPathRegular"]);
        let controllerPaths = fileUtils.listFilePath(controllerModulePath, controllerPathRegular);

        // 缓存controller
        controllerPaths.forEach(function (controllerPath) {
            let pathDivision = controllerPath.split(/[\/\.]/);
            let length = pathDivision.length;
            let moduleName = pathDivision[length - 4];
            let controllerName = pathDivision[length - 2];
            self["cacheController"][moduleName] = self["cacheController"][moduleName] || {};
            self["cacheController"][moduleName][controllerName] = require(controllerPath);
        });

        // 分发请求
        return function (req, res) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
            res.header("Access-Control-Allow-Credentials", "true");
            res.header("X-Powered-By", '3.2.1');


            let log = new Log();
            let resolver = new Resolver({
                req: req,
                res: res,
                log: log
            });
            let urlPlaceHolder = self["config"]["urlPlaceHolder"];
            let moduleName = req["params"][urlPlaceHolder["moduleName"]];
            let controllerName = req["params"][urlPlaceHolder["controllerName"]];
            let methodName = req["params"][urlPlaceHolder["methodName"]];
            log.info("params", moduleName, controllerName, methodName);

            console.log(self["cacheController"]);

            //判断权限
            let path = ["/", moduleName, "/", controllerName, "/", methodName].join("");
            if (path != "/user/access/login") {
                if (!req.session.user) {
                    log.info("the user does not login");
                    resolver.json({
                        code: responseCode["auth"]["code"],
                        msg: responseCode["auth"]["msg"]
                    });
                    return false;
                }
            }

            if (!self["cacheController"][moduleName] || !self["cacheController"][moduleName][controllerName] || methodName.indexOf("_") == 0) {
                // 路径不存在
                log.info(["the path is not existed---/", moduleName, "/", controllerName].join(""));
                resolver.json({
                    code: responseCode["path"]["code"],
                    msg: responseCode["path"]["msg"]
                });
                return false;
            }

            let action = new self["cacheController"][moduleName][controllerName]();
            if (!action[methodName] || methodName == "constructor") {
                // 路径不存在
                log.info(["the path is not existed---/", moduleName, "/", controllerName, "/", methodName].join(""));
                resolver.json({
                    code: responseCode["path"]["code"],
                    msg: responseCode["path"]["msg"]
                });
                return false;
            }

            let dao = new Dao({
                log: log,
                page: configData["page"],
                cfg: configData["mysql"]
            });
            action["resolver"] = resolver;
            action["log"] = log;
            action["dao"] = dao;
            action["config"] = configData;
            action["req"] = req;
            action["res"] = res;

            action[methodName]();
        };
    }
}

module.exports = Dispatcher;