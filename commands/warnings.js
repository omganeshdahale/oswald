module.exports = {
	name: "warnings",
	description: "List Warnings of Specified Member.",
	usage: "+warnings <mention user>",
	execute(message, args, Discord, db) {

		if (!message.mentions.members.size) {
			return message.channel.send("Please Mention a User as argument.");
		}

		const member = message.mentions.members.first();
		db.get("SELECT warnings FROM warning WHERE serverid = ? AND userid = ?", [message.guild.id, member.user.id], (err, row) => {
			if (err) {
				return console.error(err);
			}
			else if (row) {
				const embed = new Discord.MessageEmbed();
					embed.setColor("#FFD551")
					.setAuthor(member.user.username, member.user.displayAvatarURL())
					.setDescription(`${member.user.tag}'s Warnings`);

					if (JSON.parse(row.warnings).length) {
						for (i of JSON.parse(row.warnings)) {
							let title = new Date(i.timestamp);
							title = `\`${title.getUTCDate()}/${title.getUTCMonth()+1}/${title.getUTCFullYear()} ${title.getUTCHours()}:${title.getUTCMinutes()}\``;
							let body = `**Author**: ${i.authorTag}\n**Reason**: ${i.reason}`
							embed.addField(title, body);
						}

						return message.channel.send(embed).catch(console.error);
					}
					return message.channel.send("No Warnings Found!").catch(console.error);
			}
			message.channel.send("No Warnings Found!").catch(console.error);

		});
	}
}