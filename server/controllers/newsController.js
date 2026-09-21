const { fetchNews } = require('../services/newsService');
const { summarizeArticle, generateKeyTakeaways, generateWhyItMatters, translateContent } = require('../services/aiService');
const { poolPromise, sql } = require('../config/db');

const getNews = async (req, res) => {
    try {
        const { category, search } = req.query;
        const articles = await fetchNews(category, search);
        res.json({ success: true, data: articles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching news' });
    }
};

const getArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.INT, id)
            .query('SELECT * FROM Articles WHERE id = @id');
            
        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }
        
        const article = result.recordset[0];
        const textToSummarize = article.content || article.description || article.title;
        article.summary = await summarizeArticle(article.id, textToSummarize);
        article.takeaways = await generateKeyTakeaways(article.id, textToSummarize);
        article.insight = await generateWhyItMatters(article.id, textToSummarize);
        
        res.json({ success: true, data: article });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching article' });
    }
};

const getTranslation = async (req, res) => {
    try {
        const { id } = req.params;
        const { language } = req.query; // 'en', 'ta', 'hi'
        
        if (!['en', 'ta', 'hi'].includes(language)) {
            return res.status(400).json({ success: false, message: 'Unsupported language' });
        }
        
        const pool = await poolPromise;
        const result = await pool.request().input('id', sql.INT, id).query('SELECT * FROM Articles WHERE id = @id');
        if (result.recordset.length === 0) return res.status(404).json({ success: false, message: 'Article not found' });
        
        const article = result.recordset[0];
        const textToSummarize = article.content || article.description || article.title;
        const summary = await summarizeArticle(article.id, textToSummarize);
        const takeaways = await generateKeyTakeaways(article.id, textToSummarize);
        const insight = await generateWhyItMatters(article.id, textToSummarize);
        
        const translated = await translateContent(article.id, language, { summary, takeaways, why_it_matters: insight });
        
        if (!translated) {
            return res.json({ success: true, data: { summary, takeaways, insight, language: 'en' } }); // fallback English
        }
        
        res.json({ success: true, data: { ...translated, language } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error in translation' });
    }
};

const likeArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('userId', sql.INT, req.user.id)
            .input('articleId', sql.INT, articleId)
            .query('IF NOT EXISTS (SELECT * FROM ArticleLikes WHERE user_id = @userId AND article_id = @articleId) INSERT INTO ArticleLikes (user_id, article_id) VALUES (@userId, @articleId)');
        res.json({ success: true, message: 'Article liked' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const unlikeArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('userId', sql.INT, req.user.id)
            .input('articleId', sql.INT, articleId)
            .query('DELETE FROM ArticleLikes WHERE user_id = @userId AND article_id = @articleId');
        res.json({ success: true, message: 'Article unliked' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getLikeStatus = async (req, res) => {
    try {
        const { articleId } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.INT, req.user.id)
            .input('articleId', sql.INT, articleId)
            .query('SELECT * FROM ArticleLikes WHERE user_id = @userId AND article_id = @articleId');
            
        res.json({ success: true, data: { liked: result.recordset.length > 0 } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getNews, getArticle, getTranslation, likeArticle, unlikeArticle, getLikeStatus };

