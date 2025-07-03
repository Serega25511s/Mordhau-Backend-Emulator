const path = require('path')
const fs = require("fs");
const {gen} = require("fastify-sslgen");
const fastify = require('fastify')({logger:true})
const config = require("./config.json");


module.exports.Init = function (callback) {
    fastify.register(require("@fastify/cors"), {
        origin: "*",
        methods: ["GET"]
    });

    fs.readdirSync("./Api").forEach(file => {
        fastify.register(require("./Api/" + file));
    })

    fastify.listen(config.apiPort, "0.0.0.0", () => {
        callback();
    });


}