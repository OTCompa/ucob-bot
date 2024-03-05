const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('baits')
		.setDescription('Responds with the COB Enjoyers certified Flourishing Sorrow Liquid Hell baits guide'),
	async execute(interaction) {
		await interaction.reply('Baiting liquid hells properly in Twin/Adds - https://youtu.be/9DDTla_pbL0?si=DsVzGbXqtQBZWWUd');
	},
};