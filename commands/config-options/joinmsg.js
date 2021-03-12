module.exports = {
	name: "joinmsg",
	description: "Configure Join Messages in channel the command is used.\nPlaceholders:\n$user --> <@new_user_id>",
	usage: "+config joinmsg <on or off> [string]",
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

		let doJoinMsg = args.shift();
		let channelId = message.channel.id;

		db.get("SELECT serverid, joinMsg FROM config WHERE serverid = ?", [message.guild.id], (err, row) => {
			if (err) {
				return console.error(err);
			}
			else if (row) {
				let msg = row.joinMsg || args.join(" ");
				db.run("UPDATE config SET doJoinMsg = ? , joinMsgChannelId = ? , joinMsg = ? WHERE serverid = ?", [doJoinMsg, channelId, msg, message.guild.id], err => {
					if (err) {
						return console.log(err);
					}
					message.channel.send(`Configured Join Message Settings.`);
					console.log(`updated doJoinMsg (${doJoinMsg}), joinMsgChannelId (${channelId}), joinMsg (${msg}) for guild (${message.guild.id})`);
				});
				return;
			}
			let msg = args.join(" ");
			db.run("INSERT INTO config(serverid, doJoinMsg, joinMsgChannelId, joinMsg) VALUES( ? , ? , ? , ?)", [message.guild.id, doJoinMsg, channelId, msg], err => {
				if (err) {
					return console.log(err);
				}
				message.channel.send(`Configured Join Message Settings.`);
				console.log(`updated doJoinMsg (${doJoinMsg}), joinMsgChannelId (${channelId}), joinMsg (${msg}) for guild (${message.guild.id})`);
			});
		});
	}
}