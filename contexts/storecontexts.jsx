// // src/contexts/storecontexts.js
// import { createContext, useContext, useEffect, useMemo, useState } from "react";

// const StoreContext = createContext(undefined);

// // helper to remove sensitive fields before storing user client-side
// const sanitizeUser = (user) => {
//   if (!user) return null;
//   // create shallow copy and remove sensitive keys
//   const { password, ...rest } = user;
//   // if you want to remove more keys, add them here, e.g. const { password, secret, ssn, ...rest } = user;
//   return rest;
// };

// export const StoreProvider = ({ children }) => {
//   // token from localStorage (optional; backend may rely on httpOnly cookie)
//   const [token, setToken] = useState(() => {
//     try {
//       if (typeof window === "undefined") return null;
//       return localStorage.getItem("token");
//     } catch {
//       return null;
//     }
//   });

//   const [user, setUser] = useState(() => {
//     try {
//       if (typeof window === "undefined") return null;
//       const raw = localStorage.getItem("user");
//       const parsed = raw ? JSON.parse(raw) : null;
//       return sanitizeUser(parsed);
//     } catch {
//       return null;
//     }
//   });

//   // loading indicates we're verifying session (used by route guards)
//   const [loading, setLoading] = useState(true);

//   // const isLoggedIn = useMemo(() => !!token || !!user, [token, user]);

  
// const getToken = () => {
//   try {
//     const token = localStorage.getItem("token");
//     const expiry = parseInt(localStorage.getItem("tokenExpiry"), 10);

//     if (!token || !expiry) return null;
//     if (Date.now() > expiry) {
//       // token expired — clear storage
//       localStorage.removeItem("token");
//       localStorage.removeItem("tokenExpiry");
//       setToken(null);
//       setUser(null);
//       return null;
//     }

//     return token;
//   } catch {
//     return null;
//   }
// };


//   const isLoggedIn = useMemo(() => !!getToken() && !!user, [token, user]);


//   // keep localStorage in sync (still useful for client-side state)
//   useEffect(() => {
//     try {
//       const toStore = sanitizeUser(user);
//       if (toStore && Object.keys(toStore).length > 0) {
//         localStorage.setItem("user", JSON.stringify(toStore));
//       } else {
//         localStorage.removeItem("user");
//       }
//     } catch { }
//   }, [user]);

//   useEffect(() => {
//     try {
//       if (token) {
//         const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
//         localStorage.setItem("token", token);
//         localStorage.setItem("tokenExpiry", expiresAt);

//       } else {
//         localStorage.removeItem("token");
//       }
//     } catch { }
//   }, [token]);

//   // Call backend to verify session / get current user.
//   // This supports both cookie-based auth (httpOnly cookie) and token-in-localStorage flows.
//   // const verifySession = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";
//   //     // Call a safe endpoint that returns the logged user when valid
//   //     const res = await fetch(`${BASE}/auth/verify/me`, {
//   //       method: "GET",
//   //       credentials: "include", // required if backend uses cookies
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         // include local token if server expects Authorization header (optional)
//   //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   //       },
//   //     });

//   //     if (!res.ok) {
//   //       // Not authorized or no session
//   //       setUser(null);
//   //       // If server provides a new token or info, you can parse here.
//   //       // Optionally clear token: setToken(null)
//   //       setLoading(false);
//   //       return null;
//   //     }

//   //     const data = await res.json();
//   //     // expected: { user: {...} } or user object — adapt if needed
//   //     const fetchedUser = data.user ?? data;
//   //     console.log(fetchedUser)
//   //     setUser(sanitizeUser(fetchedUser));
//   //     // If backend returns token rotation, handle it like:
//   //     // if (data.token) setToken(data.token)
//   //     setLoading(false);
//   //     return fetchedUser;
//   //   } catch (err) {
//   //     console.error("verifySession error:", err);
//   //     setUser(null);
//   //     setLoading(false);
//   //     return null;
//   //   }
//   // };

//   const verifySession = async () => {
//   setLoading(true);
//   try {
//     const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

//     // prefer state token, fallback to localStorage token (helpful after reload)
//     const localToken = (() => {
//       try { return localStorage.getItem("token"); } catch { return null; }
//     })();
//     const effectiveToken = token || localToken || null;

