const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getLists,
  getList,
  createList,
  updateList,
  deleteList,
  toggleUnit,
  moveUnit,
  getUnitMembership,
} = require('../controllers/wishlistController');

router.use(protect);

router.get('/', getLists);
router.post('/', createList);
router.put('/move', moveUnit);
router.get('/unit/:unitId/membership', getUnitMembership);
router.get('/:listId', getList);
router.put('/:listId', updateList);
router.delete('/:listId', deleteList);
router.post('/:listId/units/:unitId', toggleUnit);

module.exports = router;
