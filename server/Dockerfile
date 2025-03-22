FROM node:16

WORKDIR /server

# Устанавливаем зависимости
COPY package.json package-lock.json ./
RUN npm install

# Копируем исходный код
COPY . .

# Указываем, что используем ES-модули
ENV NODE_ENV=production
ENV NODE_OPTIONS="--experimental-vm-modules"

EXPOSE 3000

CMD ["node", "api.js"]