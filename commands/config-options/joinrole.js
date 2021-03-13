module.exports = {
	name: "joinrole",
	description: "Configure Join Role.",
	usage: "+config joinrole <on or off> [mention role]",
	execute(message, args, db) {
		if (!message.member.hasPermission("MANAGE_GUILD")) {
			return message.reply(":no_entry_sign: You do not have Permission: `MANAGE_GUILD`.");
		}
		else if (!args.length) {
			return message.channel.send("Please provide an argument `on` or `off`.");
		}
		else if (args[0] != "on" && args[0] != "off") {
			return message.channel.send(":no_entry_sign: Incorrect argument.\nPlease provide an argument `on` or `off`.");
		}

		let doJoinRole = args.shift();
		let joinRoleId = message.mentions.roles.first() && message.mentions.roles.first().id;

		db.get("SELECT joinRoleId FROM config WHERE serverid = ?", [message.guild.id], (err, row) => {
			if (err) {
				return console.error(err);
			}
			else if (row) {
				if (!joinRoleId) {
					joinRoleId = row.joinRoleId || "";
				}
				db.run("UPDATE config SET doJoinRole = ? , joinRoleId = ? WHERE serverid = ?", [doJoinRole, joinRoleId, message.guild.id], err => {
					if (err) {
						return console.log(err);
					}
					message.channel.send(`Configured Join Role Settings.`);
					console.log(`updated doJoinRole (${doJoinRole}), joinRoleId (${joinRoleId}) for guild (${message.guild.id})`);
				});
				return;
			}
			if (!joinRoleId) {
					joinRoleId = "";
				}
			db.run("INSERT INTO config(serverid, doJoinRole, joinRoleId) VALUES( ? , ? , ? )", [message.guild.id, doJoinRole, joinRoleId], err => {
				if (err) {
					return console.log(err);
				}
				message.channel.send(`Configured Join Role Settings.`);
				console.log(`updated doJoinRole (${doJoinRole}), joinRoleId (${joinRoleId}) for guild (${message.guild.id})`);
			});
		});
	}
}