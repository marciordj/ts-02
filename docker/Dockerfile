# FROM node:19-alpine
# COPY . /app
# WORKDIR /src
# COPY package*.json /
# # COPY ./entrypoint.sh /entrypoint.sh
# # CMD sh /entrypoint.sh
# RUN npm install
# CMD [ "npm", "dev" ]

FROM node:19-alpine
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["node", "dev"]


