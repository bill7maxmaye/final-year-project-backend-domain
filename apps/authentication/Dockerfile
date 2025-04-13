FROM node:alpine as development

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./


RUN npm install -g pnpm  # Install pnpm globally within the development stage
RUN pnpm install
COPY . .
RUN pnpm build

FROM node:alpine as production
ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app


COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm # Install pnpm globally within the production stage
RUN pnpm install --prod
COPY --from=development /usr/src/app/dist ./dist
CMD ["node","dist/apps/authentication/main.js"]