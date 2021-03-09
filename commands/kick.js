module.exports = {
	name: "kick",
	description: "Kick specified user.",
	usage: "+kick <mention user> [reason]",
	execute(message, args) {
		if (!message.member.hasPermission("KICK_MEMBERS")) {
			return message.reply(":no_entry_sign: You do not have Permission: `KICK_MEMBERS`.");
		}
		else if (!message.mentions.members.size) {
			return message.channel.send("Please Mention a User as argument.");
		}

		const member = message.mentions.members.first();
		if (message.member.roles.highest.position < member.roles.highest.position) {
			return message.channel.send(":no_entry_sign: You can't Kick someone with higher role position.");
		}
		args.shift();
		const reason = args.join(" ") || "";
		member.kick(reason)
		.then(() => {
			message.channel.send(`:white_check_mark: Kicked \`${member.user.tag}\` sucessfully.`);
		})
		.catch(e => {
			message.channel.send(`:no_entry_sign: Unable to Kick \`${member.user.tag}\`.`);
		});
	}
}