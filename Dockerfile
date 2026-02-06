# Образ для запуска генератора ёлки и тестов (Node 20)
FROM node:20-alpine

WORKDIR /app

# Зависимости
COPY package.json package-lock.json ./
RUN npm ci

# Исходники и конфиги
COPY tsconfig.json tsconfig.build.json ./
COPY playwright.config.ts ./
COPY src ./src
COPY tests ./tests

# Сборка
RUN npm run build

# По умолчанию — запуск приёмочных тестов
CMD ["npm", "run", "test:acceptance"]
