"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../utility/db");
const config_1 = require("../config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cn = db_1.default;
let otpNum;
class UserController {
    constructor() {
        this.router = express_1.Router();
        this.routes();
    }
    routes() {
        this.router.get('/login', this.checkAndSaveUser);
        this.router.post('/verify', this.verifyToken);
        this.router.get('/verifyEmail', this.verifyEmail);
        this.router.post('/registerUser', this.registerNewUser);
    }
    verifyEmail(req, res) {
        console.log('request email is' + req.query.email);
        if (!req.query.email)
            return res.status(500).send({ auth: false, message: 'Invalid Email' });
        let smtpTransport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            service: "Gmail",
            auth: {
                type: 'OAuth2',
                user: "mobdev123@gmail.com",
                password: "#Ext@2017",
                clientId: "308386072692-5ovrhbrf3od4i938qo6dchbipo71p1lu.apps.googleusercontent.com",
                clientSecret: "t_Z5AgUDIpIgD4spJIe0jz7u",
                refreshToken: '1/UToVD7wR43nzDbbJnI7MTo_inSomvSoXbeLdQJdL5_0',
                accessToken: 'ya29.GluaBiLi1ulqPVp5_toV3GeZnqW6wupFP33QxCua-K1qXW97NsrfUeEqmmCtvG3Dl9O74V-UFWUHUw1DmKB2LRyq4KwF4QZHYYb6ykGF0o9bvzlH86_kz7WTkPn_'
            }
        });
        otpNum = Math.floor((Math.random() * 99999) + 10000);
        let mailOptions = {
            from: "Event Manager",
            to: req.query.email,
            subject: "Please confirm your Email account",
            html: "Hello,<br> Please verify your OTP.<br>" + otpNum
        };
        smtpTransport.sendMail(mailOptions, function (err, response) {
            if (err) {
                console.log(err);
                res.send({ auth: false, message: 'Failed to send mail' });
            }
            else {
                console.log(response);
                res.send({ auth: true, message: 'Email Sent' });
            }
        });
    }
    ;
    registerNewUser(req, res) {
        console.log(req.body);
        let requestedEmail = req.body.email;
        let query = "SELECT Id,FirstName,LastName,Email,Password FROM Users WHERE Email = '" + requestedEmail + "'";
        db_1.default.query(query, requestedEmail, function (r, records, m) {
            console.log(records);
            if (records && records.length > 0) {
                res.status(500).send({ auth: false, message: 'Email already registered' });
            }
            else {
                if (!req.body.otpNum)
                    return res.status(500).send({ auth: false, message: 'No OTP found' });
                var otp = req.body.otpNum;
                console.log('saved OTP', otp, 'recieved otp ', otpNum);
                var date = new Date(req.body.dob);
                if (otpNum == otp) {
                    let password = req.body.password;
                    bcrypt.hash(password, 3, function (error, hash) {
                        if (error) {
                            res.send({ auth: false, message: 'failed to create hash pwd' });
                        }
                        else {
                            console.log(hash);
                            let insertProcedure = "CALL insertUsers(?,?,?,?,?,?)";
                            db_1.default.query(insertProcedure, [req.body.firstName, req.body.lastName, hash, date, req.body.email, req.body.country], function (error, result) {
                                if (error) {
                                    console.log(error);
                                    res.send({ auth: false, message: "Failed to create user" });
                                }
                                else {
                                    console.log(result);
                                    res.send({ auth: false, message: "User inserted with hash pwd", record: result });
                                }
                            });
                        }
                    });
                }
                else {
                    return res.status(500).send({ auth: false, message: 'Invalid OTP sent' });
                }
            }
        });
    }
    verifyToken(req, res) {
        let headerToken = req.headers['access-token'];
        console.log(headerToken);
        if (headerToken) {
            jwt.verify(headerToken, config_1.default.secretKey, function (error, result) {
                if (error) {
                    res.send({ auth: false, message: 'Token Invalid' });
                }
                else {
                    res.send({ auth: true, message: "Token Valid" });
                }
            });
        }
    }
    checkAndSaveUser(req, res) {
        let email = req.query.email;
        let password = req.query.password;
        let query = "SELECT Id,FirstName,LastName,Email,Password FROM Users WHERE Email = '" + email + "'";
        db_1.default.query(query, function (r, records, m) {
            if (records && records.length > 0) {
                bcrypt.compare(password, records[0].Password, function (error, result) {
                    if (error) {
                        res.send({ auth: false, message: "Password not valid" });
                    }
                    else {
                        const token = jwt.sign({ id: records[0].Id }, config_1.default.secretKey, { expiresIn: '10800' });
                        res.send({ auth: true, message: "Password Matched", token: token, records: records });
                    }
                });
            }
            else {
                res.status(500).send({ auth: true, message: "Record not Found" });
            }
        });
    }
}
exports.UserController = UserController;
