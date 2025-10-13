import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.get ("api/auth/login", (req, res) => {
  res.send("login" );
});

app.get ("/api/auth/signup", (req, res) => {
  res.send("signup" );
});

app.get ("/api/auth/logout", (req, res) => {
  res.send("logout" );
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});