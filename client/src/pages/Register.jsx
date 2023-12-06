import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
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
      // Handle the registration logic
      const response = await axios.post("/auth/register", data);

      // Simulate payment completion
      if (data.membership === "PREMIUM") {
        setIsPaymentCompleted(true);
      }

      toast.success("Registration successful!", {
        position: "top-center",
        autoClose: 500,
        pauseOnHover: false,
      });

      navigate("/login");
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
  };

  const inputClasses = () => {
    return "appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-blue-500";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-4 shadow-xl">
        <div>
          <h2 className="mt-4 text-center text-4xl font-extrabold text-gray-900">
            Register
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
              htmlFor="username"
              className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              name="username"
              type="text"
              {...register("username", { required: true })}
              className={inputClasses`${
                errors.username ? "border-red-500" : ""
              }`}
              placeholder="Username"
            />
            {errors.username && (
              <span className="text-sm text-red-500">Username is required</span>
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
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              })}
              className={inputClasses`${
                errors.password ? "border-red-500" : ""
              }`}
              placeholder="Password"
            />
            {errors.password && (
              <span className="text-sm text-red-500">
                {errors.password?.message}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="membership"
              className="block text-sm font-medium text-gray-700">
              Membership
            </label>
            <select
              name="membership"
              {...register("membership", { required: true })}
              className={inputClasses`${
                errors.membership ? "border-red-500" : ""
              }`}>
              <option value="" disabled selected>
                Select Membership
              </option>
              <option value="FREE">FREE</option>
              <option value="PREMIUM">PREMIUM</option>
            </select>
            {errors.membership && (
              <span className="text-sm text-red-500">
                Membership is required
              </span>
            )}
          </div>

          {watch("membership") === "PREMIUM" && !isPaymentCompleted && (
            <div className="mt-4 p-4 border rounded-md bg-gray-100">
              <p className="text-md font-semibold text-gray-700 mb-2">
                Premium Membership: $15
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Thank you for choosing our Premium membership! A one-time
                payment of $15 is required for access to premium features.
              </p>
              <button
                type="button"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                onClick={() => {
                  setIsPaymentCompleted(true);
                  alert("Simulating payment processing...");
                }}
                disabled={
                  isPaymentCompleted && watch("membership") === "PREMIUM"
                }>
                Pay $15
              </button>
            </div>
          )}

          {isPaymentCompleted && (
            <div className="flex items-center text-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-5 w-5 mr-2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Payment completed!
            </div>
          )}

          <div>
            {errorsMessage && (
              <span className="text-sm text-red-500">{errorsMessage}</span>
            )}
            <button
              type="submit"
              className="mt-4 w-full rounded-md bg-blue-600 bg-gradient-to-br from-indigo-600 to-blue-500 py-2 px-4 font-medium text-white drop-shadow-md hover:bg-blue-700 hover:from-indigo-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:from-slate-500 disabled:to-slate-400"
              disabled={
                ((isRegistering || isPaymentCompleted === false) &&
                watch("membership") === "PREMIUM")
              }>
              {isRegistering ? "Processing..." : "Register"}
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

export default Register;
