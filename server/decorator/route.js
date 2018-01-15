class Route {
    constructor() {
        this.mapping = {};
        return this;
    }

    controller(option) {
        return (target)=> {
            target.prototype.index = ()=> {
                return option.path;
            };
            console.log("controller", target.prototype, option, arguments);
        };
    }

    mapper(option) {
        return (target, name, desc)=> {
            target._mapping = target._mapping || [];
            console.log("mapper", target, name, desc, option, 1);
        };
    }
}

let route = new Route();
module.exports = route;