//     // build headers
//     const headers = { "Content-Type": "application/json" };
//     if (effectiveToken) headers["Authorization"] = `Bearer ${effectiveToken}`;

//     const res = await fetch(`${BASE}/auth/verify/me`, {
//       method: "GET",
//       credentials: "include", // still include cookie if browser will send it
//       headers,
//     });

//     if (!res.ok) {
//       setUser(null);
//       setLoading(false);
//       return null;
//     }

//     const data = await res.json();
//     const fetchedUser = data.user ?? data;
//     setUser(sanitizeUser(fetchedUser));
//     setLoading(false);
//     return fetchedUser;
//   } catch (err) {
//     console.error("verifySession error:", err);
//     setUser(null);
//     setLoading(false);
//     return null;
//   }
// };


// useEffect(() => {
//   const t = getToken();
//   if (!t) {
//     setUser(null);
//     setLoading(false);
//   } else {
//     verifySession();
//   }
// }, []);


// useEffect(() => {
//   if (token) {
//     const expiry = parseInt(localStorage.getItem("tokenExpiry"), 10);
//     const timeout = expiry - Date.now();
//     if (timeout > 0) {
//       const timer = setTimeout(() => LogoutTrue(false), timeout);
//       return () => clearTimeout(timer);
//     } else {
//       LogoutTrue(false);
//     }
//   }
// }, [token]);



//   // Centralized login: save token (if provided) and user
//   const login = ({ token: newToken, user: newUser }) => {
//     if (newToken) setToken(newToken);
//     if (newUser) setUser(sanitizeUser(newUser));
//   };

//   // Logout: clear local state and optionally call backend logout
//   // const LogoutTrue = async (callBackend = true) => {
//   //   try {
//   //     if (callBackend) {
//   //       const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";
//   //       await fetch(`${BASE}/auth/logout`, {
//   //         // method: "POST",
//   //         // method: "DELETE",
//   //         credentials: "include",
//   //         headers: { "Content-Type": "application/json" },
//   //       }).catch(() => { });
//   //     }
//   //   } catch (e) {
//   //     // swallow
//   //   } finally {
//   //     setToken(null);
//   //     setUser(null);
//   //   }
//   // };

//   const LogoutTrue = async (callBackend = true) => {
//   const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

//   try {
//     const bearertoken = token;
//     // 1) Immediately clear client-side session so route guards update instantly
//     setToken(null);
//     setUser(null);
//     try { localStorage.removeItem("token"); } catch {}
//     try { localStorage.removeItem("user"); } catch {}

//     // 2) Then ask backend to clear the httpOnly cookie (still await if you want)
//     if (callBackend) {
//       await fetch(`${BASE}/auth/logout`, {
//         method: "DELETE",               // <<< important — match backend route
//         credentials: "include",
//         headers: { "Content-Type": "application/json",
//           Authorization: bearertoken ? `Bearer ${bearertoken}` : ""
//          },
//       }).catch(() => { /* swallow network errors if desired */ });
//     }
//   } catch (e) {
//     // swallow or log
//     console.error("LogoutTrue error:", e);
//   } 
// };


//   // fetch fresh user on demand
//   const getUser = async () => {
//     return verifySession();
//   };

//   // helper for role checking
//   const hasRole = (role) => {
//     if (!user) return false;
//     return user.role === role || (Array.isArray(user.roles) && user.roles.includes(role));
//   };


//   const value = useMemo(
//     () => ({ token, isLoggedIn, user, login, LogoutTrue, getUser, verifySession, loading, hasRole, getToken }),
//     [token, isLoggedIn, user, loading]
//   );

//   return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
// };

// export const useStore = () => {
//   const ctx = useContext(StoreContext);
//   if (!ctx) throw new Error("useStore must be used inside a StoreProvider");
//   return ctx;
// };
















// // // src/contexts/storecontexts.js
// import { createContext, useContext, useEffect, useMemo, useState } from "react";

// const StoreContext = createContext(undefined);

// // helper to remove sensitive fields before storing user client-side
// const sanitizeUser = (user) => {
//   if (!user) return null;
//   // create shallow copy and remove sensitive keys
//   const { password, ...rest } = user;
//   // if you want to remove more keys, add them here
//   return rest;
// };

