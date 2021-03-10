module.exports = {
	name: "muterole",
	description: "Set mute role.",
	usage: "+config muterole <mention role>",
	execute(message, args, db) {
		if (!message.member.hasPermission("MANAGE_ROLES")) {
			return message.reply(":no_entry_sign: You do not have Permission: `MANAGE_ROLES`.");
		}
		else if (!message.mentions.roles.size) {
			return message.channel.send("Please Mention a Role as option argument.");
		}

		const muteRoleId = message.mentions.roles.first().id;
		db.get("SELECT serverid FROM config WHERE serverid = ?", [message.guild.id], (err, row) => {
			if (err) {
				return console.error(err);
			}
			else if (row) {
				db.run("UPDATE config SET muteRoleId = ? WHERE serverid = ?", [muteRoleId, message.guild.id], err => {
					if (err) {
						return console.log(err);
					}
					message.channel.send(`Mute Role set to Role Id: \`${muteRoleId}\`.`);
					console.log(`updated muteRoleId (${muteRoleId}) for guild (${message.guild.id})`);
				});
				return;
			}
			db.run("INSERT INTO config(serverid, muteRoleId) VALUES( ? , ?)", [message.guild.id, muteRoleId], err => {
				if (err) {
					return console.log(err);
				}
				message.channel.send(`Mute Role set to Role Id: \`${muteRoleId}\`.`);
				console.log(`updated muteRoleId (${muteRoleId}) for guild (${message.guild.id})`);
			});
		});

	}
}