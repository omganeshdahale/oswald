module.exports = {
	name: "clear",
	description: "Clear bulk messages.",
	execute(message, args) {
		if (!message.member.hasPermission("MANAGE_MESSAGES")) {
			return message.reply(":no_entry_sign: You do not have Permission: `MANAGE_MESSAGES`.");
		}
		else if (!args.length || isNaN(args[0]) || args[0] > 99 || args[0] < 1) {
			return message.channel.send(":no_entry_sign: Please Provide a Valid argument:\n`+clear <number x | 0 < x < 100>`.");
		}

		message.channel.bulkDelete(parseInt(args[0], 10)+1, true)
		.then(collection => {
			message.channel.send(`:white_check_mark: Deleted \`${collection.size}\` Message(s).`)
			.then(message => {
				message.delete({timeout: 3000})
			}).catch(console.error);
		}).catch(console.error);
	}
}