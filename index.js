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


client.login(config.BOT_TOKEN);