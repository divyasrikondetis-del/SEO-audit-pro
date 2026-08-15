const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createAudit,
  getAudits,
  getAuditById,
  deleteAudit,
  getAuditStats,
  compareAudits,
} = require('../controllers/auditController');

router.use(protect);

router.post('/', createAudit);
router.get('/', getAudits);
router.get('/stats', getAuditStats);
router.get('/compare/:id1/:id2', compareAudits);
router.get('/:id', getAuditById);
router.delete('/:id', deleteAudit);

module.exports = router;