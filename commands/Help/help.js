module.exports = {
    name: "help",

    async run(bot, msg) {

        const chatId = msg.chat.id;

        const text = `
<b>Authvaultix Telegram Bot Command Panel</b>
Manage Licenses • Subscriptions • Variables • Users • Sessions • Multi-App

==============================
APPLICATION MANAGEMENT
==============================
/setsellerkey - Add or update your seller key
/switchapp - Switch active application
/deleteapp - Remove a saved application
/myapps - View all registered applications

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
USER MANAGEMENT
==============================
/createuser - Create new user
/deleteuser - Delete a user
/deleteallusers - Delete all users
/delexpusers - Delete expired users
/banuser - Ban user
/unbanuser - Unban user
/pauseuser - Pause user
/unpauseuser - Unpause user
/changepassword - Change user password
/changeusername - Change user username
/addhwid - Add user HWID
/resethwidall - Reset all user HWIDs
/getusers - View users list
/userdata - Get user information
/userexists - Check if user exists
/subtime - Subtract user subscription time
/extenduserexpiry - Extend user subscription time
/usersubs - Retrieve user subscriptions

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
