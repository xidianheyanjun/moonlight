/**
 * Created by Administrator on 2017/1/19.
 */
"use strict"

class Log {
    constructor(option) {
    }

    info() {
        let args = [];
        for (let index = 0; index < arguments.length; ++index) {
            args.push(arguments[index]);
        }
        console.log(args.join("|"));
    }
}

module.exports = Log;