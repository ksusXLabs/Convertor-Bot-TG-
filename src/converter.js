// Team Akira | K CeY | DevRabbitZz
// Conversion engine: FFmpeg (video/audio), Sharp (image), Archiver/7z (archives)

const ffmpeg = require("fluent-ffmpeg");
const sharp = require("sharp");
const archiver = require("archiver");
const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");

function convertVideoOrAudio(inputPath, outputPath, targetExt) {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg(inputPath);

    if (targetExt === "gif") {
      cmd
        .outputOptions(["-vf", "fps=10,scale=480:-1:flags=lanczos", "-t", "10"])
        .toFormat("gif");
    } else if (["mp3", "wav", "m4a", "flac", "aac", "ogg", "opus"].includes(targetExt)) {
      // audio-only output (also used for "extract audio from video")
      cmd.noVideo();
    }

    cmd
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
}

async function convertImage(inputPath, outputPath, targetExt) {
  const fmt = targetExt === "jpg" ? "jpeg" : targetExt;
  await sharp(inputPath).toFormat(fmt).toFile(outputPath);
  return outputPath;
}

function convertArchive(inputPath, outputPath, targetExt) {
  return new Promise((resolve, reject) => {
    if (targetExt === "zip") {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver("zip", { zlib: { level: 9 } });
      output.on("close", () => resolve(outputPath));
      archive.on("error", (err) => reject(err));
      archive.pipe(output);

      // if input is already an archive, extract then re-zip; otherwise zip the single file
      try {
        const zip = new AdmZip(inputPath);
        const entries = zip.getEntries();
        entries.forEach((entry) => {
          archive.append(entry.getData(), { name: entry.entryName });
        });
      } catch {
        archive.file(inputPath, { name: path.basename(inputPath) });
      }
      archive.finalize();
    } else if (targetExt === "tar" || targetExt === "gz") {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver(targetExt === "gz" ? "tar" : "tar", targetExt === "gz" ? { gzip: true } : {});
      output.on("close", () => resolve(outputPath));
      archive.on("error", (err) => reject(err));
      archive.pipe(output);
      archive.file(inputPath, { name: path.basename(inputPath) });
      archive.finalize();
    } else {
      reject(new Error(`Archive target format .${targetExt} not supported yet`));
    }
  });
}

function convertDocument(inputPath, outputDir, targetExt) {
  // Requires libreoffice installed in the container (see Dockerfile)
  return new Promise((resolve, reject) => {
    const { exec } = require("child_process");
    const cmd = `libreoffice --headless --convert-to ${targetExt} --outdir "${outputDir}" "${inputPath}"`;
    exec(cmd, { timeout: 60000 }, (err, stdout, stderr) => {
      if (err) return reject(err);
      const base = path.basename(inputPath, path.extname(inputPath));
      const outputPath = path.join(outputDir, `${base}.${targetExt}`);
      if (fs.existsSync(outputPath)) resolve(outputPath);
      else reject(new Error("LibreOffice conversion did not produce output"));
    });
  });
}

module.exports = { convertVideoOrAudio, convertImage, convertArchive, convertDocument };
