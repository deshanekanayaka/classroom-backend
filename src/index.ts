import express from 'express';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;

// Middleware to parse JSON bodies
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Classroom backend is running');
});

// Start server
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Server started at ${url}`);
});
