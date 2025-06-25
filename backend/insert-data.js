const fs = require("fs");
const readline = require("readline");
const { Client } = require("@elastic/elasticsearch");

const es = new Client({ node: "http://localhost:9200" });

const INDEX_NAME = "arxiv-paper";
const FILE_PATH = "D://Material//arxiv-metadata-oai-snapshot.json";
const BATCH_SIZE = 500;

async function createIndexIfNotExists() {
  const exists = await es.indices.exists({ index: INDEX_NAME });
  if (!exists) {
    await es.indices.create({
      index: INDEX_NAME,
      body: {
        mappings: {
          properties: {
            id: { type: "keyword" },
            title: { type: "text" },
            authors: { type: "text" },
            categories: { type: "keyword" },
            abstract: { type: "text" },
            update_date: { type: "date", format: "yyyy-MM-dd" },
          },
        },
      },
    });
    console.log(`Index "${INDEX_NAME}" created.`);
  }
}

async function insertData() {
  await createIndexIfNotExists();

  const fileStream = fs.createReadStream(FILE_PATH);
  const rl = readline.createInterface({ input: fileStream });

  let bulkOps = [];
  let counter = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    const doc = JSON.parse(line);
    bulkOps.push({ index: { _index: INDEX_NAME, _id: doc.id } });
    bulkOps.push(doc);

    if (bulkOps.length >= BATCH_SIZE * 2) {
      await es.bulk({ body: bulkOps });
      counter += BATCH_SIZE;
      console.log(`Indexed ${counter} documents...`);
      bulkOps = [];
    }
  }

  if (bulkOps.length > 0) {
    await es.bulk({ body: bulkOps });
    console.log(`Indexed remaining ${bulkOps.length / 2} documents.`);
  }

  console.log("✅ All documents inserted.");
}

insertData().catch(console.error);
