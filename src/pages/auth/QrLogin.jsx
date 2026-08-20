import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchCurrentUser, loginWithQr } from "../../slices/authSlice";
import { getHomePathForUser } from "../../utils/authRoutes";
import BrandMark from "../../branding/BrandMark";

/**
 * Public QR entry: /q/:token
 * Calls qr-login, stores JWT, redirects to the user's dashboard.
 */
export default function QrLogin() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const started = useRef(false);
  const [status, setStatus] = useState("loading"); // loading | error
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      const qrToken = typeof token === "string" ? token.trim() : "";
      if (!qrToken) {
        setStatus("error");
        setMessage("This QR link is missing a token.");
        return;
      }

      try {
        const result = await dispatch(loginWithQr(qrToken)).unwrap();
        dispatch(fetchCurrentUser());
        navigate(getHomePathForUser(result.user), { replace: true });
      } catch (err) {
        setStatus("error");
        setMessage(err?.message || "Could not sign in with this QR code.");
      }
    };

    run();
  }, [token, dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-5">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <BrandMark className="h-10 mx-auto mb-6" />
        {status === "loading" ? (
          <>
            <h1 className="text-xl font-semibold text-slate-900 mb-2">Opening EcoSystem</h1>
            <p className="text-sm text-slate-500">{message}</p>
            <div
              className="mt-6 mx-auto h-8 w-8 rounded-full border-2 border-slate-200 border-t-slate-700 animate-spin"
              aria-hidden
            />
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-slate-900 mb-2">QR sign-in failed</h1>
            <p className="text-sm text-slate-500 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium text-white"
              style={{ background: "var(--eco-primary, #0055a5)" }}
            >
              Go to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
