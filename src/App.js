import React, { useEffect, useState } from "react";
import Amplify, { Auth, Hub, Logger } from "aws-amplify";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import CircularProgress from "@material-ui/core/CircularProgress";

import "./App.css";
import { ReactComponent as Work } from "./work.svg";

Amplify.configure({
  Auth: {
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEBCLIENT_ID,
    authenticationFlowType: "CUSTOM_AUTH",
  },
});

export default function App() {
  let [user, setUser] = useState(undefined);
  let [phoneNumber, setPhoneNumber] = useState("");
  let [countryCode, setCountryCode] = useState("");
  let [otp, setOtp] = useState("");
  let [isLoggedIn, setIsLoggedIn] = useState(false);
  let [signInUpClass, setSignInUpClass] = useState("");
  let [open, setSnackBarOpen] = useState(false);
  let [isLoading, setLoading] = useState(true);
  let [buttonLoading, setButtonLoading] = useState("");
  let [snackBarMessage, setSnackBarMessage] = useState("");

  useEffect(() => {
    console.log(isLoggedIn);
    Auth.currentSession()
      .then((response) => {
        if (response) {
          setIsLoggedIn(true);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (error) {
          setIsLoggedIn(false);
          setLoading(false);
        }
      });
  }, [isLoggedIn]);

  function handleRenderSignInUpClass() {
    if (signInUpClass.length === 0) {
      setSignInUpClass("right-panel-active");
    } else {
      setSignInUpClass("");
    }
  }
  function handleSubmitOTP() {
    setButtonLoading("fa fa-circle-o-notch fa-spin");
    Auth.sendCustomChallengeAnswer(user, otp)
      .then((response) => {
        console.log("submitotp", response);
        console.log("Signin Successful");
        setIsLoggedIn(true);
        setLoading(false);
        setCountryCode("");
        setPhoneNumber("");
        setOtp("");
        setButtonLoading("");
      })
      .catch((error) => {
        console.log("Challenge Error", error);
        setLoading(false);
      });
  }

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  function handleSignIn() {
    setButtonLoading("fa fa-circle-o-notch fa-spin");
    let phone = phoneNumber;
    Auth.signIn(`${countryCode}${phone}`)
      .then((signInUser) => {
        console.log(signInUser);
        setUser(signInUser);
        setButtonLoading("");
      })
      .catch((error) => {
        console.log("SignIn Error: ", error);
        if (error.code === "UserLambdaValidationException") {
          setSnackBarOpen(true);
          setSnackBarMessage("Please sign up");
          setButtonLoading("");
        }
      });
  }

  function handleSignOut() {
    setButtonLoading("fa fa-circle-o-notch fa-spin");
    Auth.signOut().then(() => {
      setIsLoggedIn(false);
      setLoading(false);
      setButtonLoading("");
    });
  }

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackBarOpen(false);
  };

  function handleSignup() {
    setButtonLoading("fa fa-circle-o-notch fa-spin");
    let phone = phoneNumber;
    Auth.signUp({
      username: `${countryCode}${phone}`,
      password: Date.now().toString(),
    })
      .then((signup) => {
        console.log("SignUp Response: ", signup);
        setButtonLoading("");
      })
      .catch((error) => {
        if (error.code === "UsernameExistsException") {
          setSnackBarOpen(true);
          setSnackBarMessage("You are already signed up! Please Sign In");
          setButtonLoading("");
        }
      });
  }

  function handlePhoneNumberChange(e) {
    setPhoneNumber(e.target.value);
  }
  function handleCountryCodeChange(e) {
    setCountryCode(e.target.value);
  }

  function handleOTPChange(e) {
    setOtp(e.target.value);
  }

  return (
    <div>
      {isLoading ? (
        <CircularProgress />
      ) : isLoggedIn ? (
        <div>
          <Work />
          <div>
            <button className="signout-button" onClick={handleSignOut}>
              <i class={buttonLoading} />
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className={`container ${signInUpClass}`} id="container">
          <div className="form-container sign-up-container">
            <form action="#" onSubmit={(e) => e.preventDefault()}>
              <h1>Create Account</h1>
              <input
                type="text"
                onChange={handleCountryCodeChange}
                value={countryCode}
                placeholder="Country Code"
              ></input>
              <input
                type="text"
                pattern="[0-9]*"
                onChange={handlePhoneNumberChange}
                value={phoneNumber}
                placeholder="Phone Number"
              ></input>
              <button className="submit-button" onClick={handleSignup}>
                <i class={buttonLoading} /> Sign Up
              </button>
            </form>
          </div>
          <div className="form-container sign-in-container">
            <form action="#" onSubmit={(e) => e.preventDefault()}>
              {!user ? (
                <div>
                  <h1>Sign in</h1>
                  <input
                    type="text"
                    onChange={handleCountryCodeChange}
                    value={countryCode}
                    placeholder="Country Code"
                  ></input>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    onChange={handlePhoneNumberChange}
                    value={phoneNumber}
                    placeholder="Phone Number"
                  ></input>
                  <button className="submit-button" onClick={handleSignIn}>
                    <i class={buttonLoading} /> Sign In
                  </button>
                </div>
              ) : (
                <div>
                  <h1>Submit OTP</h1>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    onChange={handleOTPChange}
                    value={otp}
                    placeholder="OTP"
                  ></input>
                  <button className="submit-button" onClick={handleSubmitOTP}>
                    <i class={buttonLoading} /> Submit OTP
                  </button>
                </div>
              )}
            </form>
          </div>
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1>Welcome Back!</h1>
                <p>
                  To keep connected with us please login with your personal info
                </p>
                <button
                  className="ghost"
                  id="signIn"
                  onClick={handleRenderSignInUpClass}
                >
                  Sign In
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1>Hello, Friend!</h1>
                <p>Enter your personal details and start journey with us</p>
                <button
                  className="ghost"
                  id="signUp"
                  onClick={handleRenderSignInUpClass}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
          <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
            <Alert severity="success" onClose={handleClose}>
              {snackBarMessage}
            </Alert>
          </Snackbar>
        </div>
      )}
    </div>
  );
}
