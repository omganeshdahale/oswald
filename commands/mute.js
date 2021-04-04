module.exports = {
	name: "mute",
	description: "Mute Specified User.",
	usage: "+mute <mention user> [time]",
	execute(message, args, Discord, client, db) {
		if (!message.member.hasPermission("MUTE_MEMBERS")) {
			return message.reply(":no_entry_sign: You do not have Permission: `MUTE_MEMBERS`.");
		}
		else if (!message.mentions.members.size) {
			return message.channel.send("Please Mention a User as argument.");
		}

		const member = message.mentions.members.first();
		if (message.member.roles.highest.position < member.roles.highest.position) {
			return message.channel.send(":no_entry_sign: You can't Mute someone with higher role position.");
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

			member.roles.add(muteRole)
			.then(() => {
				if (args.length >= 2) {
					const n = toMs(args[args.length-1]);
					if (!isNaN(n)) {
						setTimeout(() => {
							member.roles.remove(muteRole);

							db.get("SELECT doLogs, logsChannelId FROM config WHERE serverid = ?", [member.guild.id], (err, row) => {
								if (err) {
									return console.error(err);
								}
								if (row) {
									if (row.doLogs === "on") {
										log(message, member, row, Discord, "#46B67B", `${member.user.tag} is **Unmuted**\nBy **${client.user.tag}**.`);
									}
								}
							});
						}, n);

						message.channel.send(`:mute: Muted \`${member.user.tag}\` for \`${args[args.length-1]}\`.`);

						db.get("SELECT doLogs, logsChannelId FROM config WHERE serverid = ?", [member.guild.id], (err, row) => {
							if (err) {
								return console.error(err);
							}
							if (row) {
								if (row.doLogs === "on") {
									log(message, member, row, Discord, "#FFA500", `${member.user.tag} is **Muted** for \`${args[args.length-1]}\`\nBy **${message.member.user.tag}**.`);
								}
							}
						});
						return;
					}
				}
				message.channel.send(`:mute: Muted \`${member.user.tag}\`.`);

				db.get("SELECT doLogs, logsChannelId FROM config WHERE serverid = ?", [member.guild.id], (err, row) => {
					if (err) {
						return console.error(err);
					}
					if (row) {
						if (row.doLogs === "on") {
							log(message, member, row, Discord, "#FFA500", `${member.user.tag} is **Muted**\nBy **${message.member.user.tag}**.`);
						}
					}
				});
			}).catch(console.error);

		});
	}
}

function toMs(str) {
	const n = parseFloat(str);
	if (isNaN(n)) {
		return null;
	}
	else if (str.endsWith("s")) {
		return n * 1000;
	}
	else if (str.endsWith("m")) {
		return n * 1000 * 60;
	}
	else if (str.endsWith("h")) {
		return n * 1000 * 60 * 60;
	}
	else if (str.endsWith("d")) {
		return n * 1000 * 60 * 60 * 24;
	}
	else {
		return null;
	}
}

function log(message, member, row, Discord, color, desc) {
	const channel = message.member.guild.channels.cache.get(row.logsChannelId);
		if (channel) {
			const embed = new Discord.MessageEmbed();
			embed.setColor(color)
			.setAuthor(member.user.username, member.user.displayAvatarURL())
			.setDescription(desc);
			
			channel.send(embed).catch(console.error);
		}
}