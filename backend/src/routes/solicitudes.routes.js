const { Router } = require('express');
const SolicitudesController = require('../controllers/solicitudes.controller');
const verifyToken = require('../middlewares/auth.middleware');

const router = Router();

// Todas las rutas de solicitudes requieren estar autenticado
router.use(verifyToken);

router.get('/', SolicitudesController.listar);
router.get('/:id', SolicitudesController.obtenerPorId);
router.post('/', SolicitudesController.crear);
router.put('/:id', SolicitudesController.editar);

router.patch('/:id/cancelar', SolicitudesController.cancelar);
router.patch('/:id/aprobar', SolicitudesController.aprobar);
router.patch('/:id/rechazar', SolicitudesController.rechazar);
router.patch('/:id/devolver', SolicitudesController.devolver);

module.exports = router;