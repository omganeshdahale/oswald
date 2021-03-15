module.exports = {
	name: "kick",
	description: "Kick specified user.",
	usage: "+kick <mention user> [reason]",
	execute(message, args, Discord, db) {
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
			message.channel.send(`:white_check_mark: Kicked \`${member.user.tag}\` sucessfully.`).catch(console.error);

			db.get("SELECT doLogs, logsChannelId FROM config WHERE serverid = ?", [member.guild.id], (err, row) => {
				if (err) {
					return console.error(err);
				}
				if (row) {
					if (row.doLogs === "on") {
						const channel = message.member.guild.channels.cache.get(row.logsChannelId);
						if (channel) {
							const embed = new Discord.MessageEmbed();
							embed.setColor("#B80F0A")
							.setAuthor(member.user.username, member.user.displayAvatarURL());
							if (reason) {
								embed.setDescription(`${member.user.tag} has been **Kicked**\nBy **${message.member.user.tag}**.\nReason: \`${reason}\``);
							}
							else {
								embed.setDescription(`${member.user.tag} has been **Kicked**\nBy **${message.member.user.tag}**.`);
							}
							
							channel.send(embed).catch(console.error);
						}
					}
				}
			});
		})
		.catch(e => {
			message.channel.send(`:no_entry_sign: Unable to Kick \`${member.user.tag}\`.`);
		});
	}
}