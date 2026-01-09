const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cors = require("cors");


const bcrypt = require("bcrypt");
 

const app = express();
const PORT =3001;

app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://your-frontend-domain"
  ],
  credentials: true
}));


const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  
  if (!authHeader) {
    return res.status(401).json({
      error: "No token provided"
    });
  }

  
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Invalid token format"
    });
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    req.user = {
      id: decoded.user_id
    };

    
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token"
    });
  }
};

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);




app.post("/applications" , authenticate , async(req ,res)=>{
    const { company_name, role, job_type, status } = req.body;

  if (!company_name || !role || !job_type || !status) {
    return res.status(400).json({
      error: "All fields are required"
    });
  }
  const { data, error } = await supabase
    .from("applications")
    .insert([{
  company_name,
  role,
  job_type,
  status,
  user_id: req.user.id
}])

    .select();

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.status(201).json({
    message: "Application saved successfully",
    application: data[0]
  });
});

app.get("/applications", authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.status(200).json(data);
});

app.get("/applications/status/:status", async (req, res) => {
  const { status } = req.params;

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.status(200).json({
    applications: data
  });
});
app.post("/auth/signup", async(req ,res)=>{
  const {email , password} = req.body;
  if(!email || !password){
    return res.status(400).json({
      error:"Email &  password not found"
    });
  }
  const password_hash = await bcrypt.hash(password ,10);
  const{data , error} = await supabase
  .from("users")
  .insert([{email , password_hash}])
  .select("id, email, created_at");

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.status(201).json({
    message: "User created",
    user: data[0]
  });
});

app.post("/auth/login",async(req,res)=>{
const {email , password} = req.body ;
if(!email || !password){
  return res.status(400).json({
    error :"email or password not found"
  });
}
const {data , error} = await supabase
.from("users")
.select("*")
.eq("email" , email);

if(error){
  return res.status(500).json({
    error : error.message
  })
}
if (!data || data.length === 0) {
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }

  const user = data[0];
  const isMatch = await bcrypt.compare(password , user.password_hash);
  if(!isMatch){
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }
  const token = jwt.sign(
    {user_id : user.id},
    process.env.JWT_SECRET,
    { expiresIn: "7d" }

  )
  res.json({
    message: "Login successful",
    token
  });


});
app.patch("/applications/:id", authenticate, async (req, res) => {
  const { status } = req.body;

  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data[0]);
});

app.listen(PORT , ()=>{
    console.log(`listening  port ${PORT}`)
});
