FROM node:16

WORKDIR /server

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "api.js"]