// // helper: decode jwt payload (client-side only, no verification)
// const decodeJwt = (token) => {
//   try {
//     if (!token || typeof token !== "string") return null;
//     const parts = token.split(".");
//     if (parts.length < 2) return null;
//     const payload = parts[1];
//     // atob can throw on invalid base64
//     const json = typeof atob === "function" ? atob(payload.replace(/-/g, "+").replace(/_/g, "/")) : Buffer.from(payload, "base64").toString("utf8");
//     return JSON.parse(json);
//   } catch {
//     return null;
//   }
// };

// export const StoreProvider = ({ children }) => {
//   // token from localStorage (optional; backend may rely on httpOnly cookie)
//   const [token, setToken] = useState(() => {
//     try {
//       if (typeof window === "undefined") return null;
//       return localStorage.getItem("token");
//     } catch {
//       return null;
//     }
//   });

//   const [user, setUser] = useState(() => {
//     try {
//       if (typeof window === "undefined") return null;
//       const raw = localStorage.getItem("user");
//       const parsed = raw ? JSON.parse(raw) : null;
//       return sanitizeUser(parsed);
//     } catch {
//       return null;
//     }
//   });

//   // loading indicates we're verifying session (used by route guards)
//   const [loading, setLoading] = useState(true);

//   // getToken: returns token only if it exists and is not expired; clears expired token
//   const getToken = () => {
//     try {
//       const t = localStorage.getItem("token");
//       const expiryRaw = localStorage.getItem("tokenExpiry");
//       const expiry = expiryRaw ? parseInt(expiryRaw, 10) : null;

//       if (!t || !expiry) {
//         try { localStorage.removeItem("token"); } catch {}
//         try { localStorage.removeItem("tokenExpiry"); } catch {}
//         setToken(null);
//         setUser(null);
//         return null;
//       }

//       if (Date.now() > expiry) {
//         // expired — clear
//         try { localStorage.removeItem("token"); } catch {}
//         try { localStorage.removeItem("tokenExpiry"); } catch {}
//         setToken(null);
//         setUser(null);
//         return null;
//       }

//       return t;
//     } catch {
//       return null;
//     }
//   };

//   const isLoggedIn = useMemo(() => !!getToken() && !!user, [token, user]);

//   // keep localStorage in sync for the user (still useful for client-side state)
//   useEffect(() => {
//     try {
//       const toStore = sanitizeUser(user);
//       if (toStore && Object.keys(toStore).length > 0) {
//         localStorage.setItem("user", JSON.stringify(toStore));
//       } else {
//         localStorage.removeItem("user");
//       }
//     } catch { /* swallow */ }
//   }, [user]);

//   // when token state changes, persist token and tokenExpiry using JWT exp if present
//   useEffect(() => {
//     try {
//       if (!token) {
//         localStorage.removeItem("token");
//         localStorage.removeItem("tokenExpiry");
//         return;
//       }

//       const decoded = decodeJwt(token);
//       let expiresAt;
//       if (decoded && decoded.exp) {
//         expiresAt = decoded.exp * 1000; // exp claim is in seconds
//       } else {
//         // fallback: 7 days
//         expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
//       }

//       localStorage.setItem("token", token);
//       localStorage.setItem("tokenExpiry", String(expiresAt));
//     } catch (e) {
//       console.error("Error storing token:", e);
//     }
//   }, [token]);

//   // verifySession: call backend to validate token/cookie and fetch user
//   const verifySession = async () => {
//     setLoading(true);
//     try {
//       const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

//       // prefer state token, fallback to localStorage token (helpful after reload)
//       const localToken = (() => {
//         try { return localStorage.getItem("token"); } catch { return null; }
//       })();
//       const effectiveToken = token || localToken || null;

//       // build headers
//       const headers = { "Content-Type": "application/json" };
//       if (effectiveToken) headers["Authorization"] = `Bearer ${effectiveToken}`;

//       const res = await fetch(`${BASE}/auth/verify/me`, {
//         method: "GET",
//         credentials: "include", // still include cookie if browser will send it
//         headers,
//       });

