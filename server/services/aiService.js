const axios = require('axios');
const { poolPromise, sql } = require('../config/db');

const summarizeArticle = async (articleId, textToSummarize) => {
    try {
        const pool = await poolPromise;
        
        // Check if summary already exists
        const check = await pool.request()
            .input('articleId', sql.INT, articleId)
            .query('SELECT summary FROM ArticleSummaries WHERE article_id = @articleId');
            
        if (check.recordset.length > 0) {
            return check.recordset[0].summary;
        }
        
        if (!textToSummarize) return "No content available to summarize.";

        const prompt = `Summarize the following news article in 3-5 clear sentences. Use simple language. Preserve important facts. Do not invent information. Do not add opinions. Even if the text is extremely short (e.g., just a title), provide a summary based ONLY on the provided text without complaining about missing context. Article text: ${textToSummarize}`;
        
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
        
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: prompt }] }]
        });
        
        let summary = "Summary could not be generated.";
        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            summary = response.data.candidates[0].content.parts[0].text;
        }
        
        // Save to DB
        await pool.request()
            .input('articleId', sql.INT, articleId)
            .input('summary', sql.NVARCHAR, summary)
            .query('INSERT INTO ArticleSummaries (article_id, summary) VALUES (@articleId, @summary)');
            
        return summary;
    } catch (error) {
        console.error('AI Summarization Error:', error.message);
        return "Failed to generate AI summary. Try again later.";
    }
};

const generateKeyTakeaways = async (articleId, textToSummarize) => {
    try {
        const pool = await poolPromise;
        const check = await pool.request()
            .input('articleId', sql.INT, articleId)
            .query('SELECT takeaways_json FROM ArticleKeyTakeaways WHERE article_id = @articleId');
            
        if (check.recordset.length > 0) {
            return JSON.parse(check.recordset[0].takeaways_json);
        }
        
        if (!textToSummarize) return ["No takeaways available."];

        const prompt = `Extract the most important facts from this article into 3-5 short bullet points. Do not invent information. Keep the points short and clear. Article: ${textToSummarize}`;
        
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
        
        const response = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }] });
        
        let rawContent = "";
        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            rawContent = response.data.candidates[0].content.parts[0].text;
        }
        
        const takeaways = rawContent.split('\n').map(line => line.replace(/^[\*\-\•\s]+/, '').trim()).filter(line => line.length > 0).slice(0, 5);
        if(takeaways.length === 0) takeaways.push("Takeaways could not be generated.");
        
        await pool.request()
            .input('articleId', sql.INT, articleId)
            .input('takeawaysJson', sql.NVARCHAR, JSON.stringify(takeaways))
            .query('INSERT INTO ArticleKeyTakeaways (article_id, takeaways_json) VALUES (@articleId, @takeawaysJson)');
            
        return takeaways;
    } catch (error) {
        console.error('AI Takeaways Error:', error.message);
        return ["Failed to generate key takeaways."];
    }
};

const generateWhyItMatters = async (articleId, textToSummarize) => {
    try {
        const pool = await poolPromise;
        const check = await pool.request()
            .input('articleId', sql.INT, articleId)
            .query('SELECT why_it_matters FROM ArticleInsights WHERE article_id = @articleId');
            
        if (check.recordset.length > 0) {
            return check.recordset[0].why_it_matters;
        }
        
        if (!textToSummarize) return "Insight unavailable.";

        const prompt = `Explain the importance of this article in 1-3 simple sentences. Use simple language, factual tone, no opinions, do not invent information. Article: ${textToSummarize}`;
        
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
        
        const response = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }] });
        
        let insight = "Insight could not be generated.";
        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            insight = response.data.candidates[0].content.parts[0].text.trim();
        }
        
        await pool.request()
            .input('articleId', sql.INT, articleId)
            .input('insight', sql.NVARCHAR, insight)
            .query('INSERT INTO ArticleInsights (article_id, why_it_matters) VALUES (@articleId, @insight)');
            
        return insight;
    } catch (error) {
        console.error('AI Insight Error:', error.message);
        return "Failed to generate insight.";
    }
};

const translateContent = async (articleId, language, textContent) => {
    try {
        const pool = await poolPromise;
        const check = await pool.request()
            .input('articleId', sql.INT, articleId)
            .input('lang', sql.NVARCHAR, language)
            .query('SELECT * FROM ArticleTranslations WHERE article_id = @articleId AND language = @lang');
            
        if (check.recordset.length > 0) {
            return {
                summary: check.recordset[0].summary,
                takeaways: JSON.parse(check.recordset[0].takeaways_json),
                why_it_matters: check.recordset[0].why_it_matters
            };
        }
        
        if (language === 'en') return null; // fallback to English originals via API

        const prompt = `Translate the following JSON object containing a summary, takeaways, and insight into ${language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : language}. Return ONLY valid JSON format. \n\n${JSON.stringify(textContent)}`;
        
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
        
        const response = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }] });
        
        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            let translatedText = response.data.candidates[0].content.parts[0].text.trim();
            // clean markdown JSON wrappers if any
            if (translatedText.startsWith('\`\`\`json')) {
                translatedText = translatedText.replace(/^\`\`\`json/m, '').replace(/\`\`\`$/m, '').trim();
            } else if (translatedText.startsWith('\`\`\`')) {
                translatedText = translatedText.replace(/^\`\`\`/m, '').replace(/\`\`\`$/m, '').trim();
            }
            
            const translatedObj = JSON.parse(translatedText);
            
            await pool.request()
                .input('articleId', sql.INT, articleId)
                .input('lang', sql.NVARCHAR, language)
                .input('summary', sql.NVARCHAR, translatedObj.summary || "")
                .input('takeawaysJson', sql.NVARCHAR, JSON.stringify(translatedObj.takeaways || []))
                .input('insight', sql.NVARCHAR, translatedObj.why_it_matters || "")
                .query('INSERT INTO ArticleTranslations (article_id, language, summary, takeaways_json, why_it_matters) VALUES (@articleId, @lang, @summary, @takeawaysJson, @insight)');
                
            return translatedObj;
        }
        throw new Error("Translation failed format");
    } catch (error) {
        console.error('AI Translation Error:', error.message);
        return null;
    }
};

module.exports = { summarizeArticle, generateKeyTakeaways, generateWhyItMatters, translateContent };
