import {
	ChevronDoubleDownIcon,
	ChevronDoubleUpIcon,
	MagnifyingGlassIcon,
	TicketIcon,
	TrashIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'
import { Fragment, useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import ShowtimeDetails from '../components/ShowtimeDetails'
import { AuthContext } from '../context/AuthContext'

const User = () => {
	const { auth } = useContext(AuthContext)
	const [users, setUsers] = useState(null)
	const [ticketsUser, setTicketsUser] = useState(null)
	const [tickets, setTickets] = useState([])
	const [isUpdating, SetIsUpdating] = useState(false)
	const [isDeleting, SetIsDeleting] = useState(false)

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors }
	} = useForm()

	const fetchUsers = async (data) => {
		try {
			// setIsFetchingShowtimesDone(false)
			const response = await axios.get('/auth/user', {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data.data)
			setUsers(response.data.data)
		} catch (error) {
			console.error(error)
		} finally {
			// setIsFetchingShowtimesDone(true)
		}
	}

	useEffect(() => {
		fetchUsers()
	}, [])

	const onUpdateUser = async (data) => {
		try {
			SetIsUpdating(true)
			const response = await axios.put(`/auth/user/${data.id}`, data, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			fetchUsers()
			localStorage.setItem('auth', JSON.stringify(auth))
			toast.success(`Update ${response.data.data.username} to ${response.data.data.role} successful!`, {
				position: 'top-center',
				autoClose: 500,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Error', {
				position: 'top-center',
				autoClose: 500,
				pauseOnHover: false
			})
		} finally {
			SetIsUpdating(false)
		}
	}

	const handleDelete = (data) => {
		const confirmed = window.confirm(`Do you want to delete user ${data.username}?`)
		if (confirmed) {
			onDeleteUser(data)
		}
	}

	const onDeleteUser = async (data) => {
		try {
			SetIsDeleting(true)
			const response = await axios.delete(`/auth/user/${data.id}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			fetchUsers()
			// getUser()
			toast.success(`Delete successful!`, {
				position: 'top-center',
				autoClose: 500,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Error', {
				position: 'top-center',
				autoClose: 500,
				pauseOnHover: false
			})
		} finally {
			SetIsDeleting(false)
		}
	}

	return (
		<div className="flex flex-col min-h-screen gap-4 pb-8 text-gray-900 bg-gray-900 sm:gap-8">
			<Navbar />
			<div className="flex flex-col gap-2 p-4 mx-4 rounded-lg h-fit bg-slate-400 drop-shadow-xl sm:mx-8 sm:p-6">
				<h2 className="text-3xl font-bold text-gray-900">Users</h2>
				<div className="relative drop-shadow-sm">
					<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
						<MagnifyingGlassIcon className="w-5 h-5 text-gray-500 stroke-2" />
					</div>
					<input
						type="search"
						className="block w-full p-2 pl-10 text-gray-900 border border-gray-300 rounded-lg"
						placeholder="Search username"
						{...register('search')}
					/>
				</div>
				<div
					className={`mt-2 grid max-h-[60vh] overflow-auto rounded-md bg-gradient-to-br from-indigo-200 to-indigo-200`}
					style={{ gridTemplateColumns: 'repeat(4, minmax(max-content, 1fr)) max-content max-content' }}
				>
					<p className="sticky top-0 px-2 py-1 text-xl font-semibold text-center text-white bg-gradient-to-br from-gray-800 to-gray-700">
						Username
					</p>
					<p className="sticky top-0 px-2 py-1 text-xl font-semibold text-center text-white bg-gradient-to-br from-gray-800 to-gray-700">
						Email
					</p>
					<p className="sticky top-0 px-2 py-1 text-xl font-semibold text-center text-white bg-gradient-to-br from-gray-800 to-gray-700">
						Role
					</p>
					<p className="sticky top-0 px-2 py-1 text-xl font-semibold text-center text-white bg-gradient-to-br from-gray-800 to-gray-700">
						Membership
					</p>
					<p className="sticky top-0 px-2 py-1 text-xl font-semibold text-center text-white bg-gradient-to-br from-gray-800 to-gray-700">
						Ticket
					</p>
					<p className="sticky top-0 px-2 py-1 text-xl font-semibold text-center text-white bg-gradient-to-br from-gray-800 to-gray-700">
						Action
					</p>
					{users
						?.filter((user) => user.username.toLowerCase().includes(watch('search')?.toLowerCase() || ''))
						.map((user, index) => {
							return (
								<Fragment key={index}>
									<div className="px-2 py-1 border-t-2 border-indigo-200">{user.username}</div>
									<div className="px-2 py-1 border-t-2 border-indigo-200">{user.email}</div>
									<div className="px-2 py-1 border-t-2 border-indigo-200">{user.role.toUpperCase()}</div>
									<div className="px-2 py-1 border-t-2 border-indigo-200">{user.membership}</div>
									<div className="px-2 py-1 border-t-2 border-indigo-200">
										<button
											className={`flex items-center justify-center gap-1 rounded bg-gradient-to-r py-1 pl-2 pr-1.5 text-sm font-medium text-white  disabled:from-slate-500 disabled:to-slate-400
										${
											ticketsUser === user.username
												? 'from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400'
												: 'from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400'
										}`}
											onClick={() => {
												setTickets(user.tickets)
												setTicketsUser(user.username)
											}}
										>
											View {user.tickets.length} Tickets
											<TicketIcon className="w-6 h-6" />
										</button>
									</div>
									<div className="flex gap-2 px-2 py-1 border-t-2 border-indigo-200">
										{/* for membership */}
										{(user.membership === 'FREE' && user.role !== 'guest') && (
											<button
												className="flex w-[155px] items-center justify-center gap-1 rounded bg-gradient-to-r from-indigo-600 to-blue-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400"
												onClick={() => onUpdateUser({ id: user._id, membership: 'PREMIUM' })}
												disabled={isUpdating}
											>
												Set PREMIUM
												<ChevronDoubleUpIcon className="w-5 h-5" />
											</button>
										)}
										{(user.membership === 'PREMIUM' && user.role !== 'guest') && (
											<button
												className="flex w-[155px] items-center justify-center gap-1 rounded bg-gradient-to-r from-indigo-600 to-blue-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400"
												onClick={() => onUpdateUser({ id: user._id, membership: 'FREE' })}
												disabled={isUpdating}
											>
												Set FREE
												<ChevronDoubleDownIcon className="w-5 h-5" />
											</button>
										)}
										{(user.membership === 'FREE' && user.role === 'guest') && (
											<button
											className="flex w-[155px] items-center justify-center gap-1 rounded bg-gradient-to-r from-indigo-600 to-blue-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400"
											onClick={() => {}}
											disabled={true}
										>
											Guest
										</button>
										)}
										
										{user.role === 'user' && (
											<button
												className="flex w-[115px] items-center justify-center gap-1 rounded bg-gradient-to-r from-indigo-600 to-blue-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400"
												onClick={() => onUpdateUser({ id: user._id, role: 'admin' })}
												disabled={isUpdating}
											>
												Set Admin
												<ChevronDoubleUpIcon className="w-5 h-5" />
											</button>
										)}
										{user.role === 'admin' && (
											<button
												className="flex w-[115px] items-center justify-center gap-1 rounded bg-gradient-to-r from-indigo-600 to-blue-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400"
												onClick={() => onUpdateUser({ id: user._id, role: 'user' })}
												disabled={isUpdating}
											>
												Set User
												<ChevronDoubleDownIcon className="w-5 h-5" />
											</button>
										)}
										{user.role === 'guest' && (
											<button
												className="flex w-[115px] items-center justify-center gap-1 rounded bg-gradient-to-r from-indigo-600 to-blue-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400"
												onClick={() => {}}
												disabled={true}
											>
												Guest
											</button>
										)}
										<button
											className="flex w-[115px] items-center justify-center gap-1 rounded bg-gradient-to-r from-red-700 to-rose-600 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-red-600 hover:to-rose-500 disabled:from-slate-500 disabled:to-slate-400"
											onClick={() => handleDelete({ id: user._id, username: user.username })}
											disabled={isDeleting}
										>
											DELETE
											<TrashIcon className="w-5 h-5" />
										</button>
									</div>
								</Fragment>
							)
						})}
				</div>
				{ticketsUser && (
					<>
						<h2 className="mt-4 text-2xl font-bold text-gray-900">Viewing {ticketsUser}'s tickets</h2>
						{tickets.length === 0 ? (
							<p className="text-center">This user have not purchased any tickets yet</p>
						) : (
							<div className="grid grid-cols-1 gap-4 xl:grid-cols-2 min-[1920px]:grid-cols-3">
								{tickets.map((ticket, index) => {
									return (
										<div className="flex flex-col" key={index}>
											<ShowtimeDetails showtime={ticket.showtime} />
											<div className="flex flex-col justify-between h-full text-lg text-center rounded-b-lg bg-gradient-to-br from-indigo-200 to-indigo-200 drop-shadow-lg md:flex-row">
												<div className="flex flex-col items-center h-full px-4 py-2 gap-x-4 md:flex-row">
													<p className="font-semibold whitespace-nowrap">Seats : </p>
													<p>
														{ticket.seats.map((seat) => seat.row + seat.number).join(', ')}
													</p>
													<p className="whitespace-nowrap">({ticket.seats.length} seats)</p>
												</div>
											</div>
										</div>
									)
								})}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
}

export default User