//       if (!res.ok) {
//         // if token expired/unauthorized clear client session
//         if (res.status === 401 || res.status === 403) {
//           await LogoutTrue(false); // clear client without double-calling backend
//         } else {
//           setUser(null);
//         }
//         setLoading(false);
//         return null;
//       }

//       const data = await res.json();
//       const fetchedUser = data.user ?? data;
//       setUser(sanitizeUser(fetchedUser));
//       setLoading(false);
//       return fetchedUser;
//     } catch (err) {
//       console.error("verifySession error:", err);
//       // network or other error — clear client session to be safe
//       await LogoutTrue(false);
//       setLoading(false);
//       return null;
//     }
//   };

//   // on mount: check stored token and either clear or verify session
//   useEffect(() => {
//     const t = getToken();
//     if (!t) {
//       setUser(null);
//       setLoading(false);
//     } else {
//       verifySession();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // run once on mount

//   // auto-logout timer: use tokenExpiry from localStorage so it survives reload
//   useEffect(() => {
//     try {
//       const expiryRaw = localStorage.getItem("tokenExpiry");
//       const expiry = expiryRaw ? parseInt(expiryRaw, 10) : null;
//       if (!expiry) return;

//       const timeout = expiry - Date.now();
//       if (timeout <= 0) {
//         LogoutTrue(false);
//         return;
//       }

//       const timer = setTimeout(() => {
//         LogoutTrue(false);
//       }, timeout);

//       return () => clearTimeout(timer);
//     } catch (e) {
//       // swallow
//     }
//     // re-run when token changes
//   }, [token]);

//   // Centralized login: save token (if provided) and user
//   const login = ({ token: newToken, user: newUser }) => {
//     if (newToken) setToken(newToken);
//     if (newUser) setUser(sanitizeUser(newUser));
//   };

//   // Logout: clear local state and optionally call backend logout
//   const LogoutTrue = async (callBackend = true) => {
//     const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

//     try {
//       const bearertoken = token;
//       // 1) Immediately clear client-side session so route guards update instantly
//       setToken(null);
//       setUser(null);
//       try { localStorage.removeItem("token"); } catch {}
//       try { localStorage.removeItem("tokenExpiry"); } catch {}
//       try { localStorage.removeItem("user"); } catch {}

//       // 2) Then ask backend to clear the httpOnly cookie (still await if you want)
//       if (callBackend) {
//         await fetch(`${BASE}/auth/logout`, {
//           method: "DELETE", // <<< important — match backend route
//           credentials: "include",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: bearertoken ? `Bearer ${bearertoken}` : ""
//           },
//         }).catch(() => { /* swallow network errors if desired */ });
//       }
//     } catch (e) {
//       // swallow or log
//       console.error("LogoutTrue error:", e);
//     }
//   };

//   // fetch fresh user on demand
//   const getUser = async () => {
//     return verifySession();
//   };

//   // helper for role checking
//   const hasRole = (role) => {
//     if (!user) return false;
//     return user.role === role || (Array.isArray(user.roles) && user.roles.includes(role));
//   };

//   const value = useMemo(
//     () => ({ token, isLoggedIn, user, login, LogoutTrue, getUser, verifySession, loading, hasRole, getToken }),
//     [token, isLoggedIn, user, loading]
//   );

//   return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
// };

// export const useStore = () => {
//   const ctx = useContext(StoreContext);
//   if (!ctx) throw new Error("useStore must be used inside a StoreProvider");
//   return ctx;
// };











// // src/contexts/storecontexts.js
// import { createContext, useContext, useEffect, useMemo, useState } from "react";

// const StoreContext = createContext(undefined);


// const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes


// // helper to remove sensitive fields before storing user client-side
// const sanitizeUser = (user) => {
//   if (!user) return null;
//   const { password, ...rest } = user;
//   return rest;
// };

// // helper: decode jwt payload (client-side only, no verification)
// const decodeJwt = (token) => {
//   try {
//     if (!token || typeof token !== "string") return null;
//     const parts = token.split(".");
//     if (parts.length < 2) return null;
//     const payload = parts[1];
//     // atob may not exist in some environments; handle both
//     const json =
//       typeof atob === "function"
//         ? atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
//         : Buffer.from(payload, "base64").toString("utf8");
//     return JSON.parse(json);
//   } catch {
//     return null;
//   }
// };

