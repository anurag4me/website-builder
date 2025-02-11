import express, { Request, Response, Application } from "express";
import OpenAI from "openai";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import cors from "cors";

require("dotenv").config();

const openai = new OpenAI();
const app: Application = express(); // Explicitly define app as an Application
app.use(cors());
app.use(express.json());

app.post("/template", async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 200,
      messages: [
        { role: "user", content: prompt },
        {
          role: "system",
          content: "Return either 'node' or 'react'. Only return one word.",
        },
      ],
    });

    const answer = response.choices?.[0]?.message?.content?.trim();

    if (answer === "react") {
      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [reactBasePrompt],
      });
      return;
    } else if (answer === "node") {
      res.json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
      return;
    } else {
      res.status(400).json({ error: "Invalid response from AI" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/chat", async (req: Request, res: Response): Promise<void> => {
  const messages = req.body.messages;
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [...messages, { role: "system", content: getSystemPrompt() }],
  });

  console.log(response);
  const message = response.choices?.[0]?.message?.content?.trim();
  res.json({ response: message });
});

app.listen(3000, () => console.log("Server running on port 3000"));
