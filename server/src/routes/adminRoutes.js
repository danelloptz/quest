const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const {
  getStats,
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getSettings,
  updateSettings,
  getResults,
} = require('../controllers/adminController');

const router = express.Router();

router.use(requireAdmin);

router.get('/stats', getStats);

// Teams
router.get('/teams', getTeams);
router.post('/teams', createTeam);
router.put('/teams/:id', updateTeam);
router.delete('/teams/:id', deleteTeam);

// Players
router.get('/players', getPlayers);
router.post('/players', createPlayer);
router.put('/players/:id', updatePlayer);
router.delete('/players/:id', deletePlayer);

// Questions
router.get('/questions', getQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Results
router.get('/results', getResults);

module.exports = router;
