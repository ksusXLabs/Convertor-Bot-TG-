// Team Akira | K CeY | DevRabbitZz
// Format category definitions - only REAL, working conversions are listed here.
// Executables, raw camera formats, and fonts are intentionally excluded
// because they cannot be meaningfully "converted" with FFmpeg/Sharp/LibreOffice.

const FORMAT_CATEGORIES = {
  video: {
    label: "🎬 Video",
    extensions: ["mp4", "mkv", "avi", "mov", "wmv", "flv", "webm", "mpeg", "mpg", "3gp", "m4v", "ts"],
    convertTo: ["mp4", "mkv", "avi", "mov", "webm", "gif", "mp3"], // last one = extract audio
  },
  audio: {
    label: "🎵 Audio",
    extensions: ["mp3", "wav", "m4a", "flac", "aac", "wma", "ogg", "oga", "amr", "aiff", "aif", "opus", "mp2", "ac3"],
    convertTo: ["mp3", "wav", "m4a", "flac", "aac", "ogg", "opus"],
  },
  image: {
    label: "📷 Image",
    extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "tif", "heic", "heif", "avif", "ico", "tga"],
    convertTo: ["jpg", "png", "webp", "gif", "bmp", "tiff", "avif", "ico"],
  },
  document: {
    label: "📄 Document",
    extensions: ["pdf", "docx", "doc", "xlsx", "xls", "pptx", "ppt", "txt", "rtf", "csv", "odt", "ods", "odp", "epub"],
    convertTo: ["pdf", "docx", "txt", "odt", "csv", "html"],
  },
  archive: {
    label: "📦 Archive",
    extensions: ["zip", "rar", "7z", "tar", "gz", "gzip", "bz2"],
    convertTo: ["zip", "tar", "7z", "gz"],
  },
};

// Formats explicitly NOT supported - shown to user honestly instead of pretending
const UNSUPPORTED_NOTES = {
  exe: "Executable files cannot be 'converted' - this isn't a real operation.",
  apk: "Android packages cannot be converted to other formats.",
  dll: "System library files cannot be converted.",
  dmg: "Disk images cannot be converted with this bot.",
  cr2: "RAW camera formats need specialized tools (dcraw/libraw) - not yet supported.",
  nef: "RAW camera formats need specialized tools (dcraw/libraw) - not yet supported.",
  arw: "RAW camera formats need specialized tools (dcraw/libraw) - not yet supported.",
  ttf: "Font conversion needs fonttools - not yet supported.",
  otf: "Font conversion needs fonttools - not yet supported.",
  ai: "Adobe Illustrator files need Adobe tools for reliable conversion.",
  psd: "Photoshop files have only partial support - not yet reliable enough to offer.",
};

function detectCategory(extension) {
  const ext = extension.toLowerCase().replace(".", "");
  for (const [category, data] of Object.entries(FORMAT_CATEGORIES)) {
    if (data.extensions.includes(ext)) {
      return { category, ...data, sourceExt: ext };
    }
  }
  return null;
}

function getUnsupportedNote(extension) {
  const ext = extension.toLowerCase().replace(".", "");
  return UNSUPPORTED_NOTES[ext] || null;
}

module.exports = { FORMAT_CATEGORIES, detectCategory, getUnsupportedNote };
