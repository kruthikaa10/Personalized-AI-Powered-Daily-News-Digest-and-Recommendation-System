const axios = require('axios');
const { poolPromise, sql } = require('../config/db');

const guessCategory = (title, desc, defaultCat) => {
    const text = ((title || '') + ' ' + (desc || '')).toLowerCase();
    if (/(sports|nba|nfl|wnba|football|soccer|cricket|tennis|basketball|messi|ronaldo|match|tournament|coach|player)/.test(text)) return 'Sports';
    if (/(technology|tech|apple|iphone|android|software|hardware|app|google|microsoft|AI|artificial intelligence|gadget)/.test(text)) return 'Technology';
    if (/(business|stock|market|economy|finance|wall street|investor|ceo|company|revenue)/.test(text)) return 'Business';
    if (/(health|medical|disease|virus|covid|doctor|hospital|cancer|vaccine)/.test(text)) return 'Health';
    if (/(entertainment|movie|music|film|actor|actress|hollywood|celebrity|singer|song|album|kpop|drama)/.test(text)) return 'Entertainment';
    if (/(science|space|nasa|research|scientist|biology|physics|chemistry|astronomy)/.test(text)) return 'Science';
    if (/(politics|election|president|congress|senate|government|policy|democrat|republican)/.test(text)) return 'Politics';
    return defaultCat === 'All' || !defaultCat ? 'General' : defaultCat;
};

const fetchNews = async (reqCategory, search = '') => {
    try {
        let category = reqCategory || 'General';
        let url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`;
        
        if (search) {
            url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(search)}&apiKey=${process.env.NEWS_API_KEY}`;
        } else if (category && category.toLowerCase() !== 'all' && category.toLowerCase() !== 'general') {
            url = `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${process.env.NEWS_API_KEY}`;
        }

        const response = await axios.get(url);
        const articles = response.data.articles || [];
        
        const pool = await poolPromise;
        const savedArticles = [];
        
        for (const art of articles) {
            if (!art.title || !art.url) continue;

            const check = await pool.request()
                .input('url', sql.NVARCHAR, art.url)
                .query('SELECT * FROM Articles WHERE url = @url');

            let articleId;
            if (check.recordset.length === 0) {
                // Guess category to fix 'All' or 'Search' mixing everything up
                let assignedCat = guessCategory(art.title, art.description, category);
                // Ensure first letter is capitalized
                assignedCat = assignedCat.charAt(0).toUpperCase() + assignedCat.slice(1);

                try {
                    const safeAuthor = (art.author || '').substring(0, 150);
                    const safeSource = (art.source.name || '').substring(0, 100);
                    const safeTitle = (art.title || '').substring(0, 255);
                    
                    const insert = await pool.request()
                        .input('title', sql.NVARCHAR, safeTitle)
                        .input('description', sql.NVARCHAR, art.description || '')
                        .input('content', sql.NVARCHAR, art.content || '')
                        .input('url', sql.NVARCHAR, art.url)
                        .input('image_url', sql.NVARCHAR, art.urlToImage || '')
                        .input('source', sql.NVARCHAR, safeSource)
                        .input('author', sql.NVARCHAR, safeAuthor)
                        .input('category', sql.NVARCHAR, assignedCat.substring(0, 50))
                        .input('published_at', sql.DATETIME2, new Date(art.publishedAt || Date.now()))
                        .query('INSERT INTO Articles (title, description, content, url, image_url, source, author, category, published_at) OUTPUT INSERTED.id VALUES (@title, @description, @content, @url, @image_url, @source, @author, @category, @published_at)');
                    
                    articleId = insert.recordset[0].id;
                    
                    savedArticles.push({
                        id: articleId,
                        title: safeTitle,
                        description: art.description,
                        content: art.content,
                        url: art.url,
                        image_url: art.urlToImage,
                        source: safeSource,
                        author: safeAuthor,
                        category: assignedCat,
                        published_at: art.publishedAt
                    });
                } catch (insertError) {
                    console.error('Error inserting article:', insertError.message);
                    continue; // Skip this article and continue with the next
                }
            } else {
                savedArticles.push(check.recordset[0]);
            }
        }
        
        return savedArticles;
    } catch (error) {
        console.error('Error fetching news:', error.message);
        return [];
    }
};

module.exports = { fetchNews };

