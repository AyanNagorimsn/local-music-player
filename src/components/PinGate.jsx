import { useState, useEffect } from "react";
import { FiDelete } from "react-icons/fi";
import { BiFingerprint } from "react-icons/bi";
import { RiLockPasswordFill } from "react-icons/ri";

const PIN = "2707";

export default function PinGate({ onUnlock }) {
  const [entered, setEntered] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (entered.length === PIN.length) {
      if (entered === PIN) {
        sessionStorage.setItem("admin_unlocked", "true");
        setTimeout(() => onUnlock(), 150);
      } else {
        setError(true);
        setTimeout(() => {
          setEntered("");
          setError(false);
        }, 400);
      }
    }
  }, [entered, onUnlock]);

  const press = (digit) => {
    if (entered.length >= PIN.length) return;
    setEntered((prev) => prev + digit);
  };

  const backspace = () => setEntered((prev) => prev.slice(0, -1));

  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="h-dvh overflow-hidden flex flex-col items-center justify-center bg-white px-8">
      <div className="w-16 h-16 rounded-full bg-[#7C5CFC] flex items-center justify-center mb-6 shadow-lg shadow-[#7C5CFC]/30">
        <RiLockPasswordFill size={28} className="text-white" />
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-1">Enter your PIN</h1>
      <p className="text-sm text-gray-400 mb-8">Admin access only</p>

      {/* Dots */}
      <div className={`flex gap-4 mb-10 ${error ? "animate-pulse" : ""}`}>
        {Array.from({ length: PIN.length }).map((_, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full border flex items-center justify-center transition"
            style={{
              borderColor: error
                ? "#EF4444"
                : i < entered.length
                  ? "#7C5CFC"
                  : "#E5E7EB",
              backgroundColor:
                i < entered.length
                  ? error
                    ? "#FEE2E2"
                    : "#EDE9FE"
                  : "transparent",
            }}
          >
            {i < entered.length && (
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: error ? "#EF4444" : "#7C5CFC" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
        {keys.map((n) => (
          <button
            key={n}
            onClick={() => press(String(n))}
            className="aspect-square rounded-full bg-[#F5F5F8] text-xl font-medium text-gray-800 active:bg-[#EDE9FE] active:text-[#7C5CFC] transition"
          >
            {n}
          </button>
        ))}
        <button
          disabled
          className="aspect-square rounded-full flex items-center justify-center text-gray-300"
        >
          <BiFingerprint size={26} />
        </button>
        <button
          onClick={() => press("0")}
          className="aspect-square rounded-full bg-[#F5F5F8] text-xl font-medium text-gray-800 active:bg-[#EDE9FE] active:text-[#7C5CFC] transition"
        >
          0
        </button>
        <button
          onClick={backspace}
          className="aspect-square rounded-full flex items-center justify-center text-gray-500 active:text-[#7C5CFC] transition"
        >
          <FiDelete size={20} />
        </button>
      </div>
    </div>
  );
}
