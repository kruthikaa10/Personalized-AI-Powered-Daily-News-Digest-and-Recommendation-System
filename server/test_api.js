const axios = require('axios');
require('dotenv').config();
const apiKey = process.env.GEMINI_API_KEY;
async function testModel(modelName) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const res = await axios.post(url, { contents: [{ parts: [{ text: 'Hello' }] }] });
        console.log(modelName, 'OK');
    } catch(e) { 
        console.log(modelName, 'ERROR:', e.response?.data?.error?.message || e.message); 
    }
}
async function run() {
    await testModel('gemini-3.6-flash');
    await testModel('gemini-3.5-flash-lite');
    await testModel('gemini-2.5-flash-lite');
    await testModel('gemini-flash-lite-latest');
}
run();
