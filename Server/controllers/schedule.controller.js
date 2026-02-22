const ScheduleItem = require("../models/scheduleItem.model");

class ScheduleController {
  static async importForMe(req, res) {
    try {
      const userId = req.user.id;

      const items = req.body.items;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "No schedule items provided" });
      }

      await ScheduleItem.destroy({ where: { userId } });

      const rows = items.map((x) => ({ ...x, userId }));
      await ScheduleItem.bulkCreate(rows);

      return res.json({ message: "Schedule imported", count: rows.length });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  static async getMySchedule(req, res) {
    const userId = req.user.id;
    const list = await ScheduleItem.findAll({
      where: { userId },
      order: [["id", "ASC"]],
    });
    return res.json(list);
  }
}

module.exports = ScheduleController;
