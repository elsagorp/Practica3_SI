import { Db, MongoClient } from "mongodb";

export const connectDB = async (): Promise<Db> => {
  const usr = "elsa_gor";
  const pwd = "12345qwe";
  const dbName: string = "RickyMortyDB";
  const mongouri: string = `mongodb+srv://${usr}:${pwd}@cluster0.qslm9.mongodb.net/${dbName}?retryWrites=true&w=majority`;

  const client = new MongoClient(mongouri);

  try {
    await client.connect();
    console.info("MongoDB connected");

    return client.db(dbName);
  } catch (e) {
    throw e;
  }
};