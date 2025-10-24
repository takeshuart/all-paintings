import fs from "fs";
import * as cheerio from "cheerio";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";

interface Letter {
  letterNo: string;
  date: string;
  place: string;
  sender: string;
  recipient: string;
  source: string;
  originalText: string;
  translation: string;
  notes: string;
  keywords: string;
  link: string;
}

function parseLetter(filePath: string): Letter {
  const html = fs.readFileSync(filePath, "utf-8");
  const $ = cheerio.load(html);

  // --- Metadata ---
  const metaBlock = $("#metadata .content").eq(1).text();
  const letterNo = $("#metadata strong").first().text().trim() || "";
  const sender = metaBlock.match(/From:\s*([^\n]+)/)?.[1].trim() || "";
  const recipient = metaBlock.match(/To:\s*([^\n]+)/)?.[1].trim() || "";
  //日期从大标题中解析
  const title= $("h1 a").text()
  console.log(title)
  const match = metaBlock.match(/Date:([\s\S]*?)(?:Source|Location|Date)/)?.[1].trim() || "";
  const dateStr = match.replace(/\n\s*/, ' ').trim();

  const sourceStatus =  $("#sourcestatus .p").text().trim();
  const location = $("#location .p").text().trim();
  const source = [sourceStatus, location].filter(Boolean).join(" | ");

  // --- Original Text ---
  const originalText = $("#original .content .p")
    .map((_, el) => $(el).text().trim())
    .get()
    .join("\n");

  // --- Translation ---
  const translation = $("#translation .content .p")
    .map((_, el) => $(el).text().trim())
    .get()
    .join("\n");

  // --- Place ---
  const place = dateStr.split(",")[0].trim();

  // --- Notes ---
  const notes = $("#notes .content .p")
    .map((_, el) => $(el).text().trim())
    .get()
    .join("\n");

  // --- Link (线上规则) ---
  const link = `https://vangoghletters.org/vg/letters/let${letterNo.padStart(3, "0")}/letter.html`;

  return {
    letterNo,
    date: dateStr,
    place,
    sender,
    recipient,
    source,
    originalText,
    translation,
    notes,
    keywords: "",
    link,
  };
}


// 测试


function traverse(dir: string): string[] {
  const results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results.push(...traverse(fullPath));
    } else if (file === "print.html") {
      results.push(fullPath);
    }
  });
  return results;
}

async function main() {
  const BASE_DIR = "D:\\Arts\\Van Gogh\\vangoghletters.org\\vangoghletters.org\\vg\\letters";
  const OUTPUT_FILE = "D:\\Arts\\Van Gogh\\vangoghletters.org\\vangogh_letters.csv";
  const files = traverse(BASE_DIR);
  console.log(`🔍 Found ${files.length} letters in total`);

  const letters: Letter[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const letter = parseLetter(file);
    const progress = `${i + 1} / ${files.length}`;
    if (letter) {
      // console.log(`${letter.letterNo}\t ${letter.date}\t\t\t ${letter.place}\t${letter.sender}\t${letter.recipient}`)
      letters.push(letter);
    } else {
      console.log(`Skipping ${progress} (parse failed)`);
    }
  }

  const csvWriter = createObjectCsvWriter({
    path: OUTPUT_FILE,
    header: [
      { id: "letterNo", title: "Letter No." },
      { id: "date", title: "Date" },
      { id: "place", title: "Place" },
      { id: "sender", title: "Sender" },
      { id: "recipient", title: "Recipient" },
      { id: "source", title: "Source / Location" },
      { id: "originalText", title: "Original Text" },
      { id: "translation", title: "Translation" },
      { id: "notes", title: "Notes" },
      { id: "keywords", title: "Keywords / Themes" },
      { id: "link", title: "Link" },
    ],
  });

  // await csvWriter.writeRecords(letters);
  console.log(`✅ Exported ${letters.length} letters to ${OUTPUT_FILE}`);
}

main().catch(console.error);

