// Team Akira | K CeY | DevRabbitZz
// Universal File Converter Telegram Bot - main entrypoint

require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const fs = require("fs");
const path = require("path");
const os = require("os");

const { detectCategory, getUnsupportedNote } = require("./formats");
const { convertVideoOrAudio, convertImage, convertArchive, convertDocument } = require("./converter");
const style = require("./style");

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("Missing BOT_TOKEN in environment variables.");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const TMP_DIR = path.join(os.tmpdir(), "converter-bot");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// In-memory session store: chatId -> { filePath, fileName, sourceExt, category }
const sessions = new Map();

bot.start((ctx) => {
  ctx.replyWithMarkdownV2(style.welcomeMessage());
});

bot.help((ctx) => {
  ctx.replyWithMarkdownV2(style.welcomeMessage());
});

// Handle any incoming document/video/audio/photo
async function handleIncomingFile(ctx, fileId, fileName, fileSizeBytes) {
  try {
    const ext = path.extname(fileName).replace(".", "").toLowerCase() || "bin";
    const unsupportedNote = getUnsupportedNote(ext);

    if (unsupportedNote) {
      return ctx.replyWithMarkdownV2(style.unsupportedMessage(fileName, unsupportedNote));
    }

    const category = detectCategory(ext);
    if (!category) {
      return ctx.replyWithMarkdownV2(
        style.unsupportedMessage(fileName, `The .${ext} format isn't recognized by this bot yet.`)
      );
    }

    const fileLink = await ctx.telegram.getFileLink(fileId);
    const localPath = path.join(TMP_DIR, `${Date.now()}_${fileName}`);
    const response = await fetch(fileLink.href);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(localPath, buffer);

    sessions.set(ctx.chat.id, {
      filePath: localPath,
      fileName,
      sourceExt: ext,
      category: category.category,
    });

    const sizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);

    // Build inline keyboard, excluding the source format itself
    const targets = category.convertTo.filter((t) => t !== ext);
    const buttons = targets.map((t) =>
      Markup.button.callback(`➡️ ${t.toUpperCase()}`, `conv:${t}`)
    );
    const rows = [];
    for (let i = 0; i < buttons.length; i += 3) rows.push(buttons.slice(i, i + 3));

    await ctx.replyWithMarkdownV2(
      style.fileDetectedMessage(fileName, category, sizeMB),
      Markup.inlineKeyboard(rows)
    );
  } catch (err) {
    console.error(err);
    ctx.replyWithMarkdownV2(style.errorMessage("Could not download or process that file."));
  }
}

bot.on("document", (ctx) => {
  const doc = ctx.message.document;
  handleIncomingFile(ctx, doc.file_id, doc.file_name || "file.bin", doc.file_size || 0);
});

bot.on("video", (ctx) => {
  const v = ctx.message.video;
  handleIncomingFile(ctx, v.file_id, v.file_name || "video.mp4", v.file_size || 0);
});

bot.on("audio", (ctx) => {
  const a = ctx.message.audio;
  handleIncomingFile(ctx, a.file_id, a.file_name || "audio.mp3", a.file_size || 0);
});

bot.on("photo", (ctx) => {
  const photos = ctx.message.photo;
  const largest = photos[photos.length - 1];
  handleIncomingFile(ctx, largest.file_id, `photo_${Date.now()}.jpg`, largest.file_size || 0);
});

// Handle format selection button
bot.action(/conv:(.+)/, async (ctx) => {
  const targetExt = ctx.match[1];
  const session = sessions.get(ctx.chat.id);
  await ctx.answerCbQuery();

  if (!session) {
    return ctx.replyWithMarkdownV2(style.errorMessage("Session expired. Please send the file again."));
  }

  await ctx.editMessageText(style.convertingMessage(session.sourceExt, targetExt), {
    parse_mode: "MarkdownV2",
  });

  const startTime = Date.now();
  const base = path.basename(session.fileName, path.extname(session.fileName));
  const outputPath = path.join(TMP_DIR, `${base}_converted.${targetExt}`);

  try {
    if (session.category === "video" || session.category === "audio") {
      await convertVideoOrAudio(session.filePath, outputPath, targetExt);
    } else if (session.category === "image") {
      await convertImage(session.filePath, outputPath, targetExt);
    } else if (session.category === "archive") {
      await convertArchive(session.filePath, outputPath, targetExt);
    } else if (session.category === "document") {
      const producedPath = await convertDocument(session.filePath, TMP_DIR, targetExt);
      fs.renameSync(producedPath, outputPath);
    } else {
      throw new Error("Unknown category");
    }

    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1);
    const outputFileName = `${base}.${targetExt}`;

    await ctx.replyWithDocument(
      { source: outputPath, filename: outputFileName },
      { caption: style.successMessage(outputFileName, targetExt, timeTaken), parse_mode: "MarkdownV2" }
    );

    // cleanup
    fs.unlink(session.filePath, () => {});
    fs.unlink(outputPath, () => {});
    sessions.delete(ctx.chat.id);
  } catch (err) {
    console.error(err);
    ctx.replyWithMarkdownV2(style.errorMessage(`Conversion to .${targetExt} failed: ${err.message}`));
  }
});

bot.catch((err, ctx) => {
  console.error(`Bot error for ${ctx.updateType}:`, err);
});

// --- Web server (keeps Render happy on free/web-service tier) ---
const app = express();
app.get("/", (req, res) => res.send("Team Akira Converter Bot is running."));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Health check server on port ${PORT}`));

bot.launch().then(() => console.log("Bot started successfully."));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
