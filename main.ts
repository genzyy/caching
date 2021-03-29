const express = require('express');
const axios = require('axios');
const redis = require('redis');
const app = express();
const url: string = 'https://jobs.github.com/positions.json?search=node.js';
const redisPort: number = 6379;
const client = redis.createClient(redisPort);

client.on('error', error => {
  console.log(error);
});

app.get('/jobs', async (req, res) => {
  const query = req.query.search;
  try {
    client.get(query, async (error, jobs) => {
      if (error) throw error;

      if (jobs) {
        res.status(200).send({
          jobs: JSON.parse(jobs),
          message: 'data received from cache stored on the machine!'
        });
      } else {
        const jobs = await axios.get(
          `https://jobs.github.com/positions.json?search=${query}`
        );
        client.setex(query, 600, JSON.stringify(jobs.data));
        res.status(200).send({
          jobs: jobs.data,
          message: 'cache miss'
        });
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(3000, () => {
  console.log('Server started running...');
});
