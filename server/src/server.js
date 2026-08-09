import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/database.js';

const port = process.env.PORT || 5000;

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Road Rescue Hub API listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Could not start API:', error.message);
    process.exit(1);
  });
