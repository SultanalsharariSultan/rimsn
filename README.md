# Rimsn MongoDB setup

## 1. Create the environment file

In the project folder, copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

For MongoDB Atlas, replace `MONGO_URI` in `.env` with the connection string
from Atlas. Do not commit `.env` or share its password.

## 2. Start MongoDB

Use either:

- A local MongoDB service on `mongodb://localhost:27017`, or
- MongoDB Atlas, after adding your IP address to the project's network access
  list and creating a database user.

## 3. Run from VS Code

Open the integrated terminal in this folder and run:

```powershell
npm start
```

The server starts on port `5000` only after MongoDB connects successfully.

## 4. Test the connection

In a second VS Code terminal, run:

```powershell
node testClient.js
```

This sends a test emergency document to the `emergencies` collection in the
`rimsnfl` database.
