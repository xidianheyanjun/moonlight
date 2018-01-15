import {controller, mapper} from "../../../decorator/route";

@controller({
    path: "/login"
})
class Login {
    @mapper({
        path: "/check",
        method: "get"
    })
    check(a, b) {
        console.log(a + b);
    }
}

module.exports = Login;