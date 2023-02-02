// ==UserScript==
// @name        Shitscript
// @include     /^https:\/\/(canary\.)?discord\.com\//
// @inject-into page
// @run-at      document-start
// @grant       GM_notification
// ==/UserScript==




const AUTH_TOKEN = localStorage.getItem("token").replace(/"/g, "");


async function ajax(path, {headers, body, json, ...options} = {}) {
    const response = await fetch(`/api${path}`, {
        headers: {
            "Authorization": AUTH_TOKEN,
            "Content-Type":  json ? "application/json" : undefined,

            ...headers
        },

        body: json ? JSON.stringify(json) : body,

        ...options
    });

    if (!response.ok)
        throw new Error((await response.json()).message);

    return response;
}

function notify(text, options) {
    GM_notification({text, title: "Shitscript", ...options});
}


function getCurrentGuildId() {
    const result = location.pathname.split("/")[2];
    if (result === "@me") throw new Error("uckf shti ispss");

    return result;
}

function getCurrentChannelId() {
    return location.pathname.split("/")[3];
}

function getMessageId($message) {
    return $message.dataset["listItemId"].match(/-(\d+)$/)[1];
}

function getMessageAuthorId($message) {
    throw new Error("NOT IMPLEMENTED");
}


async function deleteMessage($message) {
    const channelId = getCurrentChannelId();
    const messageId = getMessageId($message);

    await ajax(
        `/channels/${channelId}/messages/${messageId}`,
        {method: "DELETE"}
    );
}

async function lynchAuthor($message) {
    const guildId = getCurrentGuildId();
    const userId  = getMessageAuthorId($message);

    await ajax(`/guilds/${guildId}/bans/${userId}`, {
        method:  "PUT",
        headers: {"X-Audit-Log-Reason": "-Lynched-"},
        json:    {"delete_message_days": "7"}
    });
}




document.addEventListener("click", async e => {
    try {
        if (!e.altKey) return;

        const $message = e.target.closest(".message-2CShn3");
        if (!$message) return;

        if (!e.shiftKey) await deleteMessage($message);
        else             await lynchAuthor($message);
    }
    catch (err) { notify(err.message); }
});
