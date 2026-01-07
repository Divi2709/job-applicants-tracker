const API_URL = "http://localhost:3001";



function getAuthHeader() {
  const token = localStorage.getItem("token");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}
export async function signupUser(email, password) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Signup failed");
  }

  return data;
}


export async function getApplications() {
  const res = await fetch(`${API_URL}/applications`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch applications");
  }

  return data;
}
export async function updateApplicationStatus(id, status) {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:3001/applications/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to update status");
  }

  return data;
}


