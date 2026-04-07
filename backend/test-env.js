require('dotenv').config();
console.log('PORT:', process.env.PORT);
console.log('DB_URL:', process.env.DB_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