// export const StoreProvider = ({ children }) => {
//   // token from localStorage (optional; backend may rely on httpOnly cookie)
//   const [token, setToken] = useState(() => {
//     try {
//       if (typeof window === "undefined") return null;
//       return localStorage.getItem("token");
//     } catch {
//       return null;
//     }
//   });

//   const [user, setUser] = useState(() => {
//     try {
//       if (typeof window === "undefined") return null;
//       const raw = localStorage.getItem("user");
//       const parsed = raw ? JSON.parse(raw) : null;
//       return sanitizeUser(parsed);
//     } catch {
//       return null;
//     }
//   });

//   // loading indicates we're verifying session (used by route guards)
//   const [loading, setLoading] = useState(true);

//   // getToken: returns token only if it exists and is not expired; clears expired token
//   const getToken = () => {
//     try {
//       const t = localStorage.getItem("token");
//       const expiryRaw = localStorage.getItem("tokenExpiry");
//       const expiry = expiryRaw ? parseInt(expiryRaw, 10) : null;

//       if (!t || !expiry) {
//         try { localStorage.removeItem("token"); } catch {}
//         try { localStorage.removeItem("tokenExpiry"); } catch {}
//         setToken(null);
//         setUser(null);
//         return null;
//       }

//       if (Date.now() > expiry) {
//         // expired — clear
//         try { localStorage.removeItem("token"); } catch {}
//         try { localStorage.removeItem("tokenExpiry"); } catch {}
//         setToken(null);
//         setUser(null);
//         return null;
//       }

//       return t;
//     } catch {
//       return null;
//     }
//   };

//   // prefer React state (token + user) for immediate checks, fallback to localStorage for reloads
//   const isLoggedIn = useMemo(() => {
//     if (token && user) return true;

//     try {
//       const t = localStorage.getItem("token");
//       const expiryRaw = localStorage.getItem("tokenExpiry");
//       const expiry = expiryRaw ? parseInt(expiryRaw, 10) : null;
//       if (!t || !expiry) return false;
//       if (Date.now() > expiry) return false;
//       // if token exists in localStorage but user state is null, it's likely reload; treat as not logged in until verifySession populates user
//       return !!user;
//     } catch {
//       return false;
//     }
//   }, [token, user]);

//   // keep localStorage in sync for the user (still useful for client-side state)
//   useEffect(() => {
//     try {
//       const toStore = sanitizeUser(user);
//       if (toStore && Object.keys(toStore).length > 0) {
//         localStorage.setItem("user", JSON.stringify(toStore));
//       } else {
//         localStorage.removeItem("user");
//       }
//     } catch { /* swallow */ }
//   }, [user]);

//   // when token state changes, persist token and tokenExpiry using JWT exp if present
//   // (this effect stays but login() will write instantly to prevent race)
//   useEffect(() => {
//     try {
//       if (!token) {
//         localStorage.removeItem("token");
//         localStorage.removeItem("tokenExpiry");
//         return;
//       }

//       const decoded = decodeJwt(token);
//       let expiresAt;
//       if (decoded && decoded.exp) {
//         expiresAt = decoded.exp * 1000; // exp claim is in seconds
//       } else {
//         // fallback: 7 days
//         expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
//       }

//       localStorage.setItem("token", token);
//       localStorage.setItem("tokenExpiry", String(expiresAt));
//     } catch (e) {
//       console.error("Error storing token:", e);
//     }
//   }, [token]);

//   // verifySession: call backend to validate token/cookie and fetch user
//   const verifySession = async () => {
//     setLoading(true);
//     try {
//       const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

//       // prefer state token, fallback to localStorage token (helpful after reload)
//       const localToken = (() => {
//         try { return localStorage.getItem("token"); } catch { return null; }
//       })();
//       const effectiveToken = token || localToken || null;

//       // build headers
//       const headers = { "Content-Type": "application/json" };
//       if (effectiveToken) headers["Authorization"] = `Bearer ${effectiveToken}`;

//       const res = await fetch(`${BASE}/auth/verify/me`, {
//         method: "GET",
//         credentials: "include", // still include cookie if browser will send it
//         headers,
//       });

