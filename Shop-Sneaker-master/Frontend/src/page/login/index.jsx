import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, Sparkles } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";
import { loginWithGoogle } from "@/services/api";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      await loginWithGoogle({ idToken });

      navigate(searchParams.get("redirect") || "/", { replace: true });
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Bạn đã đóng cửa sổ đăng nhập.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Yêu cầu đăng nhập đã bị hủy.");
      } else {
        setError(err.message || "Đăng nhập Firebase thất bại.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#f8f8f8] flex items-center justify-center overflow-hidden font-sans">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <span className="text-[20vw] font-black italic whitespace-nowrap">SOLESTYLE</span>
      </div>

      <div className="absolute top-8 left-8 z-10 flex items-center gap-2 text-[10px] font-bold tracking-[0.35em] uppercase text-gray-500">
        <Sparkles className="w-4 h-4" />
        <span>Firebase auth enabled</span>
      </div>

      <div className="relative z-10 w-full max-w-[420px] bg-white p-10 md:p-12 shadow-2xl border border-black/5">
        <div className="mb-12">
          <h1 className="text-2xl font-black italic tracking-tighter">SOLESTYLE</h1>
          <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mt-1">
            THE KINETIC DIGITAL FLAGSHIP
          </p>
        </div>

        <h2 className="text-4xl font-black italic tracking-tighter leading-[0.9] mb-4 uppercase">
          ACCESS THE <br /> VAULT.
        </h2>
        <p className="text-xs text-gray-500 font-medium leading-relaxed mb-8 max-w-[280px]">
          Continue with your Google account through Firebase Authentication to unlock your session.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full bg-white border-2 border-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 h-14 flex items-center justify-center gap-3 font-bold text-sm tracking-wide uppercase"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>{isGoogleLoading ? "Đang xác thực..." : "Tiếp tục với Google"}</span>
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-none border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        ) : (
          <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Firebase ID token sẽ được xác thực bởi backend để tạo session.</span>
          </div>
        )}

        <div className="border-t border-gray-100 pt-6 mt-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-600" />
          <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">SECURE PROTOCOL 2.4.0</span>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 w-full p-8 flex flex-col md:flex-row items-center justify-between text-[9px] text-gray-500 font-bold tracking-widest uppercase z-10">
        <p className="mb-4 md:mb-0">© 2026 SOLESTYLE. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-6">
          <span className="cursor-pointer hover:text-black transition-colors">PRIVACY</span>
          <span className="cursor-pointer hover:text-black transition-colors">TERMS</span>
          <span className="cursor-pointer hover:text-black transition-colors">SUPPORT</span>
        </div>
      </div>
    </div>
  );
}
