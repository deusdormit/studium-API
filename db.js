module.exports = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "studiumDB",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
  },
};
