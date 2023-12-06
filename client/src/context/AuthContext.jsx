import axios from 'axios'
import { createContext, useEffect, useState } from 'react'

const AuthContext = createContext()

const AuthContextProvider = ({ children }) => {
	const [auth, setAuth] = useState(
		JSON.parse(localStorage.getItem('auth')) || {
			username: null,
			email: null,
			role: null,
			membership: null,
			reward_points: null,
			token: null
		}
	) //{username, email, role, token}

	const getUser = async () => {
		try {
			if (!auth.token) return
			const response = await axios.get('/auth/me', {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})

			const updatedAuth = {
				...auth,
				username: response.data.data.username,
				email: response.data.data.email,
				role: response.data.data.role,
				membership: response.data.data.membership,
				reward_points: response.data.data.reward_points
			}

			if (
				updatedAuth.username !== auth.username ||
				updatedAuth.email !== auth.email ||
				updatedAuth.role !== auth.role ||
				updatedAuth.membership !== auth.membership ||
				updatedAuth.reward_points !== auth.reward_points

			) {
				setAuth(updatedAuth)
			}
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		getUser()
		localStorage.setItem('auth', JSON.stringify(auth))
	}, [auth])

	return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthContextProvider }
