# Wulfram Discord status bot

Posts Wulfram3 server status to a Discord channel and updates it every 60 seconds. On restart, it looks for its existing status message among the channel's latest 50 messages.

## Run with Docker

1. Install Docker with Docker Compose support.
2. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN` and `STATUS_CHANNEL_ID`.
3. Invite your Discord bot to your server. Give it View Channel, Send Messages, Embed Links, and Read Message History permissions in the status channel.
4. From this directory, run:

```sh
docker compose up -d --build
```

View logs:

```sh
docker compose logs -f bot
```

Stop:

```sh
docker compose down
```

The bot needs outbound HTTPS access to Discord and https://wulfram3.com/api/v1/community/server. It does not need a published port or persistent volume. Run one instance per bot/status channel.

## Docker without Compose

```sh
docker build -t wulfram-bot .
docker run -d --name wulfram-bot --init --restart unless-stopped --env-file .env wulfram-bot
```

## Run locally

Use Node.js 24, then:

```sh
npm ci
npm start
```

## Upload to GitHub

Create an empty repository on GitHub, then upload the files in this directory, including `.gitignore`, `.dockerignore`, and `.env.example`. Keep the files at the repository root so Dockerfile is easy to find.

Never upload your real `.env`, Discord token, node_modules, or logs. The ignore files exclude these from Git and Docker builds. If using the GitHub website, select only the intended source/configuration files because browser uploads do not apply local Git ignore rules.

You can also initialize Git in this directory and push it to your empty repository:

```sh
git init
git add .
git commit -m "Add Wulfram status bot with Docker support"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

The Docker image contains the code and dependencies. Credentials are supplied at runtime through `.env` and are not baked into the image.
