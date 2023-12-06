import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import ShowtimeDetails from "../components/ShowtimeDetails";
import { AuthContext } from "../context/AuthContext";

const Tickets = () => {
  // const { auth } = useContext(AuthContext);
  const { auth, setAuth } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [isFetchingticketsDone, setIsFetchingticketsDone] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(30); // Default to 30 days 
  const [viewMode, setViewMode] = useState('Upcoming');

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
    fetchTickets(range);
  };

  const fetchTickets = async () => {
    try {
      setIsFetchingticketsDone(false);
      const response = await axios.get("/auth/tickets", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const currentDate = new Date();
      const startDate = new Date();
      startDate.setDate(currentDate.getDate() - selectedTimeRange);

      let filteredTickets = response.data.data.tickets;
      if (viewMode === 'Past') {
        filteredTickets = filteredTickets.filter(ticket => 
          new Date(ticket.showtime.showtime) < currentDate &&
          new Date(ticket.showtime.showtime) >= startDate
        );
      } else if (viewMode === 'Upcoming') {
        filteredTickets = filteredTickets.filter(ticket => 
          new Date(ticket.showtime.showtime) >= currentDate
        );
      }

      setTickets(filteredTickets.sort((a, b) => new Date(a.showtime.showtime) - new Date(b.showtime.showtime)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingticketsDone(true);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [selectedTimeRange, viewMode]);


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

  const handleCancelTicket = async (tickets) => {

    var ticketId = tickets._id;
    var showtimeId = tickets.showtime._id;

    // delete from user
    try {
      const response = await axios.delete(`/auth/tickets/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      console.log("Response Data:", response.data);
      updateAuthMe()
      if (response.data.success) {
        console.log(`Ticket with ID ${ticketId} canceled successfully from user`);
        fetchTickets();
      } else {
        console.log(`Failed to cancel ticket with ID ${ticketId} from user`);
      }
    } catch (error) {
      console.error(error);
    }
    
    // delete from showtime
try {
  // console.log(seatIds);
  const response = await axios.delete(`/showtime/${showtimeId}/tickets`, {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
    data: {
      seats: tickets.seats,
      user: auth,
    }
  });

  if (response.data.success) {
    updateAuthMe()
    console.log(`Ticket with ID ${ticketId} deleted successfully from showtime`);
    fetchTickets();
  } else {
    console.log(`Failed to cancel ticket with ID ${ticketId} from showtime`);
  }
} catch (error) {
  console.error(error);
}



  };

  return (
    <div className="flex flex-col min-h-screen gap-4 pb-8 text-gray-900 bg-gray-900 sm:gap-8">
      <Navbar />
      <div className="flex flex-col gap-4 p-4 mx-4 rounded-md h-fit bg-slate-400 drop-shadow-xl sm:mx-8 sm:p-6">
        <h2 className="text-3xl font-bold text-gray-900">My Tickets</h2>
        {/* View Mode Selection UI */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setViewMode('Past')}
            className={`px-4 py-2 text-white rounded-md ${viewMode === 'Past' ? 'bg-blue-600' : 'bg-blue-400'}`}
          >
            View Past Tickets
          </button>
          <button
            onClick={() => setViewMode('Upcoming')}
            className={`px-4 py-2 text-white rounded-md ${viewMode === 'Upcoming' ? 'bg-blue-600' : 'bg-blue-400'}`}
          >
            View Upcoming Tickets
          </button>
        </div>
        
        {/* Time Range Selection UI (only for Past tickets) */}
        {viewMode === 'Past' && (
          <div className="flex justify-center gap-4 mb-4">
            {[30, 60, 90].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-4 py-2 text-white rounded-md ${selectedTimeRange === range ? 'bg-blue-600' : 'bg-blue-400'}`}
              >
                Last {range} Days
              </button>
            ))}
          </div>
        )}
        
        {isFetchingticketsDone ? (
          <>
            {tickets.length === 0 ? (
              <p className="text-center">
                You have not purchased any tickets yet
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 min-[1920px]:grid-cols-3">
                {tickets.map((ticket, index) => {
                  return (
                    <div className="flex flex-col" key={index}>
                      <ShowtimeDetails showtime={ticket.showtime} />
                      <div className="flex flex-col justify-between h-full text-lg text-center rounded-b-lg bg-gradient-to-br from-indigo-200 to-indigo-200 drop-shadow-lg md:flex-row">
                        <div className="flex flex-col items-center h-full px-4 py-2 gap-x-4 md:flex-row">
                          <p className="font-semibold whitespace-nowrap">
                            Seats :{" "}
                          </p>
                          <p className="text-left">
                            {ticket.seats
                              .map((seat) => seat.row + seat.number)
                              .join(", ")}
                          </p>
                          <p className="whitespace-nowrap">
                            ({ticket.seats.length} seats)
                          </p>
                        </div>
                        {!(new Date(ticket.showtime.showtime)< new Date()) && <button
                          onClick={() =>
                            handleCancelTicket(ticket)
                          }
                          className="px-4 py-2 font-semibold text-white rounded-b-lg bg-gradient-to-br from-red-600 to-red-500 hover:from-red-500 hover:to-red-500"
                          >
                          Cancel Ticket
                        </button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
};

export default Tickets;
