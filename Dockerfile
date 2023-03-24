FROM node:hydrogen-slim

# создание директории приложения
WORKDIR /usr/src/app

# установка зависимостей
# символ астериск ("*") используется для того чтобы по возможности
# скопировать оба файла: package.json и package-lock.json
COPY package*.json ./

RUN npm install
# Если вы создаете сборку для продакшн
# RUN npm ci --only=production

# копируем исходный код
COPY . .

# обфусцируем исходный код
RUN npm install javascript-obfuscator -g
RUN cd public/scripts/ && \
    javascript-obfuscator . --output ../scripts-obf && \
    cd .. && \
    rm -rf scripts && \
    mv scripts-obf scripts

EXPOSE 3000
CMD [ "node", "app.js" ]