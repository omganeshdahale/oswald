module.exports = {
	name: "prefix",
	description: "Set custom prefix.",
	usage: "+prefix <string>",
	execute(message, args, db, prefixCache) {
		if (!message.member.hasPermission("MANAGE_GUILD")) {
			return message.reply(":no_entry_sign: You do not have Permission: `MANAGE_GUILD`.");
		}
		else if (!args.length) {
			return message.channel.send("Please provide a prefix.");
		}
		const prefix = args[0];
		db.get("SELECT serverid FROM config WHERE serverid = ?", [message.guild.id], (err, row) => {
			if (err) {
				return console.error(err);
			}
			else if (row) {
				db.run("UPDATE config SET prefix = ? WHERE serverid = ?", [prefix, message.guild.id], err => {
					if (err) {
						return console.log(err);
					}
					prefixCache[message.guild.id] = prefix;
					message.channel.send(`Prefix set to \`${prefix}\`.`);
					console.log(`updated prefix (${prefix}) for guild (${message.guild.id})`);
				});
				return;
			}
			db.run("INSERT INTO config(serverid, prefix) VALUES( ? , ?)", [message.guild.id, prefix], err => {
				if (err) {
					return console.log(err);
				}
				prefixCache[message.guild.id] = prefix;
				message.channel.send(`Prefix set to \`${prefix}\`.`);
				console.log(`updated prefix (${prefix}) for guild (${message.guild.id})`);
			});
		});

	}
}