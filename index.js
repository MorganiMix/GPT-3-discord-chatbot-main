const { Client, Events, GatewayIntentBits } = require("discord.js")
require("dotenv/config")
const { OpenAIApi, Configuration } = require("openai")

const config = new Configuration({
    apiKey: process.env.OPENAI_KEY
})

const openai = new OpenAIApi(config)

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

client.once(Events.ClientReady, (clientUser) => {
    console.log(`Logged in as ${clientUser.user.tag}`)
})

client.login(process.env.BOT_TOKEN)

const BOT_CHANNEL = "1011138864011808878"
const PAST_MESSAGES = 5
const BOT_ID = "1075691829858668557"

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return
//    if (message.channel.id !== BOT_CHANNEL) return

    console.log(message.content)
    message.channel.sendTyping()

    let messages = Array.from(await message.channel.messages.fetch({
        limit: PAST_MESSAGES,
        before: message.id
    }))
    messages = messages.map(m=>m[1])
    messages.unshift(message)

    let users = [...new Set([...messages.filter(m => m.member && m.member.displayName).map(m => m.member.displayName), client.user.username])]

    let lastUser = users.pop()

    let prompt = `The following is a conversation between ${users.join(", ")}, and ${lastUser}. \n\n`

    for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i]
        if (m.member && m.member.displayName) prompt += `${m.member.displayName}: ${m.content}\n`
    }

    prompt += `${client.user.username}:`
    console.log("prompt:", prompt)

    let flag = message.content.includes(BOT_ID)
    console.log("bot_id.flag",BOT_ID,flag)
    if (!flag) return

    const response = await openai.createCompletion({
        prompt,
        model: "gpt-3.5-turbo-instruct",
        max_tokens: 1000,
        stop: ["\n"]
    })

    console.log("response", response.data.choices[0].text)
    await message.channel.send(response.data.choices[0].text)
})