//       if (!res.ok) {
//         // if token expired/unauthorized clear client session
//         if (res.status === 401 || res.status === 403) {
//           await LogoutTrue(false); // clear client without double-calling backend
//         } else {
//           setUser(null);
//         }
//         setLoading(false);
//         return null;
//       }

//       const data = await res.json();
//       const fetchedUser = data.user ?? data;
//       setUser(sanitizeUser(fetchedUser));
//       setLoading(false);
//       return fetchedUser;
//     } catch (err) {
//       console.error("verifySession error:", err);
//       // network or other error — clear client session to be safe
//       await LogoutTrue(false);
//       setLoading(false);
//       return null;
//     }
//   };

//   // on mount: check stored token and either clear or verify session
//   useEffect(() => {
//     const t = getToken();
//     if (!t) {
//       setUser(null);
//       setLoading(false);
//     } else {
//       verifySession();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // run once on mount

//   // auto-logout timer: use tokenExpiry from localStorage so it survives reload
//   useEffect(() => {
//     try {
//       const expiryRaw = localStorage.getItem("tokenExpiry");
//       const expiry = expiryRaw ? parseInt(expiryRaw, 10) : null;
//       if (!expiry) return;

//       const timeout = expiry - Date.now();
//       if (timeout <= 0) {
//         LogoutTrue(false);
//         return;
//       }

//       const timer = setTimeout(() => {
//         LogoutTrue(false);
//       }, timeout);

//       return () => clearTimeout(timer);
//     } catch (e) {
//       // swallow
//     }
//     // re-run when token changes
//   }, [token]);

//   // Centralized login: save token (if provided) and user
//   // Important: write token & tokenExpiry to localStorage immediately to avoid race
//   const login = ({ token: newToken, user: newUser }) => {
//     if (newToken) {
//       setToken(newToken);

//       // persist immediately
//       try {
//         const decoded = decodeJwt(newToken);
//         const expiresAt = decoded && decoded.exp ? decoded.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
//         localStorage.setItem("token", newToken);
//         localStorage.setItem("tokenExpiry", String(expiresAt));
//       } catch (e) {
//         // fallback persistence
//         localStorage.setItem("token", newToken);
//         localStorage.setItem("tokenExpiry", String(Date.now() + 7 * 24 * 60 * 60 * 1000));
//       }
//     }
//     if (newUser) setUser(sanitizeUser(newUser));
//   };

//   // Logout: clear local state and optionally call backend logout
//   const LogoutTrue = async (callBackend = true) => {
//     const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

//     try {
//       const bearertoken = token;
//       // 1) Immediately clear client-side session so route guards update instantly
//       setToken(null);
//       setUser(null);
//       try { localStorage.removeItem("token"); } catch {}
//       try { localStorage.removeItem("tokenExpiry"); } catch {}
//       try { localStorage.removeItem("user"); } catch {}

//       // 2) Then ask backend to clear the httpOnly cookie (still await if you want)
//       if (callBackend) {
//         await fetch(`${BASE}/auth/logout`, {
//           method: "DELETE", // <<< important — match backend route
//           credentials: "include",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: bearertoken ? `Bearer ${bearertoken}` : ""
//           },
//         }).catch(() => { /* swallow network errors if desired */ });
//       }
//     } catch (e) {
//       // swallow or log
//       console.error("LogoutTrue error:", e);
//     }
//   };

//   // fetch fresh user on demand
//   const getUser = async () => {
//     return verifySession();
//   };

//   // helper for role checking
//   const hasRole = (role) => {
//     if (!user) return false;
//     return user.role === role || (Array.isArray(user.roles) && user.roles.includes(role));
//   };

//   const value = useMemo(
//     () => ({ token, isLoggedIn, user, login, LogoutTrue, getUser, verifySession, loading, hasRole, getToken }),
//     [token, isLoggedIn, user, loading]
//   );

//   return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
// };

// export const useStore = () => {
//   const ctx = useContext(StoreContext);
//   if (!ctx) throw new Error("useStore must be used inside a StoreProvider");
//   return ctx;
// };












