module.exports = {
	name: "oswaldlogs",
	description: "Enable/Disable Oswald logs.",
	usage: "+config oswaldlogs <on or off>",
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

		const doLogs = args.shift();
		const logsChannelId = message.channel.id;

		db.get("SELECT serverid FROM config WHERE serverid = ?", [message.guild.id], (err, row) => {
			if (err) {
				return console.error(err);
			}
			else if (row) {
				db.run("UPDATE config SET doLogs = ? , logsChannelId = ? WHERE serverid = ?", [doLogs, logsChannelId, message.guild.id], err => {
					if (err) {
						return console.log(err);
					}
					message.channel.send(`Configured Logs Settings.`);
					console.log(`updated doLogs (${doLogs}), logsChannelId (${logsChannelId}) for guild (${message.guild.id})`);
				});
				return;
			}
			db.run("INSERT INTO config(serverid, doLogs, logsChannelId) VALUES( ? , ? , ? )", [message.guild.id, doLogs, logsChannelId], err => {
				if (err) {
					return console.log(err);
				}
				message.channel.send(`Configured Join Role Settings.`);
				console.log(`updated doLogs (${doLogs}), logsChannelId (${logsChannelId}) for guild (${message.guild.id})`);
			});
		});
	}
}