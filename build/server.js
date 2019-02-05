"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const UserController_1 = require("./controllers/UserController");
const userController = new UserController_1.UserController();
class Server {
    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }
    config() {
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        this.app.listen(process.env.PORT || 3004);
    }
    routes() {
        const router = express.Router();
        this.app.use('/', router);
        this.app.use('/users', userController.router);
    }
}
exports.default = new Server().app;
