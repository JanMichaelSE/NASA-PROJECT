import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Load planets and return as JSON.
async function httpGetPlanets() {
  const response = await axios.get(`${API_URL}/planets`);
  return await response.data;
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
  const response = await axios.get(`${API_URL}/launches`);
  const fetchedLaunches = await response.data;
  return fetchedLaunches.sort((a, b) => a.flightNumber - b.flightNumber);
}

// Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
  try {
    const response = await axios.post(`${API_URL}/launches`, launch);

    return response.status === 201;
  } catch (error) {
    return false;
  }
}

// Delete launch with given ID.
async function httpAbortLaunch(id) {
  try {
    const response = await axios.delete(`${API_URL}/launches/${id}`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
