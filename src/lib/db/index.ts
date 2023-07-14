import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import * as schema from "./schema";

// create database connection
const connection = connect({
  // url: process.env.DATABASE_URL,
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
});

export const db = drizzle(connection, { schema });
