const fs = require("fs");
const Discord = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
const config = require("./config.json");

const PREFIX = "+";
const JOIN_MSG = "$user joined the server!";

const db = new sqlite3.Database("./database/main.db", err => {
	if (err) {
		return console.error(err);
	}
	console.log("connected to db './database/main.db'");
});
const prefixCache = {};
const client = new Discord.Client();

db.serialize(() => {
	// create table if not exist
	db.run("CREATE TABLE IF NOT EXISTS config(serverid TEXT NOT NULL, prefix TEXT, muteRoleId TEXT, doJoinMsg TEXT, joinMsgChannelId TEXT, joinMsg TEXT, doJoinRole TEXT, joinRoleId TEXT, doLogs TEXT, logsChannelId TEXT)");
	db.run("CREATE TABLE IF NOT EXISTS warning(serverid TEXT NOT NULL, userid TEXT NOT NULL, warnings TEXT)");

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

client.on("guildMemberAdd", member => {
	db.get("SELECT doJoinMsg, joinMsgChannelId, joinMsg, doJoinRole, joinRoleId, doLogs, logsChannelId FROM config WHERE serverid = ?", [member.guild.id], (err, row) => {
		if (err) {
			return console.error(err);
		}
		else if (row) {
			if (row.doJoinMsg === "on") {
				const channel = member.guild.channels.cache.get(row.joinMsgChannelId);
				if (channel) {
					let msg = row.joinMsg || JOIN_MSG;
					msg = msg.replace(/\$user/g, `<@${member.user.id}>`);
					channel.send(msg).catch(console.error);
				}
			}
			if (row.doJoinRole === "on") {
				const role = member.guild.roles.cache.get(row.joinRoleId);
				if (role) {
					member.roles.add(role).catch(console.error);
				}
			}
			if (row.doLogs === "on") {
				const channel = member.guild.channels.cache.get(row.logsChannelId);
				if (channel) {
					const date = member.user.createdAt;
					const embed = new Discord.MessageEmbed();
					embed.setColor("#009A49")
					.setThumbnail(member.user.displayAvatarURL())
					.setTitle("Member Joined")
					.setDescription(member.user.tag)
					.addFields(
						{name: "Account Created on", value: `(UTC DD/MM/YYYY)\n${date.getUTCDate()}/${date.getUTCMonth()}/${date.getUTCFullYear()}`},
						{name: "Bot Account", value: member.user.bot}
					);
					
					channel.send(embed).catch(console.error);
				}
			}
		}
	});
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
		client.commands.get("mute").execute(message, args, Discord, client, db);
	}
	else if (command === "unmute") {
		client.commands.get("unmute").execute(message, args, Discord, db);
	}
	else if (command === "kick") {
		client.commands.get("kick").execute(message, args, Discord, db);
	}
	else if (command === "ban") {
		client.commands.get("ban").execute(message, args, Discord, db);
	}
	else if (command === "config") {
		client.commands.get("config").execute(message, args, db, prefixCache);
	}
	else if (command === "warn") {
		client.commands.get("warn").execute(message, args, Discord, db);
	}
	else if (command === "warnings") {
		client.commands.get("warnings").execute(message, args, Discord, db);
	}
	else if (command === "clearwarn") {
		client.commands.get("clearwarn").execute(message, args, db);
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