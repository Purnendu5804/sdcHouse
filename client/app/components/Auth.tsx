import React, { useState, useEffect } from "react";
import { 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  KeyRound, 
  Activity 
} from "lucide-react";

interface UserProfile {
  email: string;
  username: string;
  displayName: string;
  password?: string;
}

interface AuthProps {
  onSuccess: (user: UserProfile) => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  
  // SignIn specific field (accepts either username or email)
  const [loginIdentifier, setLoginIdentifier] = useState("");

  // Loading messages to give it a premium, high-tech spatial collaboration feel!
  const loadingMessages = [
    "Establishing secure tunnel...",
    "Decrypting identity protocol...",
    "Syncing spatial avatar matrix...",
    "Connecting to sdcHouse grid...",
    "Entering virtual lobby..."
  ];

  // Cycling loading text effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 350);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Dynamic Password Strength Meter
  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "bg-slate-700", width: "w-0", textColor: "text-slate-500" };
    if (password.length < 6) return { label: "Weak (Min. 6 chars)", color: "bg-rose-500", width: "w-1/3", textColor: "text-rose-400" };
    
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    if (password.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
      return { label: "Excellent Strength", color: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]", width: "w-full", textColor: "text-emerald-400" };
    }
    if (password.length >= 6 && hasLetters && hasNumbers) {
      return { label: "Medium Strength", color: "bg-amber-500", width: "w-2/3", textColor: "text-amber-400" };
    }
    
    return { label: "Weak (Add letters/numbers)", color: "bg-rose-500", width: "w-1/3", textColor: "text-rose-400" };
  };

  const passwordStrength = getPasswordStrength();

  // Clear states when tab changes
  const handleTabChange = (tab: "signin" | "signup") => {
    setActiveTab(tab);
    setErrorMsg(null);
    setSuccessMsg(null);
    setPassword("");
  };

  // Simulated Database handlers inside LocalStorage
  const getRegisteredUsers = (): UserProfile[] => {
    if (typeof window === "undefined") return [];
    const usersJson = localStorage.getItem("sdc_users");
    return usersJson ? JSON.parse(usersJson) : [];
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Simple validations
    if (!email.trim() || !username.trim() || !displayName.trim() || !password.trim()) {
      setErrorMsg("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    const cleanedUsername = username.trim().toLowerCase();
    if (cleanedUsername.includes(" ")) {
      setErrorMsg("Username cannot contain spaces.");
      return;
    }

    const users = getRegisteredUsers();
    
    // Check duplication
    const userExists = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === cleanedUsername
    );

    if (userExists) {
      setErrorMsg("Username or email already registered.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newUser: UserProfile = {
        email: email.trim(),
        username: cleanedUsername,
        displayName: displayName.trim(),
        password: password
      };

      users.push(newUser);
      localStorage.setItem("sdc_users", JSON.stringify(users));
      
      // Auto session storage on successful registration
      localStorage.setItem("sdc_session", JSON.stringify({
        email: newUser.email,
        username: newUser.username,
        displayName: newUser.displayName
      }));

      setIsLoading(false);
      setSuccessMsg("Account successfully provisioned!");
      
      setTimeout(() => {
        onSuccess({
          email: newUser.email,
          username: newUser.username,
          displayName: newUser.displayName
        });
      }, 400);

    }, 1500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginIdentifier.trim() || !password.trim()) {
      setErrorMsg("Please enter both username/email and password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const users = getRegisteredUsers();
      const matchedUser = users.find(
        (u) => 
          (u.email.toLowerCase() === loginIdentifier.trim().toLowerCase() || 
           u.username.toLowerCase() === loginIdentifier.trim().toLowerCase()) && 
          u.password === password
      );

      if (!matchedUser) {
        setIsLoading(false);
        setErrorMsg("Invalid username/email or password.");
        return;
      }

      // Establish session
      localStorage.setItem("sdc_session", JSON.stringify({
        email: matchedUser.email,
        username: matchedUser.username,
        displayName: matchedUser.displayName
      }));

      setIsLoading(false);
      setSuccessMsg("Access granted. Initializing session...");

      setTimeout(() => {
        onSuccess({
          email: matchedUser.email,
          username: matchedUser.username,
          displayName: matchedUser.displayName
        });
      }, 400);

    }, 1500);
  };

  // Premium Quick Demo Entry Shortcut
  const handleQuickDemo = () => {
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const demoUser: UserProfile = {
        email: "demo.hacker@sdchouse.club",
        username: "demo_hacker",
        displayName: "Demo Hacker 💻"
      };

      localStorage.setItem("sdc_session", JSON.stringify(demoUser));
      setIsLoading(false);
      setSuccessMsg("Demo bypass authorized.");

      setTimeout(() => {
        onSuccess(demoUser);
      }, 400);

    }, 1200);
  };

  return (
    <div className="relative w-[440px] rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300">
      
      {/* Visual Header Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
      
      {/* Grid Pattern in Card background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06),transparent_70%)] pointer-events-none"></div>

      <div className="p-8 space-y-6 relative z-10">
        
        {/* Animated Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <div className="relative w-20 h-20 mb-6">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-ping"></div>
              {/* Spinning gradient ring */}
              <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500 border-r-purple-500 rounded-full animate-spin"></div>
              {/* Center icon */}
              <div className="absolute inset-3 bg-slate-900 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                <Activity size={24} className="text-indigo-400 animate-pulse" />
              </div>
            </div>
            <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tight">
              Loading sdcHouse
            </p>
            <p className="text-xs text-indigo-400 font-mono mt-2 h-4 transition-all duration-200">
              {loadingMessages[loadingStep]}
            </p>
          </div>
        )}

        {/* Tab Selector */}
        <div className="relative flex p-1.5 bg-slate-950/80 rounded-2xl border border-white/5">
          {/* Sliding Pill Selector */}
          <div 
            className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-transform duration-300 ease-out ${
              activeTab === "signup" ? "translate-x-full" : "translate-x-0"
            }`}
          />
          
          <button
            onClick={() => handleTabChange("signin")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl relative z-10 flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === "signin" ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LogIn size={16} />
            Sign In
          </button>
          
          <button
            onClick={() => handleTabChange("signup")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl relative z-10 flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === "signup" ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus size={16} />
            Sign Up
          </button>
        </div>

        {/* Dynamic Title Headers */}
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {activeTab === "signin" ? "Welcome Back" : "Register Access"}
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-medium">
            {activeTab === "signin" 
              ? "Decrypt your signature to enter sdcHouse grid" 
              : "Provision a new digital key to join our workspace"
            }
          </p>
        </div>

        {/* Validation Errors & Successes */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-200 text-left">
            <ShieldAlert className="text-rose-400 shrink-0 mt-0.5" size={17} />
            <span className="text-xs text-rose-300 font-medium leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-200 text-left">
            <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={17} />
            <span className="text-xs text-emerald-300 font-medium leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Authentication Forms */}
        <form onSubmit={activeTab === "signin" ? handleLogin : handleRegister} className="space-y-4 text-left">
          
          {/* Email / Username field for Sign In */}
          {activeTab === "signin" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={13} className="text-blue-400" />
                Username or Email
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="name@example.com or user_name"
                  required
                  className="relative w-full p-3.5 rounded-xl bg-slate-950/80 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none text-white placeholder-slate-600 transition-all font-medium text-sm"
                />
              </div>
            </div>
          )}

          {/* Email address field for Sign Up */}
          {activeTab === "signup" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Mail size={13} className="text-blue-400" />
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="programmer@club.com"
                  required
                  className="relative w-full p-3.5 rounded-xl bg-slate-950/80 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none text-white placeholder-slate-600 transition-all font-medium text-sm"
                />
              </div>
            </div>
          )}

          {/* Username & Display Name fields for Sign Up */}
          {activeTab === "signup" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={13} className="text-purple-400" />
                  Username
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="hacker123"
                    required
                    className="relative w-full p-3 bg-slate-950/80 border border-white/10 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 outline-none text-white placeholder-slate-600 transition-all font-medium text-xs rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={13} className="text-pink-400" />
                  Display Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Dev Hacker"
                    required
                    className="relative w-full p-3 bg-slate-950/80 border border-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 outline-none text-white placeholder-slate-600 transition-all font-medium text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Lock size={13} className="text-indigo-400" />
                Password
              </label>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="relative w-full p-3.5 pr-11 rounded-xl bg-slate-950/80 border border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none text-white placeholder-slate-600 transition-all font-medium text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength meter for Sign Up */}
            {activeTab === "signup" && password && (
              <div className="pt-1.5 space-y-1 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[10px] font-bold tracking-wide">
                  <span className="text-slate-500">PASSWORD HEALTH</span>
                  <span className={passwordStrength.textColor}>{passwordStrength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden p-[1px] border border-white/5">
                  <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}></div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="relative w-full group overflow-hidden rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 group-hover:scale-105 transition-transform duration-500"></div>
              
              {/* Outer hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white mix-blend-overlay transition-opacity duration-300"></div>
              
              <div className="relative py-4 px-6 flex items-center justify-center gap-2 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                <span>{activeTab === "signin" ? "Authorize Session" : "Provision Profile"}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </form>

        {/* Separator grid */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-[10px] font-extrabold text-slate-600 tracking-widest uppercase">
            OR BYPASS AUTH
          </span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        {/* Premium Quick Demo Access shortcut */}
        <div className="px-1 text-center">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-3.5 px-4 rounded-xl border border-white/10 bg-slate-950/40 hover:bg-slate-950/90 text-xs font-bold text-indigo-300 hover:text-white transition-all flex items-center justify-center gap-2 group hover:border-indigo-500/50 shadow-sm"
          >
            <KeyRound size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            Quick Demo Login (One-Click)
          </button>
          <p className="text-[10px] text-slate-500 font-medium mt-2">
            No signup required. Perfect for instant developer testing.
          </p>
        </div>

      </div>
    </div>
  );
}
