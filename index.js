import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

app.post("/dm", async (req, res) => {
  const { discordId, message } = req.body;

  if (!discordId || !message)
    return res.status(400).json({ ok: false, error: "Missing parameters" });

  try {
    // Create DM channel
    const dm = await fetch("https://discord.com/api/v10/users/@me/channels", {
      method: "POST",
      headers: {
        "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ recipient_id: discordId })
    });

    const dmData = await dm.json();

    if (!dm.ok)
      return res.status(500).json({ ok: false, error: dmData.message });

    // Send message
    const send = await fetch(`https://discord.com/api/v10/channels/${dmData.id}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content: message })
    });

    const sendData = await send.json();

    if (!send.ok)
      return res.status(500).json({ ok: false, error: sendData.message });

    res.json({ ok: true, sent: true, discordId });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/", (_, res) => res.send("Relay running!"));

app.listen(10000, () => console.log("Relay online on port 10000"));
