const fs = require("fs");
const Discord = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
const config = require("./config.json");

const PREFIX = "+";
const db = new sqlite3.Database("./database/main.db", err => {
	if (err) {
		return console.error(err);
	}
	console.log("connected to db './database/main.db'");
});
const prefixCache = {};
const client = new Discord.Client();

db.serialize(() => {
	// create config table if not exist
	db.run("CREATE TABLE IF NOT EXISTS config(serverid TEXT NOT NULL, prefix TEXT, muteRoleId TEXT)");
	
	// loading prefix into cache
	db.each("SELECT * FROM config", [], (err, row) => {
		if (err) {
			return console.error(err);
		}
		prefixCache[row.serverid] = row.prefix;
	});
});


client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync("./commands/").filter(filename => filename.endsWith(".js"));
for (const filename of commandFiles) {
	const command = require(`./commands/${filename}`);
	client.commands.set(command.name, command);
}


client.once("ready", () => {
	console.log("Oswald is Online!");
	updateActivity();
});

client.on("message", message => {
	if (message.channel.type === "dm") {
		return;
	}

	const prefix = prefixCache[message.guild.id] || PREFIX;
	if (!message.content.startsWith(prefix) || message.author.bot) {
		return;
	}

	const args = message.content.slice(prefix.length).split(" ");
	const command = args.shift().toLowerCase();

	if (command === "ping") {
		client.commands.get("ping").execute(message, args, client);
	}
	else if (command === "invite") {
		client.commands.get("invite").execute(message, args, Discord, client, config);
	}
	else if (command === "clear") {
		client.commands.get("clear").execute(message, args);
	}
	else if (command === "help") {
		client.commands.get("help").execute(message, args, Discord, client);
	}
	else if (command === "mute") {
		client.commands.get("mute").execute(message, args, db);
	}
	else if (command === "unmute") {
		client.commands.get("unmute").execute(message, args, db);
	}
	else if (command === "kick") {
		client.commands.get("kick").execute(message, args);
	}
	else if (command === "ban") {
		client.commands.get("ban").execute(message, args);
	}
	else if (command === "config") {
		client.commands.get("config").execute(message, args, db, prefixCache);
	}

});

client.on("guildCreate", updateActivity);
client.on("guildDelete", updateActivity);

function updateActivity() {
	client.user.setActivity(`+help | ${client.guilds.cache.size} guild(s)`)
	.then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
	.catch(console.error);
}


client.login(config.BOT_TOKEN);

process.on("exit", code => {
	db.close();
	console.log("disconnected from db './database/main.db'");
	process.exit();
});
process.on("SIGINT", () => {
	process.exit();
});
process.setUncaughtExceptionCaptureCallback(e => {
	console.error(e);
	process.exit();
});