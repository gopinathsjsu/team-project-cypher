import React, { useState, useContext  } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";


const Guest = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const [errorsMessage, setErrorsMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const onSubmit = async (data) => {

    setIsRegistering(true);

    try {

        data = {...data, password: "guest1234", membership: "FREE", username: data.email, role: 'guest'}
      // Handle the registration logic
      const response = await axios.post("/auth/register", data);
      
      // Simulate payment completion
      if (data.membership === "PREMIUM") {
          setIsPaymentCompleted(true);
      }

      toast.success("Guest created successful!", {
        position: "top-center",
        autoClose: 500,
        pauseOnHover: false,
      });

    //   const loginResponse = await axios.post("/auth/login", data);
    //   navigate("/");
    } catch (error) {
      console.error(error.response.data);
      setErrorsMessage(error.response.data);
      toast.error("Error", {
        position: "top-center",
        autoClose: 500,
        pauseOnHover: false,
      });
    } finally {
      setIsRegistering(false);
    }

    try {
        const response = await axios.post("/auth/login", data);
        // console.log(response.data)
        // toast.success("Login successful!", {
        //   position: "top-center",
        //   autoClose: 500,
        //   pauseOnHover: false,
        // });
        setAuth((prev) => ({ ...prev, token: response.data.token }));
        navigate("/");
      } catch (error) {
        console.error(error.response.data);
        setErrorsMessage(error.response.data);
        toast.error("Error", {
          position: "top-center",
          autoClose: 500,
          pauseOnHover: false,
        });
      } finally {
        // SetLoggingIn(false);
      }
      navigate("/");
  };

  const inputClasses = () => {
    return "appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-blue-500";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-4 shadow-xl">
        <div>
          <h2 className="mt-4 text-center text-4xl font-extrabold text-gray-900">
            Guest
          </h2>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              name="name"
              type="text"
              {...register("name", { required: true })}
              className={inputClasses`${errors.name ? "border-red-500" : ""}`}
              placeholder="Your Name"
            />
            {errors.name && (
              <span className="text-sm text-red-500">Name is required</span>
            )}
          </div>

          

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              {...register("email", { required: true })}
              className={inputClasses`${errors.email ? "border-red-500" : ""}`}
              placeholder="Email"
            />
            {errors.email && (
              <span className="text-sm text-red-500">Email is required</span>
            )}
          </div>

          <div>
            {errorsMessage && (
              <span className="text-sm text-red-500">{errorsMessage}</span>
            )}
            <button
              type="submit"
              className="mt-4 w-full rounded-md bg-blue-600 bg-gradient-to-br from-indigo-600 to-blue-500 py-2 px-4 font-medium text-white drop-shadow-md hover:bg-blue-700 hover:from-indigo-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:from-slate-500 disabled:to-slate-400"
              >
              {isRegistering ? "Processing..." : "Continue"}
            </button>
          </div>
          <p className="text-right">
            Already have an account?{" "}
            <Link to={"/login"} className="font-bold text-blue-600">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Guest;
