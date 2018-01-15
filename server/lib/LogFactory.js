/**
 * Created by Administrator on 2017/1/19.
 */
"use strict"

let Log = require("./Log");

class LogFactory {
    constructor(option) {
        this.logger = {};
    }

    getLogger(name) {
        if (!this.logger[name]) {
            this.logger[name] = new Log();
        }

        return this.logger[name];
    }
}

module.exports = LogFactory;