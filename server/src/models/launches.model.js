const launchesDb = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

const DEFAULT_FLIGHT_NUMBER = 100;

async function populateLaunches() {
  const response = await axios.post('https://api.spacexdata.com/v4/launches/query', {
    query: { },
    options: {
        pagination: false,
        populate: [
            {
                path: 'rocket',
                select: {
                    'name': 1
                }
            },
            {
              path: 'payloads',
              select: {
                'customers': 1
              }
            }
        ]
    }
  });

  if (response.status !== 200) {
    console.log('Problem launching launch Data!');
    throw new Error('Launch Data couldn\'t be requested');
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap(p => p.customers);

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      customers: customers,
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success']
    }

    await saveLaunch(launch);

  }
}
async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat'
  });

  if (firstLaunch) {
    console.log('Launch data already loaded!');
    return;
  }

  await populateLaunches();
  
}

async function findLaunch(filter) {
  return await launchesDb.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId
  })
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDb.findOne().sort('-flightNumber');
  return latestLaunch.flightNumber || DEFAULT_FLIGHT_NUMBER;
}

async function getAllLaunches(skip, limit) {
  return await launchesDb.find({},
    {
      '_id': 0,
      '__v': 0,
    }
  )
  .sort({ flightNumber: 1 })
  .skip(skip)
  .limit(limit);
}

async function saveLaunch(launch) {
  await launchesDb.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    kepler_name: launch.destination
  });

  if (!planet) throw new Error('No matching planet was found');

  const newFlightNumber = await getLatestFlightNumber() + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['Zero To Mastery', 'NASA'],
    flightNumber: newFlightNumber
  });
  await saveLaunch(newLaunch);
}

async function abortLaunch(launchId) {
  const response = await launchesDb.updateOne({
    flightNumber: launchId
  }, {
    upcoming: false,
    success: false
  });

  return response.matchedCount;
}

module.exports = {
  loadLaunchesData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunch,
};
