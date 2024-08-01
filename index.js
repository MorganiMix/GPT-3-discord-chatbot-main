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

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return
//    if (message.channel.id !== BOT_CHANNEL) return

    console.log(message.content)
    message.channel.sendTyping()

    console.log("cp1")

    let messages = Array.from(await message.channel.messages.fetch({
        limit: PAST_MESSAGES,
        before: message.id
    }))
    messages = messages.map(m=>m[1])
    messages.unshift(message)

    console.log("cp2")

    let users = [...new Set([...messages.map(m=> m.member.displayName), client.user.username])]

    console.log("cp3")

    let lastUser = users.pop()

    console.log("cp4")

    let prompt = `The following is a conversation between ${users.join(", ")}, and ${lastUser}. \n\n`

    console.log("cp5")

    for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i]
        prompt += `${m.member.displayName}: ${m.content}\n`
    }
    prompt += `${client.user.username}:`
    console.log("prompt:", prompt)



    const response = await openai.createCompletion({
        prompt,
        model: "gpt-3.5-turbo-instruct",
        max_tokens: 5000,
        stop: ["\n"]
    })



    console.log("response", response.data.choices[0].text)
    await message.channel.send(response.data.choices[0].text)
})
