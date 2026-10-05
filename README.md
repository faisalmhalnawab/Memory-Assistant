# Faisal PA

Private Telegram Chief of Staff backed by the OpenAI Agents SDK.

## Architecture

Telegram -> Vercel webhook -> Chief of Staff -> specialist agents

Current specialists:

- Communications
- Executive Assistant
- Knowledge and Documents
- Research Analyst
- Business and Marketing
- Technical

The manager pattern keeps the Chief of Staff in control while specialists are exposed as tools.

## Current V1

- Private Telegram webhook
- Telegram user allow-list
- Optional Telegram webhook secret verification
- Chief of Staff
- Six specialist agents
- Live web research for research, business and technical work
- Safe failure behaviour
- Setup mode that tells you your Telegram numeric user ID before AI access is enabled

## Not wired yet

The repo intentionally does not pretend these are working before credentials are present:

- Gmail read/send
- Google Calendar read/write
- Google Drive
- persistent long-term memory
- voice notes
- images/files
- approval buttons
- proactive scheduled messages

Those are the next integration layer.

## Required environment variables

Copy values from .env.example into Vercel project environment variables.

Required to answer messages:

- OPENAI_API_KEY
- TELEGRAM_BOT_TOKEN

Recommended:

- PRIMARY_MODEL
- FAST_MODEL
- TELEGRAM_ALLOWED_USER_ID
- TELEGRAM_WEBHOOK_SECRET

Do not commit real secrets to this repository.

## Telegram bootstrap

1. Create a bot with @BotFather.
2. Add TELEGRAM_BOT_TOKEN and OPENAI_API_KEY to Vercel.
3. Deploy.
4. Register the production webhook URL:
   https://YOUR_DEPLOYMENT/api/telegram
5. Message the bot once while TELEGRAM_ALLOWED_USER_ID is empty.
6. The bot will reply with your numeric Telegram user ID without running AI.
7. Add that value to TELEGRAM_ALLOWED_USER_ID and redeploy.
8. Set a random TELEGRAM_WEBHOOK_SECRET and register the webhook with the same secret token.

## Safety model

The Chief of Staff must not claim that an email, event, file, purchase, deployment or other external action happened without a real tool confirmation.

Consequential actions will be designed around explicit approval unless a narrowly scoped standing rule is later configured.
