// Express backend framework.
const express = require('express');
// axios for getting data from the api.
const axios = require('axios');
// redis for saving the cache on the user machine.
const redis = require('redis');
const app = express();
const url = 'https://jobs.github.com/positions.json?search=node.js';
// redis uses port number 6379 as the default port.
const redisPort = 6379;
const client = redis.createClient(redisPort);

// if redis encounters an error then it is printed in the console.
client.on('error', error => {
  console.log(error);
});

app.get('/jobs', async (req, res) => {
  const query = 'node.js';
  try {
    // check whether the given call is cached in the memory or not.
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
        // if redis doesnt have the data then it gets stored as cache.
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
