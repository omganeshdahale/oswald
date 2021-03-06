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
	db.run("CREATE TABLE IF NOT EXISTS config(serverid TEXT NOT NULL, prefix TEXT)");
	
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
	const prefix = prefixCache[message.guild.id] || PREFIX;
	if (!message.content.startsWith(prefix) || message.author.bot) {
		return;
	}

	const args = message.content.slice(PREFIX.length).split(" ");
	const command = args.shift().toLowerCase();

	if (command === "ping") {
		client.commands.get("ping").execute(message, args, client);
	}
	else if (command === "invite") {
		client.commands.get("invite").execute(message, args, Discord, client, config);
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