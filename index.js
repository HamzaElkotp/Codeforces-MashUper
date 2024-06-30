const express = require('express');
const path = require('path');

const fileJson = require(`${path.join(__dirname, 'problems.json')}`)

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Endpoint to fetch problems from Codeforces API
app.post('/fetch-problems', async (req, res) => {
  const { topic, minRating, maxRating, numProblems } = req.body;
  try {
    let response = await fetch('https://codeforces.com/api/problemset.problems');
    
    let data;
    try{
      data = await response.json();
    }catch(err){
      data = fileJson;
    }
    
    if (data.status !== 'OK') {
      return res.status(500).json({ error: 'Failed to fetch problems' });
    }

    const problems = data.result.problems.filter(problem =>
      problem.tags.includes(topic) &&
      problem.rating >= minRating &&
      problem.rating <= maxRating
    );

    if (problems.length < numProblems) {
      return res.status(400).json({ error: `Not enough problems available for the given criteria. Found only ${problems.length} problems.` });
    }

    const mashup = [];
    for (let i = 0; i < numProblems; i++) {
      const randomIndex = Math.floor(Math.random() * problems.length);
      mashup.push(problems[randomIndex]);
      problems.splice(randomIndex, 1);
    }

    mashup.sort((a, b) => a.rating - b.rating);
    res.json(mashup);
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});