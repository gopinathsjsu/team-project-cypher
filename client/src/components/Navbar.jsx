import {
  ClockIcon,
  FilmIcon,
  HomeModernIcon,
  MagnifyingGlassIcon,
  TicketIcon,
  UsersIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { Bars3Icon } from "@heroicons/react/24/solid";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"


const Navbar = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, SetLoggingOut] = useState(false);
  const [isAlertDialogOpen, setAlertDialogOpen] = useState(false);
	const [isUpdating, SetIsUpdating] = useState(false)

  

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navigate = useNavigate();

  const updateAuthMe = async (data) => {
		try {
			if (!auth.token) return
			const response = await axios.get('/auth/me', {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})

			const updatedAuth = {
				...auth,
				_id: response.data.data._id,
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
				updatedAuth.reward_points !== auth.reward_points ||
				updatedAuth._id !== auth._id 

			) {
				setAuth(updatedAuth)
			}
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		updateAuthMe()
		localStorage.setItem('auth', JSON.stringify(auth))
	}, [auth])

	// useEffect(() => {
	// 	fetchUsers()
	// }, [])

  const actionButton = auth.membership === 'PREMIUM'
    ? { text: 'Yes', className: 'bg-red-500 text-white' }
    : { text: 'Pay $15', className: 'bg-blue-500 text-white hover:bg-green-500' };

  const handleAlertDialogAction = async (data) =>  {
    try {
			SetIsUpdating(true)
      if (auth.membership === 'PREMIUM') {
        data = {...data, membership: 'FREE'}
      } else {
        data = {...data, membership: 'PREMIUM'}
      }
			const response = await axios.put(`/auth/user/${data.id}`, data, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			// fetchUsers()
      updateAuthMe()
			toast.success(`Membership updated successful!`, {
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

    // Close the AlertDialog
    setAlertDialogOpen(false);
  };

  const handleAlertDialogCancel = () => {
    setAlertDialogOpen(false);
  };

  const onLogout = async () => {
    try {
      SetLoggingOut(true);
      const response = await axios.get("/auth/logout");
      // console.log(response)
      setAuth({
        _id: null,
        username: null,
        email: null,
        role: null,
        membership: null,
        reward_points: null,
        token: null
      });
      sessionStorage.clear();
      navigate("/");
      toast.success("Logout successful!", {
        position: "top-center",
        autoClose: 500,
        pauseOnHover: false,
      });
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        position: "top-center",
        autoClose: 500,
        pauseOnHover: false,
      });
    } finally {
      SetLoggingOut(false);
    }
  };

  const menuLists = () => {
    return (
      <>
        <div className="flex flex-col gap-2 lg:flex-row">
          <Link
            to={"/cinema"}
            className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-white hover:bg-gray-500 ${
              window.location.pathname === "/cinema"
                ? "bg-gradient-to-br from-indigo-800 to-blue-700"
                : "bg-gray-600"
            }`}>
            <HomeModernIcon className="w-6 h-6" />
            <p>Cinema</p>
          </Link>
          <Link
            to={"/schedule"}
            className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-white hover:bg-gray-500 ${
              window.location.pathname === "/schedule"
                ? "bg-gradient-to-br from-indigo-800 to-blue-700"
                : "bg-gray-600"
            }`}>
            <ClockIcon className="w-6 h-6" />
            <p>Schedule</p>
          </Link>

          {auth.role !== 'guest' && (
            <>
              {auth.role && (
                <Link
                  to={"/ticket"}
                  className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-white hover:bg-gray-500 ${
                    window.location.pathname === "/ticket"
                      ? "bg-gradient-to-br from-indigo-800 to-blue-700"
                      : "bg-gray-600"
                  }`}>
                  <TicketIcon className="w-6 h-6" />
                  <p>Ticket</p>
                </Link>
              )}

              {auth.role === "admin" && (
                <>
                  <Link
                    to={"/movie"}
                    className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-white hover:bg-gray-500 ${
                      window.location.pathname === "/movie"
                        ? "bg-gradient-to-br from-indigo-800 to-blue-700"
                        : "bg-gray-600"
                    }`}>
                    <VideoCameraIcon className="w-6 h-6" />
                    <p>Movie</p>
                  </Link>
                  <Link
                    to={"/search"}
                    className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-white hover:bg-gray-500 ${
                      window.location.pathname === "/search"
                        ? "bg-gradient-to-br from-indigo-800 to-blue-700"
                        : "bg-gray-600"
                    }`}>
                    <MagnifyingGlassIcon className="w-6 h-6" />
                    <p>Search</p>
                  </Link>
                  <Link
                    to={"/user"}
                    className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-white hover:bg-gray-500 ${
                      window.location.pathname === "/user"
                        ? "bg-gradient-to-br from-indigo-800 to-blue-700"
                        : "bg-gray-600"
                    }`}>
                    <UsersIcon className="w-6 h-6" />
                    <p>User</p>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 grow lg:justify-end">
        {auth.role !== 'guest' && (<>{auth.reward_points !== null && (
            <>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-10 font-bold text-white rounded-lg bg-gold-500">
                  <span className="text-3xl">💰</span>
                  <span className="ml-1 text-xl text-white">
                    {auth.reward_points}
                  </span>
                </div>
              </div>
            </>
          )}{" "}
          {auth.username && (
            <p className="leading-none text-white text-md whitespace-nowrap">
              {auth.membership && (
                
                <AlertDialog isOpen={isAlertDialogOpen} onClose={() => setAlertDialogOpen(false)}>
        <AlertDialogTrigger asChild>
          <Button
            className={`font-bold px-2 py-1 ${
              auth.membership === "PREMIUM"
                ? "bg-yellow-500 text-gray-900 shadow-md"
                : "bg-green-500 text-gray-900 shadow-md"
            }`}
            onClick={() => setAlertDialogOpen(true)}
          >
            {auth.membership}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {auth.membership === 'PREMIUM'
                ? 'Are you sure to cancel PREMIUM membership?'
                : 'Upgrade to PREMIUM membership'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {auth.membership === 'PREMIUM'
                ? 'This action cannot be undone. This will permanently cancel your premium membership.'
                : 'Unlock exclusive features by upgrading to our premium membership.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAlertDialogCancel}>No</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAlertDialogAction({ id: auth._id })} className={actionButton.className}>
              {actionButton.text}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
              )}{" "}
              Welcome {auth.username}!
            </p>
          )}
          {auth.token ? (
            <Button
              className="px-2 py-1 text-white rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 drop-shadow-md hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400"
              onClick={() => onLogout()}
              disabled={isLoggingOut}>
              {isLoggingOut ? "Processing..." : "Logout"}
            </Button>
          ) : (
            <Button className="px-2 py-1 text-white rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 drop-shadow-md hover:from-indigo-500 hover:to-blue-400">
              <Link to={"/login"}>Login</Link>
            </Button>
          )}
      </>
        )}

        {auth.role === 'guest' &&(<>
        <p className="leading-none text-white text-md whitespace-nowrap">Welcome Guest!</p>
        <Button className="px-2 py-1 text-white rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 drop-shadow-md hover:from-indigo-500 hover:to-blue-400">
              <Link to={"/login"}>Login</Link>
            </Button>
        </>)}
        </div>
      </>
    );
  };

  return (
    <nav className="flex flex-col items-center justify-between gap-2 px-4 py-3 bg-gray-900 drop-shadow-lg lg:flex-row lg:justify-start sm:px-8">
      <div className="flex flex-row justify-between w-full lg:w-fit">
        <Button
          className="flex flex-row items-center gap-2"
          onClick={() => navigate("/")}>
          <FilmIcon className="w-8 h-8 text-white" />
          <h1 className="mr-2 text-xl text-white">Cinemax</h1>
        </Button>
        <Button
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-700 lg:hidden"
          onClick={() => toggleMenu()}>
          <Bars3Icon className="w-6 h-6 text-white" />
        </Button>
      </div>
      <div className="justify-between hidden gap-2 grow lg:flex">
        {menuLists()}
      </div>
      {menuOpen && (
        <div className="flex flex-col w-full gap-2 grow lg:hidden">
          {menuLists()}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
