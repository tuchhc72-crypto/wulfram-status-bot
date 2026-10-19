
require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const API_URL =
    'https://wulfram3.com/api/v1/community/server';

const CHANNEL_ID = process.env.STATUS_CHANNEL_ID;
const UPDATE_INTERVAL = 60_000;

let statusMessage;

async function getServerData() {
    const response = await fetch(API_URL, {
        signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
        throw new Error(`API returned HTTP ${response.status}`);
    }

    return response.json();
}

function createEmbed(server, online = true) {
    return new EmbedBuilder()
        .setColor(online ? 0x2ecc71 : 0xe74c3c)
        .setTitle(`🎮 ${server.name || 'Wulfram3'}`)
        .setURL('https://wulfram3.com/')
        .setDescription(
            online
                ? '🟢 Server status: Online'
                : '🔴 Server status: Unreachable'
        )
        .addFields(
            {
                name: '👥 Players Online',
                value: `${server.playerCount ?? 'Unknown'} / ${server.maxPlayers ?? 'Unknown'}`,
                inline: true
            },
            {
                name: '🗺️ Current Map',
                value: server.map || 'Unknown',
                inline: true
            }
        )
        .setFooter({ text: 'Wulfram3 Live Server Status' })
        .setTimestamp();
}

async function updateStatus() {
    try {
        const server = await getServerData();
        const embed = createEmbed(server);

        if (statusMessage) {
            await statusMessage.edit({ embeds: [embed] });
        } else {
            const channel = await client.channels.fetch(CHANNEL_ID);

            if (!channel || !channel.isTextBased()) {
                throw new Error('Status channel not found or not text-based.');
            }

            // Reuse an existing status post after a bot restart.
            const messages = await channel.messages.fetch({ limit: 50 });

            statusMessage = messages.find(message =>
                message.author.id === client.user.id &&
                message.embeds.some(embed =>
                    embed.footer?.text === 'Wulfram3 Live Server Status'
                )
            );

            if (statusMessage) {
                await statusMessage.edit({ embeds: [embed] });
            } else {
                statusMessage = await channel.send({
                    embeds: [embed]
                });
            }
        }

        console.log(
            `Updated status: ${server.playerCount} players, map ${server.map}`
        );
    } catch (error) {
        console.error('Status update failed:', error.message);

        // If the API fails, mark an existing status post as unreachable.
        if (statusMessage) {
            try {
                await statusMessage.edit({
                    embeds: [
                        createEmbed({
                            name: 'Wulfram Lives - Production',
                            playerCount: 'Unknown',
                            maxPlayers: 64,
                            map: 'Unknown'
                        }, false)
                    ]
                });
            } catch (editError) {
                console.error('Could not update status message:', editError.message);
            }
        }
    }
}

client.once('ready', async () => {
    console.log(`Bot online as ${client.user.tag}`);

    if (!CHANNEL_ID) {
        console.error('Add STATUS_CHANNEL_ID to your .env file.');
        return;
    }

    await updateStatus();
    setInterval(updateStatus, UPDATE_INTERVAL);
});

client.login(process.env.DISCORD_TOKEN);
