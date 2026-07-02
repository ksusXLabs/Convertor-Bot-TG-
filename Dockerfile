FROM node:18-bullseye

# Install FFmpeg, LibreOffice, and image libs needed by Sharp
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libreoffice \
    libvips-dev \
    p7zip-full \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "src/index.js"]
