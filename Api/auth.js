const axios = require("axios");
const { Users, Inventors } = require("../db");
const fs = require("fs");

const STEAM_API_KEY = "D1BAB58EDEBE08D06ABAF7CE57F6268C";
const STEAM_APP_ID = "480";
const CATALOG_PATH = "Catalog.json";

function makeid(length, useLowercase) {
  const chars = useLowercase
    ? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    : "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function getNextClientId() {
  const lastUser = await Users.find({}).sort({ _id: -1 }).limit(1).next();
  return lastUser ? lastUser.id + 1 : 1;
}

async function getSteamIdByTicket(ticket) {
  const response = await axios.get(
    "https://community.steam-api.com/ISteamUserAuth/AuthenticateUserTicket/v1/",
    {
      params: { key: STEAM_API_KEY, appid: STEAM_APP_ID, ticket },
    }
  );
  return response.data?.response?.params?.steamid;
}

async function getSteamProfile(steamid) {
  const response = await axios.get(
    "https://community.steam-api.com/ISteamUser/GetPlayerSummaries/v2/",
    {
      params: { key: STEAM_API_KEY, steamids: steamid },
    }
  );
  const player = response.data?.response?.players?.[0];
  return {
    username: player?.personaname || "",
    avatar: player?.avatar || "",
  };
}

function generateSessionTicket(playFabId, one, two) {
  return `${playFabId}--E524B3C4EA184B83-12D56-${one}-${two}=`;
}

function loadCatalogInventory() {
  if (!fs.existsSync(CATALOG_PATH)) return [];
  const data = fs.readFileSync(CATALOG_PATH, "utf8");
  try {
    const catalog = JSON.parse(data);
    return catalog["Inventory"] || [];
  } catch {
    return [];
  }
}

async function updateUser({ steamid, ip, username, avatar, sessionTicket, entityId, id, playFabId }) {
  await Users.updateOne(
    { steamid },
    {
      $set: { ip, username, avatar, ticket: sessionTicket },
      $setOnInsert: { entityid: entityId, id, playfabid: playFabId, steamid },
      $inc: { loginCount: 1 },
    },
    { upsert: true }
  );
}

async function updateInventory({ steamid, ip, sessionTicket, id, inventory }) {
  await Inventors.updateOne(
    { steamid },
    {
      $set: { ip, ticket: sessionTicket },
      $setOnInsert: {
        id,
        steamid,
        Inventory: inventory,
        VirtualCurrency: { GD: 500000, XP: 500000 },
      },
    },
    { upsert: true }
  );
}

async function routes(fastify) {
  fastify.post("/Client/LoginWithSteam", async (request, reply) => {
    try {
      const playFabId = makeid(16, false);
      const entityId = makeid(16, false);
      const one = makeid(15, true);
      const two = makeid(43, true);
      const ip = request.ip;
      const ticket = request.body["SteamTicket"];

      const steamid = await getSteamIdByTicket(ticket);
      if (!steamid) return reply.code(400).send({ code: 400, status: "Invalid Steam ticket" });

      const { username, avatar } = await getSteamProfile(steamid);

      const sessionTicket = generateSessionTicket(playFabId, one, two);
      const id = await getNextClientId();

      await updateUser({ steamid, ip, username, avatar, sessionTicket, entityId, id, playFabId });
      const inventory = loadCatalogInventory();
      await updateInventory({ steamid, ip, sessionTicket, id, inventory });

      const user = await Users.findOne({ steamid });
      if (!user) return reply.code(500).send({ code: 500, status: "User not found after update" });

      return reply.send({
        code: 200,
        status: "OK",
        data: {
          SessionTicket: user.ticket,
          PlayFabId: user.playfabid,
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
              Id: user.entityid,
              Type: "title_player_account",
              TypeString: "title_player_account",
              IsTitle: false,
              IsNamespace: false,
              IsService: false,
              IsMasterPlayer: false,
              IsTitlePlayer: true,
            },
          },
          TreatmentAssignment: {
            Variants: [],
            Variables: [],
          },
        },
      });
    } catch (err) {
      console.error("LoginWithSteam error:", err);
      return reply.code(500).send({ code: 500, status: "Internal server error" });
    }
  });
}

module.exports = routes;