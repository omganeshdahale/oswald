const fs = require("fs");
const Discord = require("discord.js");
const config = require("./config.json");

const PREFIX = "+";
const client = new Discord.Client();

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
	if (!message.content.startsWith(PREFIX) || message.author.bot) {
		return;
	}

	const args = message.content.slice(PREFIX.length).split(" ");
	const command = args.shift().toLowerCase();

	if (command === "ping") {
		client.commands.get("ping").execute(message, args, client);
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