const express = require('express');
const router = express.Router();

const EquiposController = require('../controllers/equipos.controller');

router.get('/', EquiposController.getAll);
router.get('/:id', EquiposController.getById);

module.exports = router;