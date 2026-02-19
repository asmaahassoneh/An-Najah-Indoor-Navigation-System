import { useId, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

/**
 * Reusable Password Input
 *
 * Props:
 * - name (string)           -> required (for forms)
 * - value (string)          -> required (controlled)
 * - onChange (function)     -> required (same as <input onChange>)
 * - placeholder (string)    -> optional
 * - label (string)          -> optional
 * - required (boolean)      -> optional (default true)
 * - error (string)          -> optional
 * - disabled (boolean)      -> optional
 * - autoComplete (string)   -> optional (e.g. "current-password", "new-password")
 */
export default function PasswordInput({
  name,
  value,
  onChange,
  placeholder = "Password",
  label,
  required = true,
  error,
  disabled = false,
  autoComplete,
}) {
  const inputId = useId();
  const [show, setShow] = useState(false);

  return (
    <div style={{ display: "grid", gap: "6px" }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}
        >
          {label}
        </label>
      )}

      <div className={`password-wrapper ${error ? "password-error" : ""}`}>
        <input
          id={inputId}
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
        />

        <button
          type="button"
          className="eye-icon-btn"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          disabled={disabled}
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
