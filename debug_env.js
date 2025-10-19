require('dotenv').config();

console.log('DB_PASSWORD value:', JSON.stringify(process.env.DB_PASSWORD));
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'undefined or empty string');
console.log('DB_PASSWORD === "":', process.env.DB_PASSWORD === "");
console.log('DB_PASSWORD === undefined:', process.env.DB_PASSWORD === undefined);
console.log('Boolean(DB_PASSWORD):', Boolean(process.env.DB_PASSWORD));
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);