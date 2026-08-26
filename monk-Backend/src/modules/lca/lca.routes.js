const express = require('express');
const router = express.Router();
const lcaController = require('./lca.controller');

router.post('/', lcaController.createLcaProject);
router.get('/', lcaController.getLcaProjects);
router.get('/:id', lcaController.getLcaProjectById);
router.put('/:id', lcaController.updateLcaProject);
router.post('/:id/submit', lcaController.submitLcaProject);

module.exports = router;
