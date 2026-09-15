# Authvaultix Telegram Bot

The official Telegram management bot for the **Authvaultix** authentication and licensing platform. It provides sellers, resellers, and platform administrators with complete control over licenses, user accounts, variables, sessions, and activity logs directly from Telegram.

---

## Features

- **License Management**: Generate license keys, verify key authenticity, inspect detailed metadata, update license notes, extend expiry durations, and export keys in text/CSV format.
- **User Administration**: Create users, check user registration status, inspect user details, pause/unpause accounts, ban/unban users, manage HWID bindings, and reset HWID locks.
- **Subscription Management**: List, create, modify, pause, unpause, and delete application subscription plans.
- **Variable Management**: Create, edit, inspect, and delete both global application variables and per-user custom variables.
- **Session & Security Control**: View active real-time sessions, kill sessions by user ID or IP address, and inspect session counts.
- **Audit & Activity Logs**: View platform audit logs and clear logs by IP or in bulk with confirmation guards.
- **Reseller & Manager Control**: Create and manage reseller and manager credentials directly from chat.
- **Local SQLite Engine**: Uses Node.js native SQLite database (`node:sqlite`) for zero-dependency, crash-safe local seller key storage.
- **AES-256 Encryption**: Every seller key stored locally is encrypted with AES-256-CBC using dynamic initialization vectors (IV).

---

## Prerequisites

- **Node.js**: v22.0.0 or higher (required for native `node:sqlite`)
- **Authvaultix Backend**: Running instance of the Authvaultix Seller API
- **Telegram Bot Token**: Obtained from [@BotFather](https://t.me/BotFather)

---

## Installation

1. Clone or copy the bot directory:
   ```bash
   cd tele-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your actual settings:
   ```env
   # Telegram bot token from @BotFather
   TOKEN=your_telegram_bot_token_here

   # Authvaultix seller API URL (no trailing slash)
   BASE_URL=http://localhost/html/api/seller

   # Secret key used to encrypt seller keys in bot.db (minimum 32 characters)
   ENCRYPT_KEY=your_strong_secret_encryption_key_here
   ```

---

## Running the Bot

### Option A: Using Docker (Recommended for Production)
Ensure `.env` is configured, then start the container in the background:
```bash
docker compose up -d --build
```
To view logs:
```bash
docker compose logs -f
```
To stop the bot:
```bash
docker compose down
```

### Option B: Using Node.js Directly
```bash
npm start
```
Or run directly:
```bash
node bot.js
```

---

## Initial Setup in Telegram

1. Open your bot in Telegram and send `/start`.
2. Link your Authvaultix Seller Key:
   ```text
   /setsellerkey <your_seller_key>
   ```
   Or send `/setsellerkey` alone and reply with your key when prompted.
3. Access all available commands with `/help`.

---

## Command Reference

### License Management
| Command | Description |
| :--- | :--- |
| `/genkey` | Generate new license keys with custom expiry and amount |
| `/verifylicense` | Check license validity and usage status |
| `/licenseinfo` | View detailed license metadata |
| `/setlicensenote` | Add or update a note on a license |
| `/changesub` | Change subscription level of an existing key |
| `/extendexpiry` | Extend license expiry by days |
| `/delkey` | Delete a specific license key |
| `/delsubkeys` | Delete unused keys belonging to a subscription |
| `/exportkeys` | Export all keys |
| `/exportused` | Export only used keys |
| `/exportunused` | Export only unused keys |
| `/usedkeys` | View all used keys |
| `/deleteallused` | Delete all used licenses |
| `/deleteallunused`| Delete all unused licenses |

### User Management
| Command | Description |
| :--- | :--- |
| `/createuser` | Create a new user with subscription and expiry |
| `/userexists` | Check if a username is registered |
| `/userdata` | View user profile, subscription, and HWID |
| `/getusers` | Retrieve all registered users |
| `/getusernames` | List all usernames |
| `/pauseuser` | Temporarily pause user access |
| `/unpauseuser` | Resume paused user access |
| `/banuser` | Ban user with an optional reason |
| `/unbanuser` | Unban a user |
| `/changepassword`| Reset user password |
| `/extenduserexpiry`| Extend user expiry time |
| `/subtime` | Deduct time from user expiry |
| `/addhwid` | Manually bind HWID to user |
| `/resethwidall` | Reset HWID locks for all users |
| `/deluser` | Delete a specific user |
| `/deleteallusers`| Delete all registered users |
| `/delexpired` | Purge expired users |

### Variables
| Command | Description |
| :--- | :--- |
| `/addvar` | Create a new global variable |
| `/editvar` | Update a global variable value |
| `/retrvvar` | Retrieve a specific global variable |
| `/fetchallvars` | List all global variables |
| `/delvar` | Delete a global variable by key |
| `/delallvars` | Delete all global variables |
| `/setvar` | Create/modify a per-user custom variable |
| `/edituservar` | Update a specific user's custom variable |
| `/fetchauservars`| Retrieve all variables for a user |
| `/deluservar` | Delete a user's custom variable |
| `/deletealluservars`| Delete all custom variables for a user |

### Subscriptions
| Command | Description |
| :--- | :--- |
| `/listsubs` | List all application subscription tiers |
| `/createsub` | Create a new subscription tier |
| `/editsub` | Update subscription name or level |
| `/pausesub` | Pause an entire subscription tier |
| `/unpausesub` | Resume a paused subscription tier |
| `/delsub` | Delete a subscription tier |

### Sessions & Logs
| Command | Description |
| :--- | :--- |
| `/activecount` | View active online user session count |
| `/getsessions` | List active sessions |
| `/endsession` | Terminate a specific session |
| `/endallsessions`| Terminate all active sessions |
| `/killsessionsip`| Kill sessions originating from an IP |
| `/getlogs` | View recent system audit logs |
| `/clearlogs` | Purge all audit logs |
| `/clearlogsip` | Delete audit logs for a specific IP |

---

## Security Architecture

- **Zero Plaintext Storage**: User seller keys are never saved in plaintext.
- **AES-256-CBC Encryption**: Keys are encrypted with standard AES-256-CBC before hitting the disk.
- **Per-Encryption Random IVs**: Each encryption generates a fresh 16-byte cryptographically secure random IV via `crypto.randomBytes(16)`.
- **Zero External DB Dependencies**: Uses Node's built-in SQLite engine to ensure zero native build issues or external database servers to manage for the bot process itself.

---

## License

This project is part of the **Authvaultix** organization. Distributed under the **Elastic License 2.0**. See [LICENSE.txt](LICENSE.txt) for details.
