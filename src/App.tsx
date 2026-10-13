import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api";

const symptomsList = [
"Fever",
"Headache",
"Cough",
"Fatigue",
"Sore throat",
"Runny nose",
"Body pain",
"Nausea",
"Vomiting",
"Difficulty breathing",
];

type PredictionResult = {
symptoms: string[];
possibleCondition: string;
prevention: string;
doctorAdvice: string;
disclaimer: string;
message?: string;
};

function App() {
const [page, setPage] = useState<"login" | "register" | "dashboard">(
"login"
);

const [fullName, setFullName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
const [prediction, setPrediction] = useState<PredictionResult | null>(null);

const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);
const [token, setToken] = useState("");

// Login and registration
const handleAuth = async () => {
setMessage("");


if (!email.trim() || !password) {
  setMessage("Please enter your email and password.");
  return;
}

if (page === "register" && !fullName.trim()) {
  setMessage("Please enter your full name.");
  return;
}

if (page === "register" && password.length < 8) {
  setMessage("Password must contain at least 8 characters.");
  return;
}

setLoading(true);

try {
  const isRegister = page === "register";

  const response = await fetch(
    `${API_URL}/auth/${isRegister ? "register" : "login"}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        isRegister
          ? {
              fullName: fullName.trim(),
              email: email.trim(),
              password,
            }
          : {
              email: email.trim(),
              password,
            }
      ),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || data.error || "Authentication failed."
    );
  }

  if (isRegister) {
    setMessage("Registration successful! Please log in.");
    setPassword("");
    setPage("login");
    return;
  }

  setToken(data.token || "");
  setFullName(data.fullName || "");
  setPage("dashboard");
  setSelectedSymptoms([]);
  setPrediction(null);
  setMessage("");
} catch (error) {
  setMessage(
    error instanceof Error
      ? error.message
      : "Unable to connect to the backend."
  );
} finally {
  setLoading(false);
}


};

// Switch between pages
const switchPage = (nextPage: "login" | "register") => {
setPage(nextPage);
setMessage("");
setPassword("");
};

// Select symptoms
const toggleSymptom = (symptom: string) => {
setSelectedSymptoms((previous) =>
previous.includes(symptom)
? previous.filter((item) => item !== symptom)
: [...previous, symptom]
);


setPrediction(null);
setMessage("");


};

// Get prediction results
const checkSymptoms = async () => {
if (selectedSymptoms.length === 0) {
setMessage("Please select at least one symptom.");
return;
}


setLoading(true);
setMessage("");
setPrediction(null);

try {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      symptoms: selectedSymptoms,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to get prediction results."
    );
  }

  if (!data.possibleCondition) {
    throw new Error(data.message || "No prediction result was returned.");
  }

  setPrediction(data as PredictionResult);
} catch (error) {
  setMessage(
    error instanceof Error
      ? error.message
      : "Unable to connect. Check whether the backend is running."
  );
} finally {
  setLoading(false);
}


};

// Logout
const handleLogout = () => {
setPage("login");
setFullName("");
setEmail("");
setPassword("");
setToken("");
setSelectedSymptoms([]);
setPrediction(null);
setMessage("");
};

// LOGIN PAGE
if (page === "login") {
return ( <div className="auth-page"> <div className="auth-card"> <div className="logo">🩺</div>


      <h1>AI Disease Prediction</h1>

      <p className="subtitle">
        Sign in to check your symptoms
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleAuth();
        }}
      >
        <label htmlFor="login-email">Email Address</label>

        <input
          id="login-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>

        <input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {message && <p className="message">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </button>
      </form>

      <p className="switch-page">
        Don't have an account?{" "}
        <button
          type="button"
          className="text-button"
          onClick={() => switchPage("register")}
        >
          Register
        </button>
      </p>
    </div>
  </div>
);


}

// REGISTER PAGE
if (page === "register") {
return ( <div className="auth-page"> <div className="auth-card"> <div className="logo">🩺</div>


      <h1>Create Account</h1>

      <p className="subtitle">
        Register to get started
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleAuth();
        }}
      >
        <label htmlFor="register-name">Full Name</label>

        <input
          id="register-name"
          type="text"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />

        <label htmlFor="register-email">Email Address</label>

        <input
          id="register-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="register-password">Password</label>

        <input
          id="register-password"
          type="password"
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />

        {message && <p className="message">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="switch-page">
        Already have an account?{" "}
        <button
          type="button"
          className="text-button"
          onClick={() => switchPage("login")}
        >
          Login
        </button>
      </p>
    </div>
  </div>
);


}

// DASHBOARD PAGE
return ( <div className="dashboard"> <nav className="navbar"> <h2>🩺 AI Disease Prediction</h2>


    <button className="logout" onClick={handleLogout}>
      Logout
    </button>
  </nav>

  <main className="dashboard-content">
    <section className="welcome">
      <p className="eyebrow">HEALTH ASSISTANT</p>

      <h1>
        Welcome{fullName ? `, ${fullName}` : ""}!
      </h1>

      <p>
        Select your symptoms to explore possible related conditions
        and general prevention information.
      </p>
    </section>

    <section className="symptom-section">
      <h2>Select Your Symptoms</h2>

      <p className="section-description">
        Choose all symptoms that apply to you.
      </p>

      <div className="symptom-grid">
        {symptomsList.map((symptom) => (
          <button
            type="button"
            key={symptom}
            className={`symptom-option ${
              selectedSymptoms.includes(symptom) ? "selected" : ""
            }`}
            aria-pressed={selectedSymptoms.includes(symptom)}
            onClick={() => toggleSymptom(symptom)}
          >
            <span>
              {selectedSymptoms.includes(symptom) ? "✓" : "+"}
            </span>

            {symptom}
          </button>
        ))}
      </div>

      <p className="selected-count">
        {selectedSymptoms.length} symptom
        {selectedSymptoms.length === 1 ? "" : "s"} selected
      </p>

      {selectedSymptoms.includes("Difficulty breathing") && (
        <p className="message">
          Significant difficulty breathing can be an emergency.
          Seek emergency medical help immediately rather than waiting
          for an online result.
        </p>
      )}

      <button
        className="predict-button"
        onClick={() => void checkSymptoms()}
        disabled={loading}
      >
        {loading ? "Checking Symptoms..." : "Predict Disease"}
      </button>

      {message && <p className="message">{message}</p>}
    </section>

    {prediction && (
      <section className="prediction-result" aria-live="polite">
        <h2>Prediction Results</h2>

        <div className="result-item">
          <h3>Selected Symptoms</h3>

          <p>{prediction.symptoms?.join(", ")}</p>
        </div>

        <div className="result-item">
          <h3>Possible Related Condition</h3>

          <p>{prediction.possibleCondition}</p>

          <p>
            This is a possible symptom pattern, not a confirmed
            disease diagnosis.
          </p>
        </div>

        <div className="result-item">
          <h3>Prevention Tips</h3>

          <p>{prediction.prevention}</p>
        </div>

        <div className="result-item">
          <h3>When to Consult a Doctor</h3>

          <p>{prediction.doctorAdvice}</p>
        </div>

        <div className="disclaimer">
          <strong>Medical Disclaimer:</strong>{" "}
          {prediction.disclaimer} Do not use this demonstration
          to replace professional medical assessment.
        </div>
      </section>
    )}

    <footer className="footer">
      <p>
        AI Disease Prediction System | College Mini Project
      </p>

      <p>
        Educational use only. This system does not provide a medical
        diagnosis.
      </p>
    </footer>
  </main>
</div>


);
}

export default App;
