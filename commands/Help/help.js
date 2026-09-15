module.exports = {
    name: "help",

    async run(bot, msg) {

        const chatId = msg.chat.id;

        const text = `
<b>Authvaultix Telegram Bot Command Panel</b>
Manage Licenses • Subscriptions • Variables • Logs • Users • Sessions

==============================
LICENSE MANAGEMENT
==============================
/genkey - Generate new license keys
/verifylicense - Validate license & get details
/licenseinfo - Get complete info of a license
/setlicensenote - Add or update license note
/changesub - Change license subscription
/delkey - Delete a specific key
/exportkeys - Export all keys (text/csv)
/exportused - Export used keys
/exportunused - Export unused keys
/usedkeys - Show list of used keys

==============================
DELETE LICENSES
==============================
/delsubkeys - Delete subscription keys (amount optional)
/delusedkey - Delete single used key
/delusedall - Delete all used keys of subscription
/delusedsub - Delete used keys by subscription
/deleteallused - Delete ALL used licenses
/deleteallunused - Delete ALL unused licenses
/extendexpiry - Extend license expiry by days

==============================
USER VARIABLES
==============================
/fetchauservars - Fetch all user variables
/setvar - Create/modify user variable
/edituservar - Update a user's variable
/deluservar - Delete a user's variable
/delvarname - Delete by variable name
/deletealluservars - Delete all user variables

==============================
GLOBAL VARIABLES
==============================
/addvar - Add new global variable
/editvar - Edit global variable
/retrvvar - Retrieve specific variable
/fetchallvars - Show all global variables
/delvar - Delete variable by name
/delallvars - Delete all global variables

==============================
LOG MANAGEMENT
==============================
/getlogs - Show logs
/clearlogs - Delete ALL logs (confirmation)
/clearlogsip - Delete logs by IP

==============================
SESSION MANAGEMENT
==============================
/activecount - Active session count
/getsessions - Show active sessions
/endsession - End session by ID
/endallsessions - Kill all sessions
/killsessionsip - Kill sessions by IP

==============================
SUBSCRIPTIONS
==============================
/createsub - Create new subscription
/editsub - Rename / level update
/pausesub - Pause subscription
/unpausesub - Resume subscription
/listsubs - View subscription list
/delsub - Delete subscription

==============================
RESELLERS & MANAGERS
==============================
/resellercreate - Create reseller
/reselleredit - Edit reseller
/resellerinfo - Get reseller details
/resellerlist - List all resellers
/resellerdelete - Delete reseller
/managerlist - Show all managers
/managerdelete - Delete manager

==============================
Authvaultix Platform Administration
`;

        bot.sendMessage(chatId, text, { parse_mode: "HTML" });
    }
};
