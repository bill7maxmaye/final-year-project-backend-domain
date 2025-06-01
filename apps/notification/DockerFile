FROM node:alpine AS development
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml tsconfig.json nest-cli.json ./
RUN npm install -g pnpm @nestjs/cli  # Install pnpm and NestJS CLI globally
RUN pnpm install
COPY . .
RUN pnpm build

FROM node:alpine AS production
WORKDIR /usr/src/app
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/node_modules ./node_modules
CMD ["node", "dist/main.js"]