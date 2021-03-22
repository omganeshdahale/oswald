module.exports = {
	name: "warn",
	description: "Warn specified user.",
	usage: "+warn <mention user> <reason>",
	execute(message, args, Discord, db) {
		if (!message.member.hasPermission("BAN_MEMBERS")) {
			return message.reply(":no_entry_sign: You do not have Permission: `BAN_MEMBERS`.");
		}
		else if (!message.mentions.members.size) {
			return message.channel.send("Please Mention a User as argument.");
		}

		const member = message.mentions.members.first();
		if (message.member.roles.highest.position < member.roles.highest.position) {
			return message.channel.send(":no_entry_sign: You can't Warn someone with higher role position.");
		}
		args.shift();
		const reason = args.join(" ");
		if (!reason) {
			return message.channel.send("Please Provide a Reason.");
		}

		db.get("SELECT warnings FROM warning WHERE serverid = ? AND userid = ?", [message.guild.id, member.user.id], (err, row) => {
			if (err) {
				return console.error(err);
			}
			else if (row) {
				const warnings = JSON.parse(row.warnings);
				const warning = {
					authorTag: message.member.user.tag,
					timestamp: Date.now(),
					reason
				}
				warnings.push(warning);
				db.run("UPDATE warning SET warnings = ? WHERE serverid = ? AND userid = ?", [JSON.stringify(warnings), message.guild.id, member.user.id], err => {
					if (err) {
						return console.error(err);
					}
					message.channel.send(`:warning: Warned \`${member.user.tag}\`.`);
					log(message, member, reason, Discord, db);
				});
				return;
			}
			const warnings = [];
			const warning = {
				authorTag: message.member.user.tag,
				timestamp: Date.now(),
				reason
			}
			warnings.push(warning);
			db.run("INSERT INTO warning(warnings , serverid , userid) VALUES(? , ? , ?)", [JSON.stringify(warnings), message.guild.id, member.user.id], err => {
					if (err) {
						return console.error(err);
					}
					message.channel.send(`:warning: Warned \`${member.user.tag}\`.`);
					log(message, member, reason, Discord, db);
				});

		});
	}
}

function log(message, member, reason, Discord, db) {
	db.get("SELECT doLogs, logsChannelId FROM config WHERE serverid = ?", [member.guild.id], (err, row) => {
		if (err) {
			return console.error(err);
		}
		if (row) {
			if (row.doLogs === "on") {
				const channel = message.member.guild.channels.cache.get(row.logsChannelId);
				if (channel) {
					const embed = new Discord.MessageEmbed();
					embed.setColor("#FFD551")
					.setAuthor(member.user.username, member.user.displayAvatarURL())
					.setDescription(`${member.user.tag} has been **Warned**\nBy **${message.member.user.tag}**.\nReason: \`${reason}\``);

					channel.send(embed).catch(console.error);
				}
			}
		}
	});
}