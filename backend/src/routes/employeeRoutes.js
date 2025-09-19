const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/employeeController");


router.post("/create", ctrl.createEmployee);
/*router.post("/", ctrl.createOffer);
router.get("/:id", ctrl.getEmployee);
router.put("/:id/docs", ctrl.uploadDocs);
router.put("/:id/verify", ctrl.verifyDocs);
router.put("/:id/onboard", ctrl.startOnboarding);
router.put("/:id/activate", ctrl.activateEmployee);
router.put("/:id/induction", ctrl.startInduction);*/

module.exports = router;