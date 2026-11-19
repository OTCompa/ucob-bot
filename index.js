// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const { honeypotChannelId, honeypotDeleteSeconds, honeypotExemptRoleIds } = require('./config.json');
require('dotenv').config();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
	client.user.setActivity('UCoB');
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);


// Honeypot: anyone who posts in the honeypot channel gets soft banned
// (ban to delete their recent messages, then immediately unban).
const honeypotHandled = new Set();
// How far back the manual sweep looks (Discord's ban-delete can miss messages
// sent in a burst right around the ban, so we clean those up ourselves).
const SWEEP_WINDOW_MS = 30 * 60_000;

// Delete any cached messages from this user across every channel/thread the bot has seen.
async function sweepUserMessages(guild, userId) {
	const cutoff = Date.now() - SWEEP_WINDOW_MS;
	let deleted = 0;
	for (const channel of guild.channels.cache.values()) {
		if (!channel.isTextBased?.() || !channel.messages) continue;
		const targets = channel.messages.cache.filter(m => m.author?.id === userId && m.createdTimestamp >= cutoff);
		if (!targets.size) continue;
		const results = await Promise.allSettled(targets.map(m => m.delete()));
		deleted += results.filter(r => r.status === 'fulfilled').length;
	}
	return deleted;
}

client.on(Events.MessageCreate, async message => {
	if (!message.inGuild() || message.author.bot || message.webhookId) return;

	// User is mid soft ban: delete anything else they post (in any channel) right away
	if (honeypotHandled.has(message.author.id)) {
		await message.delete().catch(() => null);
		return;
	}

	if (!honeypotChannelId || message.channelId !== honeypotChannelId) return;

	const member = message.member ?? await message.guild.members.fetch(message.author.id).catch(() => null);
	if (!member) return;
	// Never act on moderators, exempt roles, or anyone the bot can't ban
	if (member.permissions.has(PermissionFlagsBits.BanMembers) || !member.bannable) return;
	if (honeypotExemptRoleIds?.some(roleId => member.roles.cache.has(roleId))) return;

	honeypotHandled.add(message.author.id);
	setTimeout(() => honeypotHandled.delete(message.author.id), 60_000);

	try {
		await member.ban({
			deleteMessageSeconds: honeypotDeleteSeconds ?? 604800,
			reason: `Honeypot: posted in #${message.channel.name}`,
		});
		await new Promise(resolve => setTimeout(resolve, 5_000));
		await message.guild.bans.remove(message.author.id, 'Honeypot soft ban (removing spam only)');
		console.log(`[HONEYPOT] Soft banned ${message.author.tag} (${message.author.id})`);

		// Double check: sweep now, then once more shortly after to catch stragglers
		const swept = await sweepUserMessages(message.guild, message.author.id);
		await new Promise(resolve => setTimeout(resolve, 15_000));
		const swept2 = await sweepUserMessages(message.guild, message.author.id);
		if (swept + swept2) console.log(`[HONEYPOT] Swept ${swept + swept2} leftover message(s) from ${message.author.tag}`);
	}
	catch (error) {
		console.error(`[HONEYPOT] Failed to soft ban ${message.author.tag}:`, error);
	}
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		}
		else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});