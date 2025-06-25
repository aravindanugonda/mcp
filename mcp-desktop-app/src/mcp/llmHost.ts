import express from 'express';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.MCP_HOST_PORT || 5005;

app.use(bodyParser.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /mcp/message
 * Receives a chat message from the MCP client, calls OpenAI, and returns the response.
 */
app.post('/mcp/message', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message' });
  }
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      max_tokens: 512,
    });
    const reply = completion.choices[0]?.message?.content || '';
    return res.json({ reply });
  } catch (err: any) {
    console.error('OpenAI error:', err);
    return res.status(500).json({ error: 'LLM error' });
  }
});

app.listen(port, () => {
  console.log(`MCP Host (LLM) listening on http://localhost:${port}`);
});
