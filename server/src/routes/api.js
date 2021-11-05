const planetsRouter = require('./planets/planets.router');
const launchesRouter = require('./launches/launches.router');
const express = require('express');

const router = express.Router();

router.use('/planets', planetsRouter);
router.use('/launches', launchesRouter);

module.exports = router;