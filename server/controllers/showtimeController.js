const Movie = require('../models/Movie')
const Showtime = require('../models/Showtime')
const Theater = require('../models/Theater')
const User = require('../models/User')

const TICKET_PRICE = 10;
const SERVICE_FEE = 1.5;


//@desc     GET showtimes
//@route    GET /showtime
//@access   Public
exports.getShowtimes = async (req, res, next) => {
	try {
		const showtimes = await Showtime.find({ isRelease: true })
			.populate([
				'movie',
				{ path: 'theater', populate: { path: 'cinema', select: 'name' }, select: 'number cinema seatPlan' }
			])
			.select('-seats.user -seats.row -seats.number')

		res.status(200).json({ success: true, count: showtimes.length, data: showtimes })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET showtimes with all unreleased showtime
//@route    GET /showtime/unreleased
//@access   Private admin
exports.getUnreleasedShowtimes = async (req, res, next) => {
	try {
		const showtimes = await Showtime.find()
			.populate([
				'movie',
				{ path: 'theater', populate: { path: 'cinema', select: 'name' }, select: 'number cinema seatPlan' }
			])
			.select('-seats.user -seats.row -seats.number')

		res.status(200).json({ success: true, count: showtimes.length, data: showtimes })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET single showtime
//@route    GET /showtime/:id
//@access   Public
exports.getShowtime = async (req, res, next) => {
	try {
		const showtime = await Showtime.findById(req.params.id)
			.populate([
				'movie',
				{ path: 'theater', populate: { path: 'cinema', select: 'name' }, select: 'number cinema seatPlan' }
			])
			.select('-seats.user')

		if (!showtime) {
			return res.status(400).json({ success: false, message: `Showtime not found with id of ${req.params.id}` })
		}

		if (!showtime.isRelease) {
			return res.status(400).json({ success: false, message: `Showtime is not released` })
		}

		res.status(200).json({ success: true, data: showtime })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     GET single showtime with user
//@route    GET /showtime/user/:id
//@access   Private Admin
exports.getShowtimeWithUser = async (req, res, next) => {
	try {
		const showtime = await Showtime.findById(req.params.id).populate([
			'movie',
			{ path: 'theater', populate: { path: 'cinema', select: 'name' }, select: 'number cinema seatPlan' },
			{ path: 'seats', populate: { path: 'user', select: 'username email role' } }
		])

		if (!showtime) {
			return res.status(400).json({ success: false, message: `Showtime not found with id of ${req.params.id}` })
		}

		res.status(200).json({ success: true, data: showtime })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Add Showtime
//@route    POST /showtime
//@access   Private
exports.addShowtime = async (req, res, next) => {
	try {
		const { movie: movieId, showtime: showtimeString, theater: theaterId, repeat = 1, isRelease } = req.body

		if (repeat > 31 || repeat < 1) {
			return res.status(400).json({ success: false, message: `Repeat is not a valid number between 1 to 31` })
		}

		let showtime = new Date(showtimeString)
		let showtimes = []
		let showtimeIds = []

		const theater = await Theater.findById(theaterId)

		if (!theater) {
			return res.status(400).json({ success: false, message: `Theater not found with id of ${req.params.id}` })
		}

		const movie = await Movie.findById(movieId)

		if (!movie) {
			return res.status(400).json({ success: false, message: `Movie not found with id of ${movieId}` })
		}

		for (let i = 0; i < repeat; i++) {
			const showtimeDoc = await Showtime.create({ theater, movie: movie._id, showtime, isRelease })

			showtimeIds.push(showtimeDoc._id)
			showtimes.push(new Date(showtime))
			showtime.setDate(showtime.getDate() + 1)
		}
		theater.showtimes = theater.showtimes.concat(showtimeIds)

		await theater.save()

		res.status(200).json({
			success: true,
			showtimes: showtimes
		})
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Purchase seats
//@route    POST /showtime/:id
//@access   Private
exports.purchase = async (req, res, next) => {
	try {
		const { seats } = req.body
		const user = req.user

		const showtime = await Showtime.findById(req.params.id).populate({ path: 'theater', select: 'seatPlan' })

		if (!showtime) {
			return res.status(400).json({ success: false, message: `Showtime not found with id of ${req.params.id}` })
		}

		const isSeatValid = seats.every((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			const maxRow = showtime.theater.seatPlan.row
			const maxCol = showtime.theater.seatPlan.column

			if (maxRow.length !== row.length) {
				return maxRow.length > row.length
			}

			return maxRow.localeCompare(row) >= 0 && number <= maxCol
		})

		if (!isSeatValid) {
			return res.status(400).json({ success: false, message: 'Seat is not valid' })
		}

		const isSeatAvailable = seats.every((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			return !showtime.seats.some((seat) => seat.row === row && seat.number === parseInt(number, 10))
		})

		if (!isSeatAvailable) {
			return res.status(400).json({ success: false, message: 'Seat not available' })
		}

		const seatUpdates = seats.map((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			return { row, number: parseInt(number, 10), user: user._id }
		})

		showtime.seats.push(...seatUpdates)
		const updatedShowtime = await showtime.save()

		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{
			  $push: { tickets: { showtime, seats: seatUpdates }},
			  $inc: {
				reward_points: user.membership === "FREE"
				  ? (seatUpdates.length * (TICKET_PRICE + SERVICE_FEE))
				  : seatUpdates.length * TICKET_PRICE
			  }
			},
			{ new: true }
		  );
		  

		res.status(200).json({ success: true, data: updatedShowtime, updatedUser })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete tickets from a showtime based on seatId list
//@route    DELETE /showtime/:id/tickets
//@access   Private
exports.deleteShowtimeTickets = async (req, res, next) => {
  try {
    const showtimeId = req.params.id;
    const SelectedSeats = req.body.seats;
    const user = req.body.user;
    
    const showtime = await Showtime.findById(showtimeId);
    const userId = showtime.seats[0].user;
    
    if (!showtime) {
      return res.status(400).json({ success: false, message: `Showtime not found with id of ${showtimeId}` });
    }

    showtime.seats = showtime.seats.filter(seat => !SelectedSeats.some(selectedSeat => seat.row === selectedSeat.row && seat.number === selectedSeat.number));

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          reward_points: user.membership === "FREE"
            ? -(SelectedSeats.length * (TICKET_PRICE + SERVICE_FEE))
            : -(SelectedSeats.length * TICKET_PRICE)
        }
      },
      { new: true }
    );
    

    await showtime.save();

    res.status(200).json({ success: true, data : updatedUser, message: "Seats deleted successfully from the showtime" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: err });
  }
};

//@desc     PUT update reward points in user profile if paid using reward points
//@route    PUT /showtime/update-rewards/:id
//@access   Private 
exports.updateRewardPoints = async (req, res, next) => {
    try {
        const userID = req.params.id; 
        const { reward_points } = req.body;
	

        // Update user's reward points
        const user = await User.findByIdAndUpdate(userID, { reward_points }, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Reward points updated successfully", reward_points: user.reward_points });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc     Update showtime
//@route    PUT /showtime/:id
//@access   Private Admin
exports.updateShowtime = async (req, res, next) => {
	try {
		const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!showtime) {
			return res.status(400).json({ success: false, message: `Showtime not found with id of ${req.params.id}` })
		}
		res.status(200).json({ success: true, data: showtime })
	} catch (err) {
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete single showtime
//@route    DELETE /showtime/:id
//@access   Private Admin
exports.deleteShowtime = async (req, res, next) => {
	try {
		const showtime = await Showtime.findById(req.params.id)

		if (!showtime) {
			return res.status(400).json({ success: false, message: `Showtime not found with id of ${req.params.id}` })
		}

		await showtime.deleteOne()

		res.status(200).json({ success: true })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete showtimes
//@route    DELETE /showtime
//@access   Private Admin
exports.deleteShowtimes = async (req, res, next) => {
	try {
		const { ids } = req.body

		let showtimesIds

		if (!ids) {
			// Delete all showtimes
			showtimesIds = await Showtime.find({}, '_id')
		} else {
			// Find showtimes based on the provided IDs
			showtimesIds = await Showtime.find({ _id: { $in: ids } }, '_id')
		}

		for (const showtimeId of showtimesIds) {
			await showtimeId.deleteOne()
		}

		res.status(200).json({ success: true, count: showtimesIds.length })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}

//@desc     Delete previous day showtime
//@route    DELETE /showtime/previous
//@access   Private Admin
exports.deletePreviousShowtime = async (req, res, next) => {
	try {
		const currentDate = new Date()
		currentDate.setHours(0, 0, 0, 0)

		const showtimesIds = await Showtime.find({ showtime: { $lt: currentDate } }, '_id')

		for (const showtimeId of showtimesIds) {
			await showtimeId.deleteOne()
		}

		res.status(200).json({ success: true, count: showtimesIds.length })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false, message: err })
	}
}
