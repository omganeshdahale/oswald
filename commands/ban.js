module.exports = {
	name: "ban",
	description: "Ban specified user.",
	usage: "+Ban <mention user> [reason]",
	execute(message, args) {
		if (!message.member.hasPermission("BAN_MEMBERS")) {
			return message.reply(":no_entry_sign: You do not have Permission: `BAN_MEMBERS`.");
		}
		else if (!message.mentions.members.size) {
			return message.channel.send("Please Mention a User as argument.");
		}

		const member = message.mentions.members.first();
		if (message.member.roles.highest.position < member.roles.highest.position) {
			return message.channel.send(":no_entry_sign: You can't Ban someone with higher role position.");
		}
		args.shift();
		const reason = args.join(" ") || "";
		member.ban({reason})
		.then(() => {
			message.channel.send(`:white_check_mark: Banned \`${member.user.tag}\` sucessfully.`);
		})
		.catch(e => {
			message.channel.send(`:no_entry_sign: Unable to Ban \`${member.user.tag}\`.`);
		});
	}
}