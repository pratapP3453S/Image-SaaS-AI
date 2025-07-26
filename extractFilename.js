const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// Promisify fs methods
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

// CONFIG
const MONGO_URI =
  "mongodb+srv://pratappanigrahy93:pratappanigrahy@cluster0.5zmht.mongodb.net";
const DB_NAME = "imaginify"; // ✅ Correct DB name
const COLLECTION_NAME = "likes";

const SOURCE_DIRS = [
  "D:/Documents/SURAJ & PRITI/100NCZ_5",
  "D:/Documents/SURAJ & PRITI/photo",
];

const DEST_DIR = "D:/Documents/SURAJ & PRITI/selected";

// Common image file extensions to check
const extensions = [".jpg", ".jpeg", ".png", ".webp", ".JPG", ".PNG"];

async function copySelectedImages() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const docs = await collection.find({}).toArray();
    console.log(`📄 Retrieved ${docs.length} liked documents`);

    if (docs.length === 0) {
      console.warn("⚠️ No documents found");
      return;
    }

    // Ensure destination folder exists
    try {
      await access(DEST_DIR);
    } catch (err) {
      console.log(`📁 Creating destination folder: ${DEST_DIR}`);
      await mkdir(DEST_DIR, { recursive: true });
    }

    let copied = 0;

    for (const doc of docs) {
      let baseName = doc.fileName;

      if (!baseName && doc.imageUrl) {
        try {
          const url = new URL(doc.imageUrl);
          const pathname = url.pathname; // e.g. /bilq5easm/photo/NDP00696.JPG
          const fileWithExt = path.basename(pathname); // NDP00696.JPG
          baseName = fileWithExt.split(".")[0]; // NDP00696
        } catch (e) {
          console.warn(`⚠️ Could not parse imageUrl: ${doc.imageUrl}`);
          continue;
        }
      }

      if (!baseName) continue;

      let found = false;

      for (const dir of SOURCE_DIRS) {
        for (const ext of extensions) {
          const fullName = baseName + ext;
          const srcPath = path.join(dir, fullName);

          if (fs.existsSync(srcPath)) {
            const destPath = path.join(DEST_DIR, fullName);
            try {
              await copyFile(srcPath, destPath);
              console.log(`📂 Copied: ${fullName} from ${dir}`);
              copied++;
              found = true;
              break;
            } catch (err) {
              console.warn(
                `❌ Failed to copy ${fullName} from ${dir}: ${err.message}`
              );
            }
          }
        }
        if (found) break;
      }

      if (!found) {
        console.warn(`❓ File not found for: ${baseName}`);
      }
    }

    console.log(`✅ Successfully copied ${copied} images to ${DEST_DIR}`);
  } catch (error) {
    console.error("🔥 Error:", error);
  } finally {
    await client.close();
    console.log("🚪 Connection closed");
  }
}

copySelectedImages();
