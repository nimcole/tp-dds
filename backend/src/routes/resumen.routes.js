const { Router } = require("express");
const ResumenController = require("../controllers/resumen.controller");
const verifyToken = require("../middlewares/auth.middleware");

const router = Router();
router.use(verifyToken);

router.get("/", ResumenController.obtenerResumen);

module.exports = router;