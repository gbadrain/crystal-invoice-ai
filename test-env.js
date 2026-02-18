// test-env.js
import 'dotenv/config';
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET);
