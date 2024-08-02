FROM node:17-alpine

WORKDIR /app

COPY . .

RUN npm init -y

RUN npm i discord.js dotenv openai

CMD ["node", "index.js"]