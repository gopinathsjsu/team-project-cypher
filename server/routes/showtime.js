const express = require('express')
const router = express.Router()

const { protect, authorize } = require('../middleware/auth')
const {
	addShowtime,
	getShowtime,
	deleteShowtime,
	purchase,
	deletePreviousShowtime,
	getShowtimes,
	deleteShowtimes,
	getShowtimeWithUser,
	getUnreleasedShowtimes,
	updateShowtime,
	deleteShowtimeTickets,
	updateRewardPoints
} = require('../controllers/showtimeController')

router
	.route('/')
	.get(getShowtimes)
	.post(protect, authorize('admin'), addShowtime)
	.delete(protect, authorize('admin'), deleteShowtimes)
router.route('/unreleased').get(protect, authorize('admin'), getUnreleasedShowtimes)
router.route('/previous').delete(protect, authorize('admin'), deletePreviousShowtime)
router.route('/user/:id').get(protect, authorize('admin'), getShowtimeWithUser)
router
	.route('/:id')
	.get(getShowtime)
	.post(protect, purchase)
	.put(protect, authorize('admin'), updateShowtime)
	.delete(protect, authorize('admin'), deleteShowtime)

router.delete('/:id/tickets', deleteShowtimeTickets);
router.route('/update-rewards/:id').put(protect, updateRewardPoints);

module.exports = router
