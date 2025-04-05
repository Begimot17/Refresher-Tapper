FROM node:16

WORKDIR /server

# Устанавливаем зависимости
COPY package.json package-lock.json ./
RUN npm install

# Устанавливаем nodemon глобально
RUN npm install -g nodemon

# Копируем исходный код
COPY . .

# Указываем, что используем ES-модули
ENV NODE_ENV=development
ENV NODE_OPTIONS="--experimental-vm-modules"

EXPOSE 3000

# Используем nodemon для автоматической перезагрузки
CMD ["nodemon", "--legacy-watch", "api.js"]