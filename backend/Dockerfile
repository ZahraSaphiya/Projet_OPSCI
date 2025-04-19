FROM node:18-alpine
WORKDIR /srv/app
COPY ./package.json ./yarn.lock ./
RUN node -v
RUN yarn install 
COPY . .
CMD ["yarn", "develop"]
