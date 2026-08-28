const express = require('express');
const router = express.Router();
const lcaController = require('./lca.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// All LCA routes require a valid JWT
router.use(authenticate);

router.post('/', lcaController.createLcaProject);
router.get('/', lcaController.getLcaProjects);
router.get('/:id', lcaController.getLcaProjectById);
router.get('/:id/export-pdf', lcaController.exportPdfReport);
router.put('/:id', lcaController.updateLcaProject);
router.post('/:id/submit', lcaController.submitLcaProject);

module.exports = router;
