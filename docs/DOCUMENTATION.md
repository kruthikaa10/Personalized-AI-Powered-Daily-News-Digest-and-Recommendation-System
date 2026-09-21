# Personalized AI-Powered Daily News Digest and Recommendation System – Documentation

## 1. Abstract
The "Personalized AI-Powered Daily News Digest and Recommendation System" is a comprehensive full-stack web application designed to curate, summarize, and deliver personalized news content. It acts as an intelligent news aggregator that leverages Google's Gemini AI to generate concise summaries, key takeaways, and translations, ensuring users stay informed without suffering from information overload.

## 2. Introduction
In today's fast-paced digital era, consuming news can be overwhelming due to the sheer volume of articles and clickbait headlines. This project automates the curation process, delivering a tailored reading experience based on individual user preferences, past reading history, and interactions.

## 3. Problem Statement
Currently, readers rely on generic news aggregators or social media feeds. This leads to issues such as information overload, time wasted reading lengthy articles with low value, lack of multi-language accessibility for regional readers, and disorganized reading habits with no way to track personal reading analytics.

## 4. Existing System
- Relies on manual browsing of multiple news sites.
- Provides generic, non-personalized news feeds to all users.
- Lacks integrated, real-time AI summarization.
- Does not offer seamless, on-the-fly multi-language translation or text-to-speech accessibility features.

## 5. Proposed System
The proposed web application provides an automated, AI-driven solution where:
- The system automatically fetches global news and curates it based on user interests.
- Google Gemini AI generates 3-5 sentence summaries, bulleted key takeaways, and insights on why the article matters.
- A smart recommendation engine actively scores and ranks articles using past reading behavior.
- Real-time translations (Tamil, Hindi) and Text-to-Speech (Read Aloud) functionalities are built directly into the reading experience.

## 6. Objectives
- To eliminate information overload by summarizing long articles.
- To provide a highly personalized and categorized daily news digest.
- To ensure accessibility through multi-language AI translations and Text-to-Speech.
- To securely manage user profiles, reading history, and analytics data.

## 7. Scope
The system is built for use by daily news readers seeking curated content. It covers the entire lifecycle from user onboarding and preference selection to reading analytics tracking and automated background digest generation.

## 8. Hardware Requirements
- **Processor:** Intel Core i3 or higher / Apple Silicon
- **RAM:** 4 GB minimum
- **Storage:** 256 GB SSD/HDD
- **Network:** Active high-speed internet connection

## 9. Software Requirements
- **Operating System:** Windows 10/11 / Linux / macOS
- **Browser:** Google Chrome, Microsoft Edge, Firefox, Safari
- **Database:** Microsoft SQL Server (MSSQL)
- **Server Environment:** Node.js

## 10. Technology Used
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js, node-cron
- **Database:** MS SQL Server (via `mssql` driver over TCP/IP)
- **External APIs:** NewsAPI (for fetching articles), Google Gemini API (for AI generation)
- **Security:** bcrypt (Password Hashing), jsonwebtoken (JWT Auth)

## 11. System Architecture
Client-Server Architecture. The frontend communicates with the backend Express.js server via RESTful APIs using the `fetch()` method. The backend processes the business logic, fetches data from external APIs, caches AI responses to reduce costs, and securely queries the MS SQL Server database.

## 12. Module Description
- **Authentication Module:** Secure registration, login with JWT, and profile management (including language preferences).
- **AI Service Module:** Wrapper for Gemini 3.6 Flash API to handle summaries, takeaways, insights, and translations.
- **Recommendation Module:** A scoring engine that ranks articles based on matching categories, reading history, likes, and recency.
- **Digest Module:** A background cron job that structures daily news into categorized buckets (Top Stories, Interests, Recommended) and saves them as JSON.
- **Analytics Module:** Calculates and serves personal reading statistics and category distribution charts.

## 13. Database Design
The database `PersonalizedNews` is heavily normalized to securely cache AI outputs and track user data.
Key tables include: `Users`, `UserPreferences`, `Articles`, `Bookmarks`, `ArticleLikes`, `ReadingHistory`, `DailyDigests`, `ArticleSummaries`, `ArticleKeyTakeaways`, `ArticleInsights`, `ArticleTranslations`.

## 14. ER Diagram (Textual Representation)
- `Users` (1) --- (M) `UserPreferences`
- `Users` (1) --- (M) `ReadingHistory` / `ArticleLikes` / `Bookmarks`
- `Users` (1) --- (M) `DailyDigests`
- `Articles` (1) --- (1) `ArticleSummaries` / `ArticleKeyTakeaways` / `ArticleInsights`
- `Articles` (1) --- (M) `ArticleTranslations`

## 15. Implementation
Developed using Node.js for backend scripting and Vanilla JS for frontend DOM manipulation. Environment variables (`.env`) protect database credentials and API keys. To ensure high performance and lower API costs, all AI-generated content is heavily cached in the MSSQL database upon first generation.

## 16. Testing
- **Unit Testing:** Individual API endpoints and AI prompt generation logic tested.
- **Integration Testing:** Frontend `fetch` calls successfully interacting with the backend and DB cache.
- **Validation Testing:** Recommendation engine successfully assigns correct point weights (+5, +4, +3, +2) based on user interaction criteria.

## 17. Advantages
- Significant reading time saved via AI summaries.
- Eco-system is highly personalized to the user's specific tastes.
- Multi-lingual and Text-to-Speech support improves accessibility.
- Cost-efficient architecture due to robust database caching of AI calls.

## 18. Limitations
- Highly dependent on third-party APIs (NewsAPI and Google Gemini); rate limits or downtime on those services affect the app.
- Real-time push notifications (WebSockets) for breaking news are not implemented.

## 19. Future Enhancements
- Integration of an automated email newsletter trigger (NodeMailer) to send the Daily Digest to the user's inbox.
- Implementation of a Progressive Web App (PWA) for offline reading capabilities.
- Advanced keyword-based collaborative filtering for even better recommendations.

## 20. Expected Outcomes
- Users will spend significantly less time sifting through clickbait and repetitive news by relying on concise, highly accurate AI summaries.
- The recommendation engine will demonstrate noticeable improvement in serving relevant content as the system continuously learns from user interactions (reading, liking, bookmarking).
- The platform will successfully bridge the language barrier, making global news accessible to regional audiences through accurate Tamil and Hindi AI translations.
- Overall user engagement and reading accessibility will increase due to the automated daily digest, analytics tracking, and intuitive Read-Aloud text-to-speech functionality.

## 21. Conclusion
The Personalized AI-Powered Daily News Digest successfully modernizes news consumption. By providing an intuitive, fast, and highly customized platform, it significantly reduces information overload while empowering users to consume global news efficiently in their preferred language.

## 22. References
- Node.js Documentation
- Express.js Documentation
- Microsoft SQL Server Documentation
- Google Gemini API Documentation
- MDN Web Docs (HTML/CSS/JS)
