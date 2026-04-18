const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
};

const seedUsers = async () => {
  await connectDB();

  // Clear existing users
  await User.deleteMany({});
  console.log("Existing users deleted");

  const users = [
    {
      email: "user1@itm.ac.in",
      name: "Aarav Sharma",
      password: await bcrypt.hash("password123", 10),
      branch: "ME",
      whatsapp: "9518286009"
    },
    {
      email: "user2@itm.ac.in",
      name: "Vihaan Gupta",
      password: await bcrypt.hash("password123", 10),
      branch: "ECE",
      whatsapp: "9533519143"
    },
    {
      email: "user3@itm.ac.in",
      name: "Arjun Verma",
      password: await bcrypt.hash("password123", 10),
      branch: "ME",
      whatsapp: "9168429812"
    },
    {
      email: "user4@itm.ac.in",
      name: "Reyansh Singh",
      password: await bcrypt.hash("password123", 10),
      branch: "CSE",
      whatsapp: "9412080419"
    },
    {
      email: "user5@itm.ac.in",
      name: "Ayaan Patel",
      password: await bcrypt.hash("password123", 10),
      branch: "IT",
      whatsapp: "9839174678"
    },
    {
      email: "user6@itm.ac.in",
      name: "Ishaan Kumar",
      password: await bcrypt.hash("password123", 10),
      branch: "ECE",
      whatsapp: "9502358270"
    },
    {
      email: "user7@itm.ac.in",
      name: "Advik Jain",
      password: await bcrypt.hash("password123", 10),
      branch: "IT",
      whatsapp: "9202238696"
    },
    {
      email: "user8@itm.ac.in",
      name: "Ananya Mishra",
      password: await bcrypt.hash("password123", 10),
      branch: "ME",
      whatsapp: "9158978498"
    },
    {
      email: "user9@itm.ac.in",
      name: "Diya Choudhary",
      password: await bcrypt.hash("password123", 10),
      branch: "ME",
      whatsapp: "9320852729"
    },
    {
      email: "user10@itm.ac.in",
      name: "Saanvi Rao",
      password: await bcrypt.hash("password123", 10),
      branch: "CSE",
      whatsapp: "9153174167"
    },
    {
      email: "user11@itm.ac.in",
      name: "Aryan Khanna",
      password: await bcrypt.hash("password123", 10),
      branch: "ECE",
      whatsapp: "9866363195"
    },
    {
      email: "user12@itm.ac.in",
      name: "Kabir Malhotra",
      password: await bcrypt.hash("password123", 10),
      branch: "CSE",
      whatsapp: "9490185848"
    },
    {
      email: "user13@itm.ac.in",
      name: "Riya Kapoor",
      password: await bcrypt.hash("password123", 10),
      branch: "CSE",
      whatsapp: "9641030096"
    },
    {
      email: "user14@itm.ac.in",
      name: "Arnav Saxena",
      password: await bcrypt.hash("password123", 10),
      branch: "ECE",
      whatsapp: "9897651213"
    },
    {
      email: "user15@itm.ac.in",
      name: "Myra Bansal",
      password: await bcrypt.hash("password123", 10),
      branch: "CSE",
      whatsapp: "9972260705"
    },
    {
      email: "user16@itm.ac.in",
      name: "Devansh Joshi",
      password: await bcrypt.hash("password123", 10),
      branch: "IT",
      whatsapp: "9996887023"
    },
    {
      email: "user17@itm.ac.in",
      name: "Anika Agarwal",
      password: await bcrypt.hash("password123", 10),
      branch: "IT",
      whatsapp: "9424183632"
    },
    {
      email: "user18@itm.ac.in",
      name: "Rudra Pandey",
      password: await bcrypt.hash("password123", 10),
      branch: "CE",
      whatsapp: "9702204550"
    },
    {
      email: "user19@itm.ac.in",
      name: "Pari Mehta",
      password: await bcrypt.hash("password123", 10),
      branch: "IT",
      whatsapp: "9753454754"
    },
    {
      email: "user20@itm.ac.in",
      name: "Veer Chauhan",
      password: await bcrypt.hash("password123", 10),
      branch: "IT",
      whatsapp: "9859495772"
    },
    {
      email: "user21@itm.ac.in",
      name: "Zara Khan",
      password: await bcrypt.hash("password123", 10),
      branch: "IT",
      whatsapp: "9104780989"
    },
    {
      email: "user22@itm.ac.in",
      name: "Aryan Gill",
      password: await bcrypt.hash("password123", 10),
      branch: "IT",
      whatsapp: "9401007115"
    },
    {
      email: "user23@itm.ac.in",
      name: "Sara Ahmed",
      password: await bcrypt.hash("password123", 10),
      branch: "IT",
      whatsapp: "9548656299"
    },
    {
      email: "user24@itm.ac.in",
      name: "Rohan Bhatia",
      password: await bcrypt.hash("password123", 10),
      branch: "ECE",
      whatsapp: "9387080188"
    },
    {
      email: "user25@itm.ac.in",
      name: "Nisha Sharma",
      password: await bcrypt.hash("password123", 10),
      branch: "ME",
      whatsapp: "9113581936"
    },
    {
      email: "user26@itm.ac.in",
      name: "Karan Singh",
      password: await bcrypt.hash("password123", 10),
      branch: "ME",
      whatsapp: "9319028078"
    },
    {
      email: "user27@itm.ac.in",
      name: "Priya Gupta",
      password: await bcrypt.hash("password123", 10),
      branch: "CSE",
      whatsapp: "9260612726"
    },
    {
      email: "user28@itm.ac.in",
      name: "Rahul Verma",
      password: await bcrypt.hash("password123", 10),
      branch: "CE",
      whatsapp: "9608300933"
    },
    {
      email: "user29@itm.ac.in",
      name: "Sneha Patel",
      password: await bcrypt.hash("password123", 10),
      branch: "CSE",
      whatsapp: "9282149639"
    },
    {
      email: "user30@itm.ac.in",
      name: "Amit Kumar",
      password: await bcrypt.hash("password123", 10),
      branch: "IT",
      whatsapp: "9411103281"
    },
    {
      email: "user31@itm.ac.in",
      name: "Neha Jain",
      password: await bcrypt.hash("password123", 10),
      branch: "ME",
      whatsapp: "9879110590"
    },
    {
      email: "user32@itm.ac.in",
      name: "Vikram Mishra",
      password: await bcrypt.hash("password123", 10),
      branch: "ECE",
      whatsapp: "9716408019"
    },
    {
      email: "user33@itm.ac.in",
      name: "Kavya Choudhary",
      password: await bcrypt.hash("password123", 10),
      branch: "ME",
      whatsapp: "9769967499"
    },
    {
      email: "user34@itm.ac.in",
      name: "Rajat Rao",
      password: await bcrypt.hash("password123", 10),
      branch: "CSE",
      whatsapp: "9662096405"
    },
    {
      email: "user35@itm.ac.in",
      name: "Simran Khanna",
      password: await bcrypt.hash("password123", 10),
      branch: "CSE",
      whatsapp: "9323379593"
    },
    {
      email: "user36@itm.ac.in",
      name: "Yash Malhotra",
      password: await bcrypt.hash("password123", 10),
      branch: "ME",
      whatsapp: "9936069261"
    },
    {
      email: "user37@itm.ac.in",
      name: "Alisha Kapoor",
      password: await bcrypt.hash("password123", 10),
      branch: "CE",
      whatsapp: "9572734170"
    },
    {
      email: "user38@itm.ac.in",
      name: "Tarun Saxena",
      password: await bcrypt.hash("password123", 10),
      branch: "ECE",
      whatsapp: "9185694416"
    },
    {
      email: "user39@itm.ac.in",
      name: "Meera Bansal",
      password: await bcrypt.hash("password123", 10),
      branch: "CE",
      whatsapp: "9127312452"
    },
    {
      email: "user40@itm.ac.in",
      name: "Siddharth Joshi",
      password: await bcrypt.hash("password123", 10),
      branch: "ECE",
      whatsapp: "9264955263"
    },
    {
      email: "user41@itm.ac.in",
      name: "Ritika Agarwal",
      password: await bcrypt.hash("password123", 10),
      branch: "IT",
      whatsapp: "9111304626"
    },
    {
      email: "user42@itm.ac.in",
      name: "Naveen Pandey",
      password: await bcrypt.hash("password123", 10),
      branch: "CE",
      whatsapp: "9362104171"
    },
    {
      email: "user43@itm.ac.in",
      name: "Shreya Mehta",
      password: await bcrypt.hash("password123", 10),
      branch: "ME",
      whatsapp: "9946754692"
    },
    {
      email: "user44@itm.ac.in",
      name: "Arpit Chauhan",
      password: await bcrypt.hash("password123", 10),
      branch: "CE",
      whatsapp: "9221512792"
    },
    {
      email: "user45@itm.ac.in",
      name: "Tanya Khan",
      password: await bcrypt.hash("password123", 10),
      branch: "CSE",
      whatsapp: "9428815365"
    },
    {
      email: "user46@itm.ac.in",
      name: "Mohit Gill",
      password: await bcrypt.hash("password123", 10),
      branch: "ECE",
      whatsapp: "9119242710"
    },
    {
      email: "user47@itm.ac.in",
      name: "Anjali Ahmed",
      password: await bcrypt.hash("password123", 10),
      branch: "ECE",
      whatsapp: "9934858761"
    },
    {
      email: "user48@itm.ac.in",
      name: "Rishi Bhatia",
      password: await bcrypt.hash("password123", 10),
      branch: "IT",
      whatsapp: "9407056011"
    },
    {
      email: "user49@itm.ac.in",
      name: "Poonam Sharma",
      password: await bcrypt.hash("password123", 10),
      branch: "ME",
      whatsapp: "9500679186"
    },
    {
      email: "user50@itm.ac.in",
      name: "Deepak Singh",
      password: await bcrypt.hash("password123", 10),
      branch: "IT",
      whatsapp: "9377749491"
    }
  ];

  await User.insertMany(users);
  console.log("50 users seeded successfully");

  mongoose.connection.close();
};

seedUsers().catch(console.error);