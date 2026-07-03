# UCoB Bot
Personal bot for a server dedicated to UCoB.
Run `node deploy-commands.js` after adding a command to update the command list, then run the bot.

## Honeypot
Set `honeypotChannelId` in `config.json` to the ID of a channel that regular users have no reason to post in. Anyone who posts there is soft banned: banned with `honeypotDeleteSeconds` (default 7 days) of their messages deleted, then immediately unbanned. Members with Ban Members permission, anyone with a role listed in `honeypotExemptRoleIds`, and anyone the bot can't ban (higher role) are ignored. Leave `honeypotChannelId` empty to disable.

Requirements:
- The bot needs the **Ban Members** permission, and its role must be above the roles of users it should catch.
- No privileged intents are needed (the message content is never read, only the channel it was posted in).

## Running on a VPS
Use the included systemd unit instead of `service.sh`:

```sh
sudo cp ucob-bot.service /etc/systemd/system/
# edit User/WorkingDirectory/ExecStart paths to match your setup
sudo systemctl daemon-reload
sudo systemctl enable --now ucob-bot
```

The unit restarts the bot automatically if it crashes and logs to journald (`journalctl -u ucob-bot -f`).