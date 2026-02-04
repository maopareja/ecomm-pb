FROM node:20-alpine

WORKDIR /app

# Aceptar basePath como argumento de build
ARG NEXT_PUBLIC_BASE_PATH=""

COPY package*.json ./
RUN npm install
COPY . .

# Pasar variable explícitamente durante el build
RUN NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH npm run build

CMD ["npm", "start"]
