const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// store the latest item in memory (fine for a party)
let latest = {
  timestamp: null,
  prompt: null,
  tone: null,
  response: null,
  author: null
};

// Zapier will POST here
app.post('/webhook', (req, res) => {
  const { timestamp, prompt, tone, response, author } = req.body || {};
  // simple guardrails — you can expand this list if you like
  const joined = `${prompt || ""} ${response || ""}`;
  const banned = [/ssn/i, /credit\s*card/i, /address/i];
  if (banned.some(rx => rx.test(joined))) {
    return res.status(400).json({ ok: false, error: 'Blocked content' });
  }

  latest = {
    timestamp: timestamp || new Date().toISOString(),
    prompt: (prompt || "").toString().slice(0, 300),
    tone: (tone || "").toString().slice(0, 50),
    response: (response || "").toString().slice(0, 300),
    author: (author || "").toString().slice(0, 120)
  };
  res.json({ ok: true });
});

// Your web page will poll this
app.get('/latest', (req, res) => {
  res.json(latest);
});

// Serve the static page
app.use('/', express.static(path.join(__dirname, 'public')));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
