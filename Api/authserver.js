const axios = require("axios");
const { Servers } = require("../db");

function makeId(length, useLowercase) {
  const chars = useLowercase
    ? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    : "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function getNextServerId() {
  const lastServer = await Servers.find({}).sort({ _id: -1 }).limit(1).next();
  return lastServer ? lastServer.id + 1 : 1;
}

function generateSessionTicket(playFabId, one, two) {
  return `${playFabId}--E524B3C4EA184B83-12D56-${one}-${two}=`;
}

async function routes(fastify) {
  fastify.post("/Client/LoginWithCustomID", async (request, reply) => {
    try {
      const playFabId = makeId(16, false);
      const entityId = makeId(16, false);
      const one = makeId(15, true);
      const two = makeId(43, true);
      const ip = request.ip;
      const customId = (request.body["CustomId"] || "").replace("Steam;", "");
      const id = await getNextServerId();

      await Servers.updateOne(
        { customid: customId },
        {
          $set: { ip, entityid: entityId },
          $setOnInsert: { id, playfabid: playFabId, customid: customId },
          $inc: { loginCount: 1 },
        },
        { upsert: true }
      );

      const server = await Servers.findOne({ customid: customId });
      if (!server) return reply.code(500).send({ code: 500, status: "Server not found after update" });

      return reply.send({
        code: 200,
        status: "OK",
        data: {
          SessionTicket: generateSessionTicket(server.playfabid, one, two),
          PlayFabId: server.playfabid,
          NewlyCreated: false,
          SettingsForUser: {
            NeedsAttribution: false,
            GatherDeviceInfo: true,
            GatherFocusInfo: true,
          },
          LastLoginTime: "2022-05-22T17:04:47.416Z",
          EntityToken: {
            EntityToken:
              "v9NkQoxkfZDv7DSszggpVvRe5pabynjuzsP9DmVEZnqhopRK5vUKrvsjeA4Yqfq5qxf7myicxnaNbdi7zcdckyAKUng2MrabwWWqpk4ik4iipzD4KNDkoTiwx9EvVT3f4rQVTy5EY5xYuPoNp4W7LtRquezMejdVreMrTQjuRZfemkAjzoevpjaXHTSvefa4WD7redA2yo3ShzHLPuHjMQt7aswiCQDnZbwYKvUPNuNKKp9XbNFzWUtJvdVzenoXEzwQ7yHZ3qSzmZ7YK5uxZjZTyjYAJpR3hNqrTprzmF2k2dbJF3gL4TukrakCHa4fXadYDSsn7P9Azn2NYDVjaar3uHqUv3ngdJqh5WH3ZJRYWzCku2iWPiwCVHdZEHELZMVWVcS7CAbMUiK3sjPh3Te5vhnnaDJ2eMd4umkLCQK9VZguM57L7NwRaKtY5zaATdDhgwHagXzTLDas7zeUcUuDe5Kzyeuf",
            TokenExpiration: "2099-05-27T22:01:39.884Z",
            Entity: {
              Id: server.entityid,
              Type: "title_player_account",
              TypeString: "title_player_account",
            },
          },
          TreatmentAssignment: {
            Variants: [],
            Variables: [],
          },
        },
      });
    } catch (err) {
      console.error("LoginWithCustomID error:", err);
      return reply.code(500).send({ code: 500, status: "Internal server error" });
    }
  });
}

module.exports = routes;