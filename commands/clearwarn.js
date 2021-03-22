module.exports = {
	name: "clearwarn",
	description: "Clear All Warnings of Specified User.",
	usage: "+clearwarn <mention user>",
	execute(message, args, db) {

		if (!message.mentions.members.size) {
			return message.channel.send("Please Mention a User as argument.");
		}

		const member = message.mentions.members.first();
		db.run("UPDATE warning SET warnings = \"[]\" WHERE serverid = ? AND userid = ?", [message.guild.id, member.user.id], (err, row) => {
			if (err) {
				return console.error(err);
			}
			message.channel.send(`:white_check_mark: Cleared Warnings for \`${member.user.tag}\``).catch(console.error);

		});
	}
}