const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const ScheduleController = require("../controllers/schedule.controller");

router.post("/import", requireAuth, ScheduleController.importForMe);
router.get("/me", requireAuth, ScheduleController.getMySchedule);

module.exports = router;
