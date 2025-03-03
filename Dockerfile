FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production --silent
RUN npm install --save-dev @types/express @types/body-parser @types/cors @types/node
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 8000
CMD ["npm", "start"]
