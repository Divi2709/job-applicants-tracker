import { useState } from "react";
import { loginUser } from "../services/api";
import { useEffect } from "react";
import { getApplications } from "../services/api";

import { signupUser } from "../services/api";
import { updateApplicationStatus } from "../services/api";





function Home(){
const [applications, setApplications] = useState([]);
const [mode, setMode] = useState("login");
const [showPopup, setShowPopup] = useState(true);

const [company, setCompany] = useState("");
const [role, setRole] = useState("");
const [jobType, setJobType] = useState("");
const [newStatus, setNewStatus] = useState("Applied");

  const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    setIsLoggedIn(true);
  }
}, []);

useEffect(() => {

    if (!isLoggedIn) return;

    getApplications()
      .then((data) => {
        setApplications(data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, [isLoggedIn]);


const handleAuth = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    if (mode === "login") {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
    } else {
      await signupUser(email, password);
      setMode("login");
      alert("Account created. Please login.");
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

const stats = {
  total: applications.length,
  rejected: 0,
  oa: 0,
  interview: 0,
};

applications.forEach((app) => {
  if (app.status === "Rejected") stats.rejected++;
  if (app.status === "OA") stats.oa++;
  if (app.status === "Interview") stats.interview++;
});
let insightMessage = "";

if (stats.rejected > stats.interview && stats.interview > 0) {
  insightMessage =
    "Most rejections happen after interviews. Focus on communication, project depth, and explaining trade-offs.";
} else if (stats.oa > stats.interview && stats.oa > 0) {
  insightMessage =
    "You are failing more at Online Assessments. Practice timed DSA and pattern recognition.";
} else if (stats.total >= 5 && stats.interview === 0) {
  insightMessage =
    "You are not reaching interviews yet. Resume or referral strategy needs improvement.";
}

const handleStatusChange = async (id, newStatus) => {
  try {
    const updated = await updateApplicationStatus(id, newStatus);

    setApplications(applications.map(app =>
      app.id === id ? updated : app
    ));
  } catch (err) {
    alert(err.message);
  }
};
const handleAddApplication = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:3001/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        company_name: company,
        role,
        job_type: jobType,
        status: newStatus,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to add application");
    }

    // 👇 THIS LINE MAKES STATS CHANGE
    setApplications([data.application, ...applications]);

    setCompany("");
    setRole("");
    setJobType("");
    setNewStatus("Applied");
  } catch (err) {
    alert(err.message);
  }
};

if (isLoggedIn) {
  return (
    <div className="container">
      <h1>Dashboard</h1>
 <div className="card">
  <h2>Add Application</h2>

  <form onSubmit={handleAddApplication} className="form">
    <input
      placeholder="Company"
      value={company}
      onChange={(e) => setCompany(e.target.value)}
      required
    />

    <input
      placeholder="Role"
      value={role}
      onChange={(e) => setRole(e.target.value)}
      required
    />

    <select
      value={jobType}
      onChange={(e) => setJobType(e.target.value)}
      required
    >
      <option value="">Job Type</option>
      <option value="Internship">Internship</option>
      <option value="Full-time">Full-time</option>
    </select>

    <select
      value={newStatus}
      onChange={(e) => setNewStatus(e.target.value)}
    >
      <option value="Applied">Applied</option>
      <option value="OA">OA</option>
      <option value="Interview">Interview</option>
      <option value="Rejected">Rejected</option>
    </select>

    <button type="submit">Add Application</button>
  </form>
</div>

      {/* STATS */}
      <div className="stats">
        <div className="stat-card">
          <p className="stat-label">Total</p>
          <h2>{stats.total}</h2>
        </div>

        <div className="stat-card rejected">
          <p className="stat-label">Rejected</p>
          <h2>{stats.rejected}</h2>
        </div>

        <div className="stat-card oa">
          <p className="stat-label">OA</p>
          <h2>{stats.oa}</h2>
        </div>

        <div className="stat-card interview">
          <p className="stat-label">Interview</p>
          <h2>{stats.interview}</h2>
          {insightMessage && showPopup && (
  <div className="popup-overlay">
    <div className="popup">
      <h2>Pattern Detected</h2>
      <p>{insightMessage}</p>
      <button onClick={() => setShowPopup(false)}>Got it</button>
    </div>
  </div>
)}

        </div>
      </div>
      {insightMessage && (
  <div className="card insight">
    <h3>Insight</h3>
    <p>{insightMessage}</p>
  </div>


)}


      {/* APPLICATION LIST */}
      <div className="card">

        <h2>Your Applications</h2>

        {applications.length === 0 ? (
          <p>No applications yet.</p>
        ) : (
          <div className="list">
            {applications.map(app => (
              <div key={app.id} className="list-item">
                <div>
                  <strong>{app.company_name}</strong>
                  <div>{app.role}</div>
                </div>
               <select
  value={app.status}
  onChange={(e) =>
    handleStatusChange(app.id, e.target.value)
  }
>
  <option value="Applied">Applied</option>
  <option value="OA">OA</option>
  <option value="Interview">Interview</option>
  <option value="Rejected">Rejected</option>
</select>

              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="logout"
        onClick={() => {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }}
      >
        Logout
      </button>
    </div>
  );
}





    return (
        
 <div className="home">
            <div className="left">
            <h1>Rejections are not FAILURE</h1>
            <h1>They are FEEDBACK</h1>
             <p>
        Track where you’re losing interviews.
        Fix the weakest stage.
        Improve your odds — statistically.
      </p> </div>
<div className="right">
    <div className="auth-box">
<h2>Welcome back</h2>
{error && <p className="error">{error}</p>}

 <form onSubmit={handleAuth}>


    <div className="form-group">
      <label>Email</label>
      <input type="email" value={email}
  onChange={(e) => setEmail(e.target.value)}
      placeholder="you@example.com" />
    </div>

    <div className="form-group">
      <label>Password</label>
      <input type="password" value={password}
  onChange={(e) => setPassword(e.target.value)}
      placeholder="••••••••" />
    </div>

   <button type="submit" disabled={loading}>
  {loading
    ? "Please wait..."
    : mode === "login"
    ? "Login"
    : "Register"}
</button>
<p style={{ marginTop: "10px", textAlign: "center" }}>
  {mode === "login" ? (
    <>
      Don’t have an account?{" "}
      <span
        style={{ color: "#2563eb", cursor: "pointer" }}
        onClick={() => setMode("signup")}
      >
        Register
      </span>
    </>
  ) : (
    <>
      Already have an account?{" "}
      <span
        style={{ color: "#2563eb", cursor: "pointer" }}
        onClick={() => setMode("login")}
      >
        Login
      </span>
    </>
  )}
</p>

  </form >

    </div>
</div>
        </div>
    );
}
export default Home;