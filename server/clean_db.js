const { poolPromise } = require('./config/db');
async function clear() {
    const pool = await poolPromise;
    await pool.request().query("DELETE FROM ArticleSummaries WHERE summary LIKE '%looks like you forgot%' OR summary LIKE '%provide the full text%' OR summary LIKE '%provide more context%'");
    console.log('Cleaned db');
    process.exit(0);
}
clear();
