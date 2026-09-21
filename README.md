# Personalized AI-Powered Daily News Digest and Recommendation System

## 1. Project Objective
A full-stack web application providing personalized daily news. It fetches current news via News API, summarizes articles using Gemini AI, and provides a smart recommendation engine based on user history and preferences.

## 2. Features
- User Authentication (Register/Login)
- Set personalized news preferences
- AI-generated news summaries (Gemini)
- Recommendation Engine (Rule-based scoring)
- Daily News Digest Generation
- Save/Bookmark and Like articles
- Reading History Tracking

## 3. Technology Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript, Fetch API
- **Backend:** Node.js, Express.js
- **Database:** Microsoft SQL Server (MSSQL)
- **External APIs:** News API, Gemini API

## 4. Setup Instructions

### Step 1: Install Dependencies
- Node.js installed.
- Microsoft SQL Server installed.

### Step 2: Database Setup
Run the SQL script found in `database/database.sql` on your MSSQL server to create the `PersonalizedNews` database and all required tables.

### Step 3: Environment Variables
Create a `.env` file in the `server` directory (use `.env.example` as a template). 
Provide your MSSQL credentials, JWT Secret, `NEWS_API_KEY`, and `GEMINI_API_KEY`.

### Step 4: Backend Installation
```bash
cd server
npm install
```

### Step 5: Start Server
```bash
npm run dev
```
The server runs on `http://localhost:5000`.

### Step 6: Start Frontend
Open `client/index.html` in your browser or use a Live Server extension in VS Code.

## 5. How Personalization Works
The recommendation engine calculates a personalized score for articles based on:
- User's selected categories (+5)
- Categories of previously liked articles (+4)
- Categories of bookmarked articles (+4)
- Categories in reading history (+3)
- Recency of the article (+2)
Articles are sorted by score, and the top articles are presented on the user's dashboard and Daily Digest.

## 6. How AI Summarization Works
When a user clicks "Read More" on an article, the Node.js backend checks if a summary exists in the `ArticleSummaries` table. If not, the article content is sent securely to the Gemini API with a specific prompt to generate a 3-5 sentence summary. The summary is then stored in the MSSQL database for future requests.

## 7. How Daily Digest Works
A `node-cron` job runs on the server (e.g., daily at 8:00 AM) to automatically generate a personalized digest for every registered user. It compiles the top recommended articles, ensures AI summaries are generated for them, and stores the digest record in the database.

