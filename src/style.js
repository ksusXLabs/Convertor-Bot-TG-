// Team Akira | K CeY | DevRabbitZz
// Telegram MarkdownV2 fancy text helpers

function escapeMdV2(text) {
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

const bold = (t) => `*${escapeMdV2(t)}*`;
const italic = (t) => `_${escapeMdV2(t)}_`;
const mono = (t) => `\`${escapeMdV2(t)}\``;
const spoiler = (t) => `||${escapeMdV2(t)}||`;
const link = (t, url) => `[${escapeMdV2(t)}](${url})`;
const codeBlock = (t, lang = "") => `\`\`\`${lang}\n${t}\n\`\`\``;

const DEV_TAG = () =>
  `\n\n${italic("Developed by")} ${bold("K CeY | DevRabbitZz")}\n${italic("Team")} ${bold("Team Akira")}`;

function welcomeMessage() {
  return (
    `${bold("🔄 UNIVERSAL FILE CONVERTER")}\n\n` +
    `${escapeMdV2("Send me any file and I'll show you what formats you can convert it to.")}\n\n` +
    `${bold("Supported categories:")}\n` +
    `${escapeMdV2("🎬 Video   🎵 Audio   📷 Image   📄 Document   📦 Archive")}\n\n` +
    `${italic("Just send a file to get started.")}` +
    DEV_TAG()
  );
}

function fileDetectedMessage(fileName, category, sizeMB) {
  return (
    `${bold("📁 File Detected")}\n\n` +
    `${bold("Name:")} ${mono(fileName)}\n` +
    `${bold("Type:")} ${escapeMdV2(category.label)}\n` +
    `${bold("Size:")} ${escapeMdV2(sizeMB + " MB")}\n\n` +
    `${escapeMdV2("Choose a format to convert to:")}` +
    DEV_TAG()
  );
}

function unsupportedMessage(fileName, note) {
  return (
    `${bold("⚠️ Not Supported")}\n\n` +
    `${bold("File:")} ${mono(fileName)}\n\n` +
    `${escapeMdV2(note)}` +
    DEV_TAG()
  );
}

function convertingMessage(from, to) {
  return `${bold("⏳ Converting...")}\n${mono(from)} ${escapeMdV2("→")} ${mono(to)}\n\n${italic("This may take a moment depending on file size.")}`;
}

function successMessage(fileName, targetExt, timeTaken) {
  return (
    `${bold("✅ Conversion Complete")}\n\n` +
    `${bold("Output:")} ${mono(fileName)}\n` +
    `${bold("Format:")} ${escapeMdV2(targetExt.toUpperCase())}\n` +
    `${bold("Time:")} ${escapeMdV2(timeTaken + "s")}` +
    DEV_TAG()
  );
}

function errorMessage(reason) {
  return (
    `${bold("❌ Conversion Failed")}\n\n` +
    `${escapeMdV2(reason)}\n\n` +
    `${italic("Try a different format or check the file isn't corrupted.")}` +
    DEV_TAG()
  );
}

module.exports = {
  escapeMdV2, bold, italic, mono, spoiler, link, codeBlock, DEV_TAG,
  welcomeMessage, fileDetectedMessage, unsupportedMessage,
  convertingMessage, successMessage, errorMessage,
};
