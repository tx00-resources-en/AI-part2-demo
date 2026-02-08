# Fitness Plan Generator – Full‑Stack AI Integration

## Table of Contents
- [Quickstart](#-quickstart)
- [Overview](#-overview)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Module Architecture & Request Flow](#-module-architecture--request-flow)
- [Running the Project](#-running-the-project)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [Security Considerations](#-security-considerations)
- [File‑by‑File Explanations](#-filebyfille-explanations)
- [About the Improvement Reflections](#-about-the-improvement-reflections)

## Quickstart
Follow these 5 steps to get the project running quickly:

1. **Clone & Install**
   ```bash
   git clone <your-repository-url>
   cd <dir>
   npm install
   ```

2. **Set Environment Variables**  
   Create a `.env` file in the project root (or export variables in your shell):
   ```bash
   GEMINI_API_KEY=your_api_key_here
   DEBUG_GEMINI=false   # default (no debug logs)
   ```
   > **Note:** If you want to see detailed Gemini responses for debugging, set `DEBUG_GEMINI=true`.

3. **Start the Server**
   ```bash
   npm run dev   # or node app.js
   ```

4. **Send a Test Request (Postman or curl)**  
   Example payload:
   ```json
   {
     "fitnessType": "strength training",
     "frequency": 4,
     "experience": "beginner",
     "goal": "build muscle"
   }
   ```

5. **Check the Response**  
   You’ll get a JSON object with three fields:
   ```json
   {
     "workout": "...",
     "diet": "...",
     "recovery": "..."
   }
   ```

> *Tip:* There’s also commented code in the repo showing how to generate a **more advanced schema** (with sets/reps, macronutrients, and warnings). Stick with the simple version first, then explore the advanced one when you’re ready.

---

## Overview
This project is a **Node.js/Express** backend that integrates with **Google Gemini** to generate structured, personalized fitness plans in JSON format.  
It demonstrates a clean separation of concerns between:

- **Config** – Infrastructure setup (Gemini API client, database connection, etc.)
- **Controller layer** – Handles HTTP requests/responses and validation
- **Service layer** – Builds prompts and calls the Gemini API
- **Utility layer** – Normalizes and cleans AI‑generated JSON into a consistent format

The output includes three concise fields:
- **Workout** – short description of recommended exercises or routine  
- **Diet** – short description of dietary advice  
- **Recovery** – short description of recovery tips  

> *Note:* For advanced learners, the repository also contains **commented code** showing how to request and normalize a more complex schema (with sets/reps, macronutrients, and warnings). This is optional and provided for exploration.

---

## Project Structure

```
project-root/
│
├── app.js                      # Express app entry point
│
├── config/
│   ├── gemini.js               # Gemini API wrapper (setup & connection)
│   ├── gemini.md               # Explanation & improvement reflections
│
├── services/             
│   ├── fitnessService.js       # Builds prompt & calls Gemini
│   ├── fitnessService.md       # Explanation & improvement reflections
│
├── controllers/
│   ├── fitnessController.js    # Handles /api/generate-text-v2 route
│   ├── fitnessController.md    # Explanation & improvement reflections
│
├── utils/
│   ├── normalizeFitnessPlan.js # Cleans & standardizes AI output
│   ├── normalizeFitnessPlan.md # Explanation & improvement reflections
│
└── README.md                   # This file
```

---

## How It Works

1. **Client Request**  
   The client sends a POST request to `/api/generate-text-v2` with:
   ```json
   {
     "fitnessType": "strength training",
     "frequency": 4,
     "experience": "beginner",
     "goal": "build muscle"
   }
   ```

2. **Controller (`fitnessController.js`)**  
   - Validates input  
   - Calls `generateFitnessPlan()` from the service layer  
   - Extracts JSON from Gemini’s output  
   - Passes it to the utility for normalization before sending it back  

3. **Service (`fitnessService.js`)**  
   - Builds a simplified prompt with schema requirements (`workout`, `diet`, `recovery`)  
   - Calls the Gemini API via `config/gemini.js`  
   - Returns the AI’s raw text output  

4. **Gemini Wrapper (`config/gemini.js`)**  
   - Handles API key setup and model selection  
   - Sends structured `contents` to Gemini  
   - Logs responses in debug mode (`DEBUG_GEMINI=true`)  
   - Returns the full API response to the service  

5. **Utility (`normalizeFitnessPlan.js`)**  
   - Ensures the response always has the three required fields  
   - Provides safe defaults if any field is missing  
   - Handles JSON parsing safely  

---

## Module Architecture & Request Flow

### Complete Request Journey

```
[Client] → [app.js] → [aiRoutes.js] → [fitnessController.js] → [fitnessService.js] → [gemini.js] → [Gemini API]
                                                                         ↓
[Client] ← [app.js] ← [aiRoutes.js] ← [fitnessController.js] ← [normalizeFitnessPlan.js] ← [Raw AI Response]
```

### Step-by-Step Flow Analysis

#### 1. **Entry Point: `app.js`**
```js
app.use('/api', aiRoutes);  // Routes all /api/* requests to aiRoutes
```
- **Role:** Application bootstrapping and middleware setup
- **Responsibilities:** Server initialization, global middleware, route delegation
- **Why here:** Centralized entry point for all HTTP requests

#### 2. **Route Layer: `routes/aiRoutes.js`**
```js
router.post('/generate-text-v2', generateText);
```
- **Role:** URL-to-controller mapping
- **Responsibilities:** Define API endpoints and delegate to appropriate controllers
- **Why separate:** Keeps routing logic organized and easily modifiable

#### 3. **Controller Layer: `controllers/fitnessController.js`**
```js
const { fitnessType, frequency, experience, goal } = req.body;
// Input validation
const rawResponse = await generateFitnessPlan(...);
// Response processing
```
- **Role:** HTTP request/response handling
- **Responsibilities:** Input validation, response formatting, error handling
- **Why separate:** Isolates HTTP concerns from business logic

#### 4. **Service Layer: `services/fitnessService.js`**
```js
const prompt = `Generate a fitness plan for...`;
const result = await model(prompt);
```
- **Role:** Business logic and external API communication
- **Responsibilities:** Prompt construction, AI model interaction
- **Why separate:** Encapsulates complex business rules and external dependencies

#### 5. **Configuration Layer: `config/gemini.js`**
```js
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```
- **Role:** External service configuration and abstraction
- **Responsibilities:** API client setup, authentication, request formatting
- **Why separate:** Centralizes third-party service configuration

#### 6. **Utility Layer: `utils/normalizeFitnessPlan.js`**
```js
return {
  workout: parsedInput.workout || "Default workout...",
  diet: parsedInput.diet || "Default diet...",
  recovery: parsedInput.recovery || "Default recovery..."
};
```
- **Role:** Data transformation and sanitization
- **Responsibilities:** Ensuring data consistency, error-safe defaults
- **Why separate:** Reusable data processing logic

---

## Architectural Analysis: Pros & Cons

### **Advantages of This Separation**

#### 1. **Single Responsibility Principle**
- Each module has one clear purpose
- Easy to understand what each file does
- Changes are localized to specific concerns

#### 2. **Maintainability**
- Bug fixes are easier to locate and implement
- Adding new features doesn't require changing multiple unrelated files
- Code reviews are more focused

#### 3. **Testability**
- Each layer can be unit tested independently
- Mock dependencies easily for isolated testing
- Business logic testing without HTTP overhead

#### 4. **Scalability**
- Easy to add new endpoints by creating new controllers
- Service layer can be reused across multiple controllers
- Configuration changes don't affect business logic

#### 5. **Team Development**
- Different team members can work on different layers simultaneously
- Clear boundaries reduce merge conflicts
- Expertise can be specialized (frontend devs focus on controllers, AI experts on services)

#### 6. **Error Isolation**
- Errors in AI service don't crash HTTP handling
- Network issues are contained in config layer
- Data corruption is caught in utilities

### **Potential Disadvantages**

#### 1. **Complexity Overhead**
```js
// Simple approach (everything in one file):
app.post('/api/fitness', async (req, res) => {
  // 20 lines of code here
});

// Layered approach:
// app.js + aiRoutes.js + controller.js + service.js + config.js + utils.js
// 6 files to understand one feature
```

#### 2. **Performance Considerations**
- More function calls between layers
- Additional file I/O when Node.js loads modules
- Memory overhead from multiple module objects

#### 3. **Learning Curve**
- New developers must understand the entire flow
- More mental mapping required to trace request path
- Potential confusion about where to add new features

#### 4. **Over-Engineering Risk**
- For simple applications, this might be excessive
- Can lead to premature optimization
- May discourage rapid prototyping

### **When This Architecture Shines**

#### **Good For:**
- **Production applications** with multiple features
- **Team development** (3+ developers)
- **Long-term maintenance** projects
- **AI applications** with complex prompt engineering
- **APIs** that will grow over time

#### **Overkill For:**
- **Proof-of-concept** or demo projects
- **Single-developer** quick prototypes  
- **One-time scripts** or simple utilities
- **Learning projects** where simplicity matters more

### **Alternative Approaches**

#### 1. **Monolithic Controller** (Simple)
```js
// Everything in one file - good for prototypes
app.post('/api/fitness', async (req, res) => {
  // validation + AI call + response formatting
});
```

#### 2. **Domain-Driven Design** (Complex)
```
/fitness/
  ├── domain/
  ├── infrastructure/
  ├── application/
  └── presentation/
```

#### 3. **Microservices** (Distributed)
```
fitness-api-service/
ai-service/
validation-service/
```

---

## Best Practices from This Architecture

1. **Dependency Direction:** High-level modules (controllers) depend on low-level modules (services), not vice versa
2. **Error Boundaries:** Each layer handles its own error types appropriately
3. **Configuration Centralization:** All external dependencies configured in one place
4. **Data Validation:** Input validation at controller level, output validation at utility level
5. **Separation of Concerns:** HTTP logic ≠ Business logic ≠ Data transformation logic

This layered approach demonstrates enterprise-level Node.js architecture patterns while remaining educational and approachable.

---

## API Reference

### POST `/api/generate-text-v2`
Generates a personalized fitness plan using AI.

**Request Body:**
```json
{
  "fitnessType": "strength training",    // Required: Type of fitness activity
  "frequency": 4,                        // Required: Number of sessions per week (1-7)
  "experience": "beginner",               // Required: "beginner", "intermediate", "advanced"
  "goal": "build muscle"                  // Required: Fitness goal description
}
```

**Success Response (200):**
```json
{
  "workout": "Focus on compound movements like squats, deadlifts...",
  "diet": "Consume 1.6-2.2g protein per kg body weight...",
  "recovery": "Allow 48-72 hours between training same muscle groups..."
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: AI service unavailable or invalid response

---

## Troubleshooting

### Common Issues

**1. "npm run dev" fails with exit code 1**
- Check if `.env` file exists with `GEMINI_API_KEY`
- Verify Node.js version is 16+ (`node --version`)
- Try `npm install` to reinstall dependencies

**2. "All fields are required" error**
- Ensure all request body fields are present: `fitnessType`, `frequency`, `experience`, `goal`
- Check Content-Type header is set to `application/json`

**3. Empty or malformed AI responses**
- Set `DEBUG_GEMINI=true` in `.env` to see raw AI output
- Check Gemini API key validity
- Verify internet connection

**4. "Cannot find module" errors**
- Run `npm install` to install missing dependencies
- Check if all files exist in correct directory structure

### Debug Mode
Enable detailed logging by setting environment variable:
```bash
DEBUG_GEMINI=true
```

### Verification Steps
1. Test server starts: `npm run dev` should show "Server running on port 3000"
2. Test API endpoint with curl:
   ```bash
   curl -X POST http://localhost:3000/api/generate-text-v2 \
     -H "Content-Type: application/json" \
     -d '{"fitnessType":"cardio","frequency":3,"experience":"beginner","goal":"lose weight"}'
   ```

---

## Security Considerations

### API Key Management
- **Never commit** `.env` files to version control
- Use strong, unique API keys from Google AI Studio
- Rotate API keys regularly
- Consider using secrets management in production

### Input Validation
- All user inputs are validated before processing
- Frequency is limited to 1-7 sessions per week
- Experience levels are restricted to predefined values

### Rate Limiting
- Implement rate limiting for production use
- Monitor Gemini API usage to avoid quota exceeded
- Consider caching responses for identical requests

### Production Recommendations
- Use HTTPS in production
- Add authentication/authorization
- Implement proper logging and monitoring
- Set up error tracking (e.g., Sentry)

---

## File‑by‑File Explanations

Each `.js` file in `services/`, `controllers/`, and `utils/` has a **matching `.md` file** in the same folder.  
These `.md` files contain:

- **Line‑by‑line explanations** of what the code does  
- **Reflections on how it could be improved**, suggested by **Bing Copilot in Smart GPT‑5 mode**  

Example:
- `config/gemini.js` → `config/gemini.md`  
- `services/fitnessService.js` → `services/fitnessService.md`  
- `controllers/fitnessController.js` → `controllers/fitnessController.md`  
- `utils/normalizeFitnessPlan.js` → `utils/normalizeFitnessPlan.md`  

---

## Running the Project

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set environment variables**
   ```bash
   export GEMINI_API_KEY=your_api_key_here
   export DEBUG_GEMINI=true   # optional, enables verbose logging
   ```

3. **Start the server**
   ```bash
   npm run dev   # or node app.js
   ```

4. **Test the endpoint**  
   You can easily test the API with [Postman](https://www.postman.com/):

   - **Open Postman** and create a new request  
   - Set the **method** to `POST`  
   - Enter the URL:
     ```
     http://localhost:3000/api/generate-text-v2
     ```
   - Go to the **Body** tab, select **raw**, and choose **JSON** from the dropdown  
   - Paste the following JSON payload:
     ```json
     {
       "fitnessType": "strength training",
       "frequency": 4,
       "experience": "beginner",
       "goal": "build muscle"
     }
     ```
   - Click **Send**  
   - You should receive a structured JSON response with `workout`, `diet`, and `recovery`  

---

## About the Improvement Reflections
The improvement suggestions in each `.md` file were generated with **Bing Copilot in Smart GPT‑5 mode**.  
They focus on:
- Code maintainability  
- Error handling  
- Debugging strategies  
- Scalability and future‑proofing  

These reflections are **not required** for the project to run, but they provide valuable guidance if you want to evolve this code into a production‑ready system.

---

## License
This project is for educational purposes. Adapt and extend freely.  

