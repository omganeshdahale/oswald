module.exports = {
	name: "unmute",
	description: "Unmute Specified User.",
	usage: "+unmute <mention user>",
	execute(message, args, Discord, db) {
		if (!message.member.hasPermission("MUTE_MEMBERS")) {
			return message.reply(":no_entry_sign: You do not have Permission: `MUTE_MEMBERS`.");
		}
		else if (!message.mentions.members.size) {
			return message.channel.send("Please Mention a User as argument.");
		}

		const member = message.mentions.members.first();
		if (message.member.roles.highest.position < member.roles.highest.position) {
			return message.channel.send(":no_entry_sign: You can't Unmute someone with higher role position.");
		}

		db.get("SELECT muteRoleId FROM config WHERE serverid = ?", [message.guild.id], (err, row) => {
			const muteRoleId = row.muteRoleId;
			if (!muteRoleId) {
				message.channel.send("Mute Role not configured.");
				return;
			}
			const muteRole = message.guild.roles.cache.get(muteRoleId);
			if (!muteRole) {
				message.channel.send("Configured Mute Role has been deleted.\nPlease configure a new Mute Role.");
				return;
			}

			member.roles.remove(muteRole)
			.then(() => {
				message.channel.send(`:loud_sound: Unmuted \`${member.user.tag}\`.`);

				db.get("SELECT doLogs, logsChannelId FROM config WHERE serverid = ?", [member.guild.id], (err, row) => {
					if (err) {
						return console.error(err);
					}
					if (row) {
						if (row.doLogs === "on") {
							const channel = message.member.guild.channels.cache.get(row.logsChannelId);
							if (channel) {
								const embed = new Discord.MessageEmbed();
								embed.setColor("#46B67B")
								.setAuthor(member.user.username, member.user.displayAvatarURL())
								.setDescription(`${member.user.tag} is **Unmuted**\nBy **${message.member.user.tag}**.`);
								
								channel.send(embed).catch(console.error);
							}
						}
					}
				});
			}).catch(console.error);

		});
	}
}