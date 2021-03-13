const fs = require("fs");

const options = {};

const optionFiles = fs.readdirSync(process.cwd() + "/commands/config-options/").filter(filename => filename.endsWith(".js"));
for (const filename of optionFiles) {
	const option = require(process.cwd() + `/commands/config-options/${filename}`);
	options[option.name] = option;
}

let desc = "Configure bot.\nAvailable options:\n\n";
for (const key in options) {
	desc += `:link: **${options[key].name}**:\n- *${options[key].description}*\n- \`${options[key].usage}\`\n\n`
}

module.exports = {
	name: "config",
	description: desc,
	usage: "+config <option> ...<value>",
	execute(message, args, db, prefixCache) {
		if (!args.length) {
			return message.channel.send("Please provide an Option.");
		}

		const option = args.shift();

		if (option === "prefix") {
			options["prefix"].execute(message, args, db, prefixCache);
		}
		else if (option === "muterole") {
			options["muterole"].execute(message, args, db);
		}
		else if (option === "joinmsg") {
			options["joinmsg"].execute(message, args, db);
		}
		else if (option === "joinrole") {
			options["joinrole"].execute(message, args, db);
		}
		else {
			message.channel.send(`No such option: \`${option}\`.`)
		}
	}
}