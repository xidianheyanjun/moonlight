/**
 * Created by Administrator on 2017/2/1.
 */
"use strict"
let Promise = require("promise");
let mysql = require("mysql");

let pools = {};

class Dao {
    constructor(option) {
        this["log"] = option["log"];
        this["cfg"] = option["cfg"];
        this["page"] = option["page"];
    }

    /*
     sql:字符串,查询语句
     params:数组,传入的参数
     */
    prepareQuery(option) {
        let self = this;
        let cfg = option["cfg"] || self["cfg"];
        return new Promise(function (resolve, reject) {
            let thisPool = self.getPool(cfg);
            let sql = option["sql"] || "";
            let params = option["params"] || [];
            self.log.info("[" + sql + "]|{" + params.join(",") + "}");
            thisPool.query(sql, params, function (error, results, fields) {
                if (error) {
                    reject(error);
                    return false;
                }
                resolve(results);
            });
        });
    }

    /*
     先查询数据总条数
     再查询第X页的数据
     */
    queryForList(option) {
        let self = this;
        let cfg = option["cfg"] || self["cfg"];
        return new Promise(function (resolve, reject) {
            let thisPool = self.getPool(cfg);
            let sql = option["sql"] || "";
            let params = option["params"] || [];
            let page = option["page"] || {};
            let pageSize = parseInt(page["pageSize"]) || self["page"]["pageSize"];
            let pageNo = parseInt(page["pageNo"]) || self["page"]["pageNo"];
            self.log.info("[" + sql + "]|{" + params.join(",") + "}|{" + pageNo + "," + pageSize + "}");
            let sqlTotal = `select count(1) as total from (${sql}) _t;`;
            console.log(sqlTotal);
            thisPool.query(sqlTotal, params, function (error, results, fields) {
                if (error) {
                    reject(error);
                    return false;
                }
                console.log(results);
                let totalSize = results[0].total;
                let totalPage = self["computeTotalPage"](totalSize, pageSize);
                if (totalPage == 0) {
                    resolve({
                        list: [],
                        pageSize: pageSize,
                        pageNo: pageNo,
                        totalPage: totalPage
                    });
                    return false;
                }
                let queryPageNo = self["computeQueryPageNo"](totalPage, pageNo);
                let start = pageSize * (queryPageNo - 1);
                let querySql = `${sql} limit ${start}, ${pageSize};`;
                thisPool.query(querySql, params, function (err, list) {
                    if (err) {
                        reject(err);
                        return false;
                    }
                    resolve({
                        list: list,
                        pageSize: pageSize,
                        pageNo: pageNo,
                        totalPage: totalPage
                    });
                });
            });
        });
    }

    /*
     计算查询的页数
     */
    computeQueryPageNo(totalPage, pageNo) {
        return pageNo < 1 ? 1 : pageNo > totalPage ? totalPage : pageNo;
    }

    /*
     计算总页数
     */
    computeTotalPage(totalSize, pageSize) {
        let remainder = totalSize % pageSize;
        let page = parseInt(totalSize / pageSize);
        return remainder == 0 ? page : page + 1;
    }

    getPool(option) {
        let dbId = option["id"] + "";
        if (!pools[dbId]) {
            let setting = Object.assign({connectionLimit: 100}, option);
            pools[dbId] = mysql.createPool(setting);
        }
        return pools[dbId];
    }
}

module.exports = Dao;