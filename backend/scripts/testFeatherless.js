const axios = require('axios');
require('dotenv').config();

const API_URL = 'https://api.featherless.ai/v1/chat/completions';
const API_KEY = 'rc_9e955fbd46f05917debbca63d701073e0adef0e210882bcb1324256fec9ed413';

async function test() {
    try {
        const response = await axios.post(
            API_URL,
            {
                model: 'mistralai/Mistral-7B-Instruct-v0.2',
                messages: [{ role: 'user', content: 'hi' }],
                max_tokens: 300,
            },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log('SUCCESS:', response.data.choices[0].message.content);
    } catch (error) {
        console.log('ERROR:', error.response?.data || error.message);
    }
}

test();
