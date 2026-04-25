import { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // email/password authentication
  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", "")); // Clean up the error message
    }
  };

  // google authentication
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg text-text-primary p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-sidebar p-8 rounded-[32px] border border-border/40 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-text-primary rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <div className="w-5 h-5 bg-bg rounded-sm rotate-45"></div>
          </div>
          <h2 className="text-2xl font-black tracking-tight">FiscalFlow</h2>
          <p className="text-text-secondary text-sm mt-1">
            {isLogin ? "Welcome back" : "Create your account"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-text-primary transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-text-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="h-12 w-full mt-2 bg-text-primary text-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg"
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-xs text-text-secondary font-medium">OR</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="h-12 w-full mt-6 bg-bg border border-border rounded-xl text-sm font-bold flex items-center justify-center gap-3 hover:bg-border/20 transition-all text-text-primary"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
            alt="Google"
          />
          Continue with Google
        </button>

        <p className="text-center mt-8 text-xs text-text-secondary font-medium">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-text-primary font-bold hover:underline ml-1"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
