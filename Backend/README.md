
# Website Builder Backend

Express.js backend service for the Website Builder project, handling AI interactions and template generation.

## Features

- OpenAI integration for website generation
- Template management for React and Node.js projects
- REST API endpoints for chat and template selection

## Tech Stack

- Express.js with TypeScript
- OpenAI API for AI interactions
- CORS for cross-origin requests

## Getting Started

1. Create `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm run dev
```

The server will start on http://localhost:3000

## API Endpoints

- POST `/template` - Get project template based on prompt
- POST `/chat` - Chat with AI for website generation