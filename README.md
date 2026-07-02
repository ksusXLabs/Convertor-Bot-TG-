# Universal File Converter Bot

Developed by **K CeY | DevRabbitZz** — **Team Akira**

A Telegram bot that detects any uploaded file's format and converts it to other
formats within the same category (video, audio, image, document, archive)
using FFmpeg, Sharp, and LibreOffice.

## Supported conversions

- 🎬 **Video**: mp4, mkv, avi, mov, webm, gif, extract-to-mp3
- 🎵 **Audio**: mp3, wav, m4a, flac, aac, ogg, opus
- 📷 **Image**: jpg, png, webp, gif, bmp, tiff, avif, ico
- 📄 **Document**: pdf, docx, txt, odt, csv, html (via LibreOffice)
- 📦 **Archive**: zip, tar, gz

**Not supported (by design):** executables (.exe/.apk/.dll), raw camera
formats (.cr2/.nef/.arw), fonts (.ttf/.otf), and Adobe proprietary formats
(.psd/.ai) — these aren't real "conversions" or need specialized tools this
bot doesn't include. The bot tells the user honestly instead of failing
silently.

## Deploy on Render

1. Push this folder to a GitHub repo.
2. On Render: **New → Web Service** → connect your repo.
3. Environment: **Docker** (Render will auto-detect the Dockerfile).
4. Add environment variable: `BOT_TOKEN` = your bot token from @BotFather.
5. Instance type: at least the free tier for testing; use a paid tier for
   real video conversions since they're CPU/memory heavy and free tier sleeps.
6. Deploy. Render will build the Docker image (installs FFmpeg + LibreOffice)
   and start the bot automatically.

## Local testing

```bash
cp .env.example .env
# edit .env and add your BOT_TOKEN
npm install
node src/index.js
```

Note: local testing requires ffmpeg and libreoffice installed on your machine
for full functionality (video/audio/document conversion). Image conversion
works without them since Sharp is self-contained.

## Notes on limits

- Render free tier has limited CPU/RAM — large video files may time out or
  run out of memory. For production use with real users, a paid instance
  (at least 1 CPU / 2GB RAM) is recommended.
- Files are processed in the OS temp directory and deleted after each
  conversion — nothing is stored permanently.
- This bot only converts files the user sends it directly; it does not fetch
  or download content from any external site or social media platform.
