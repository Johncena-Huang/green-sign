// db.js
import Dexie from "dexie";

export const db = new Dexie("fileHistory");
db.version(1).stores({
  fileRecords: "++id, date, fileName", // Primary key and indexed props
});
