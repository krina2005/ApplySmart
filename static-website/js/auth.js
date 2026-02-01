/* ========= INITIAL ADMIN SETUP ========= */
const admins = [
  {
    email: "admin@applysmart.ai",
    password: "admin123",
    role: "admin"
  }
];

if (!localStorage.getItem("admins")) {
  localStorage.setItem("admins", JSON.stringify(admins));
}

/* ========= USER SIGNUP ========= */
function signup() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    alert("All fields are required");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const userExists = users.find(u => u.email === email);
  if (userExists) {
    alert("User already exists");
    return;
  }

  users.push({
    name,
    email,
    password,
    role: "user"
  });

  localStorage.setItem("users", JSON.stringify(users));
  alert("Signup successful! Please login.");

  window.location.href = "login.html";
}

/* ========= USER LOGIN ========= */
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    alert("Invalid credentials");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  window.location.href = "user/dashboard.html";
}

/* ========= ADMIN LOGIN ========= */
function adminLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const admins = JSON.parse(localStorage.getItem("admins")) || [];

  const admin = admins.find(
    a => a.email === email && a.password === password
  );

  if (!admin) {
    alert("Invalid admin credentials");
    return;
  }

  localStorage.setItem("currentAdmin", JSON.stringify(admin));
  window.location.href = "dashboard.html";
}
