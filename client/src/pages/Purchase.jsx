import { TicketIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import ShowtimeDetails from "../components/ShowtimeDetails";
import { AuthContext } from "../context/AuthContext";


const Purchase = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const location = useLocation();
  const showtime = location.state.showtime;
  const selectedSeats = location.state.selectedSeats || [];
  const [isPurchasing, setIsPurchasing] = useState(false);
  const TICKET_PRICE = 10;
  const [useRewards, setUseRewards] = useState(false);
  const [rewardPointsToDeduct, setRewardPointsToDeduct] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [isDiscountApplicable, setIsDiscountApplicable] = useState(false);
  var SERVICE_FEE = 1.5;
  {
    auth.membership === "FREE" ? (SERVICE_FEE = 1.5) : (SERVICE_FEE = 0);
  }
  

  const adjustedTicketPrice = isDiscountApplicable ? TICKET_PRICE - discount : TICKET_PRICE;
  console.log("adjusted price",adjustedTicketPrice)
  const ticketPrice = adjustedTicketPrice * selectedSeats.length;
  console.log("ticket price",ticketPrice)
  // const ticketPrice = TICKET_PRICE * selectedSeats.length;
  const totalServiceFee = SERVICE_FEE * selectedSeats.length;
  const maxDeductiblePoints = auth.reward_points/ 10;
  const [newTotalCostAfterRewards, setNewTotalCostAfterRewards] = useState(adjustedTicketPrice * selectedSeats.length + SERVICE_FEE * selectedSeats.length)
  const pointsToDeduct = Math.min(maxDeductiblePoints, newTotalCostAfterRewards);
  const deductedRewardPoints = pointsToDeduct*10
  useEffect(() => {
    const ticketPrice = adjustedTicketPrice * selectedSeats.length;
    const totalServiceFee = SERVICE_FEE * selectedSeats.length;
    let newTotal = ticketPrice + totalServiceFee;

    if (useRewards) {
      const pointsToDeduct = Math.min(maxDeductiblePoints, newTotal);
      newTotal -= pointsToDeduct;
    }

    setNewTotalCostAfterRewards(newTotal);
  }, [selectedSeats, SERVICE_FEE, useRewards, adjustedTicketPrice, maxDeductiblePoints]);

  const onPurchase = async (data) => {
    setIsPurchasing(true);
    try {
      const response = await axios.post(
        `/showtime/${showtime._id}`,
        { seats: selectedSeats },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
     
      if (useRewards) {
        await updateRewardPoints();
      } 


      navigate("/cinema");
      toast.success("Purchase seats successful!", {
        position: "top-center",
        autoClose: 500,
        pauseOnHover: false,
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message || "Error", {
        position: "top-center",
        autoClose: 500,
        pauseOnHover: false,
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  useEffect(() => {
    const showtimeDate = new Date(showtime.showtime); 
    if (showtimeDate.getDay() === 2 && showtimeDate.getHours() < 18) { // 2 represents Tuesday
      setDiscount(2); // Assuming a $2 discount, this can be dynamically set by the admin
      setIsDiscountApplicable(true);
    }
  }, [showtime]);

  const onUseRewards = () => {
    // console.log("ddjndjnjnj", useRewards)
    if (!useRewards) {
      setNewTotalCostAfterRewards(newTotalCostAfterRewards - pointsToDeduct)
      console.log(`In the useRewards true , total cost $${newTotalCostAfterRewards}`);
      setRewardPointsToDeduct(deductedRewardPoints)
      setUseRewards(true);
      
    } else {
      setRewardPointsToDeduct(0);
      setNewTotalCostAfterRewards(totalServiceFee + ticketPrice)
      setUseRewards(false);
    }
  };

  const updateRewardPoints = async () => {
    try {
      const updatedPoints = auth.reward_points - rewardPointsToDeduct;
      console.log(updatedPoints)
      const userid = auth._id
      const response = await axios.put(`/showtime/update-rewards/${userid}`, 
        { reward_points: updatedPoints  },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      // Update auth context with new reward points
      // setAuth({ ...auth, reward_points: updatedPoints });
    } catch (error) {
      console.error("Error updating reward points:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-gray-900 pb-8 sm:gap-8">
      <Navbar />
      <div className="mx-4 h-fit rounded-lg bg-slate-400 p-4 drop-shadow-xl sm:mx-8 sm:p-6">
        <ShowtimeDetails showtime={showtime} />
        <div className="flex flex-col justify-between rounded-b-lg bg-gradient-to-br from-indigo-200 to-indigo-200 text-center text-lg drop-shadow-lg px-4 pb-4 md:px-14 md: md:pb-4 md:flex-col">
          <table className="w-full px-60">
            <thead>
              <tr>
                <th colSpan="2" className="font-bold text-center text-4xl py-8">
                  Purchase Summary
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 text-right pr-4">
                  <strong className="font-semibold">Selected Seats:</strong>
                </td>
                <td className="py-2 text-left">
                  <p className="text-start">
                    {selectedSeats.length !== 0
                      ? `${selectedSeats.join(", ")} (${
                          selectedSeats.length
                        } seats)`
                      : ""}
                  </p>
                </td>
              </tr>

              <tr>
                <td className="py-2 text-right pr-4">
                  <strong className="font-semibold">Ticket Price:</strong>
                </td>
                <td className="py-2 text-left">
                  ${TICKET_PRICE * selectedSeats.length}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-right pr-4">
                  <strong className="font-semibold">Service Fee:</strong>
                </td>
                <td className="py-2 text-left">
                  ${SERVICE_FEE * selectedSeats.length}
                </td>
              </tr>
              

                {isDiscountApplicable && (
                  <tr>
                  <td className="py-2 text-right pr-4">
                    <strong className="font-semibold">Discount:</strong>
                  </td>
                  <td className="py-2 text-left">-${discount * selectedSeats.length}</td>
                  </tr>
                )}
              

              <tr>
                <td className="py-2 text-right">
                  <p>---------------------------</p>
                </td>
                <td className="py-2 text-left">
                  <p>----------------------------</p>
                </td>
                
              </tr>
              <tr>
                <td className="py-2 text-right pr-4 text-lg font-bold">
                  <strong>Total Cost:</strong>
                </td>
                <td className="py-2 text-left text-lg font-bold">
                  $
                  {newTotalCostAfterRewards}
                </td>
              </tr>
              
              <tr>
                
              <td className="py-2 text-left flex items-center">
              {auth.is_guest !== true && auth.reward_points > 0 && (
              <div className="flex items-center gap-2">
              <strong className="font-semibold">Use Reward Points</strong>
              <label className="flex items-center cursor-pointer">
              <input
                  type="checkbox"
                  id="useRewardsCheckbox"
                  checked={useRewards}
                  onChange={() => onUseRewards()}
                className="sr-only" // Hide the default checkbox
              />
            <span className="block bg-white border-2 border-gray-300 rounded w-5 h-5 flex justify-center items-center">
            <span className={`transform transition-transform ${useRewards ? 'scale-100' : 'scale-0'} block bg-blue-500 rounded-sm w-3 h-3`}></span>
        </span>
      </label>
    </div>
  )}
</td>
              </tr>
            </tbody>
          </table>

          {!!selectedSeats.length && (
            <button
              onClick={() => onPurchase()}
              className="flex items-center justify-center gap-2 rounded-b-lg bg-gradient-to-br from-indigo-600 to-blue-500 px-4 py-1 font-semibold text-white hover:from-indigo-500 hover:to-blue-500 disabled:from-slate-500 disabled:to-slate-400 md:rounded-none md:rounded-br-lg"
              disabled={isPurchasing}>
              {isPurchasing ? (
                "Processing..."
              ) : (
                <>
                  <p>Confirm Purchase</p>
                  <TicketIcon className="h-7 w-7 text-white" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Purchase;
