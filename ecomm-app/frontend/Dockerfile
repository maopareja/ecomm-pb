FROM node:20-alpine

WORKDIR /app

# Aceptar basePath como argumento de build
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
