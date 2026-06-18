const { Router } = require("express");
const HistorialController = require("../controllers/historial.controller");
const verifyToken = require("../middlewares/auth.middleware");

const router = Router();
router.use(verifyToken);

router.get("/solicitud/:id", HistorialController.obtenerPorSolicitud);

module.exports = router;