// src/contexts/storecontexts.js
import { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";

const StoreContext = createContext(undefined);

const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

// helper to remove sensitive fields before storing user client-side
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

// helper: decode jwt payload (client-side only, no verification)
const decodeJwt = (token) => {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const json =
      typeof atob === "function"
        ? atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        : Buffer.from(payload, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const StoreProvider = ({ children }) => {

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return sanitizeUser(raw ? JSON.parse(raw) : null);
  });
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);
  const abortRef = useRef(null);

  // ---------- getToken ----------
  const getToken = () => {
    try {
      const t = localStorage.getItem("token");
      const expiry = parseInt(localStorage.getItem("tokenExpiry") || "0", 10);

      if (!t || Date.now() > expiry) {
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiry");
        setToken(null);
        setUser(null);
        return null;
      }
      return t;
    } catch {
      return null;
    }
  };

  const isLoggedIn = useMemo(() => !!token && !!user, [token, user]);

  // ---------- keep user in sync ----------
  useEffect(() => {
    try {
      const toStore = sanitizeUser(user);
      if (toStore && Object.keys(toStore).length > 0) {
        localStorage.setItem("user", JSON.stringify(toStore));
      } else {
        localStorage.removeItem("user");
      }
    } catch {}
  }, [user]);

  // ---------- persist token ----------
  useEffect(() => {
    try {
      if (!token) {
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiry");
        return;
      }
      const decoded = decodeJwt(token);
      const expiresAt = decoded?.exp ? decoded.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpiry", String(expiresAt));
    } catch (e) {
      console.error("Error storing token:", e);
    }
  }, [token]);

  // ---------- verifySession ----------
  const verifySession = async () => {
    setLoading(true);
    try {
      const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";
      const effectiveToken = token || localStorage.getItem("token");
      if (!effectiveToken) return null;

      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${effectiveToken}` };
      const res = await fetch(`${BASE}/auth/verify/me`, { method: "GET", credentials: "include", headers });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) await LogoutTrue(false);
        setLoading(false);
        return null;
      }
      const data = await res.json();
      const fetchedUser = data.user ?? data;
      setUser(sanitizeUser(fetchedUser));
      setLoading(false);
      return fetchedUser;
    } catch (err) {
      console.error("verifySession error:", err);
      await LogoutTrue(false);
      setLoading(false);
      return null;
    }
  };

  // ---------- on mount ----------
  useEffect(() => {
    const t = getToken();
    if (!t) {
      setUser(null);
      setLoading(false);
    } else {
      verifySession();
    }
  }, []);

  // ---------- auto-logout ----------
  useEffect(() => {
    try {
      const expiry = parseInt(localStorage.getItem("tokenExpiry") || "0", 10);
      if (!expiry) return;

      const timeout = expiry - Date.now();
      if (timeout <= 0) {
        LogoutTrue(false);
        return;
      }

      const timer = setTimeout(() => LogoutTrue(false), timeout);
      return () => clearTimeout(timer);
    } catch {}
  }, [token]);

  // ---------- login ----------
  const login = ({ token: newToken, user: newUser }) => {
    if (newToken) setToken(newToken);
    if (newUser) setUser(sanitizeUser(newUser));
  };

  // ---------- Logout ----------
  const LogoutTrue = async (callBackend = true) => {
    const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";
    const bearertoken = token;

    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("user");

    if (callBackend) {
      await fetch(`${BASE}/auth/logout`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: bearertoken ? `Bearer ${bearertoken}` : "" },
      }).catch(() => {});
    }
  };

  const getUser = async () => verifySession();
  const hasRole = (role) => user ? user.role === role || (Array.isArray(user.roles) && user.roles.includes(role)) : false;

  // ---------- Poll user isActive ----------
  useEffect(() => {
    if (!isLoggedIn || !user?._id) return;

    const checkStatus = async () => {
      const t = getToken();
      if (!t) return;

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/users/status/${user._id}`,
          { headers: { Authorization: `Bearer ${t}` }, signal: abortRef.current.signal }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.isActive === false) LogoutTrue(false);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    };

    checkStatus();
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [isLoggedIn, user?._id]);

  const value = useMemo(
    () => ({ token, isLoggedIn, user, login, LogoutTrue, getUser, verifySession, loading, hasRole, getToken }),
    [token, isLoggedIn, user, loading]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside a StoreProvider");
  return ctx;
};
