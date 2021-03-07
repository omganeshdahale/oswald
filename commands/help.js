module.exports = {
	name: "help",
	description: "Show help Menu.",
	usage: "+help [command]",
	execute(message, args, Discord, client) {
		if (!args.length) {
			const embed = new Discord.MessageEmbed();
			embed.setColor("#181818")
			.setTitle("Help Menu")
			.setDescription("Do `+help <command>` to get help on specific command.");

			let cmds = "";
			for (const c of client.commands) {
				cmds += `\`${c[0]}\`\n`;
			}
			embed.addField("Commands", cmds);

			message.channel.send(embed);
		}
		else if (client.commands.has(args[0])) {
			const embed = new Discord.MessageEmbed();
			const cmd = client.commands.get(args[0]);

			embed.setColor("#181818")
			.setTitle(cmd.name)
			.setDescription(cmd.description);

			embed.addField("Usage", `\`${cmd.usage}\``);

			message.channel.send(embed);
		}
		else {
			message.channel.send(`:no_entry_sign: No such command: \`${args[0]}\`.`);
		}
	}
}