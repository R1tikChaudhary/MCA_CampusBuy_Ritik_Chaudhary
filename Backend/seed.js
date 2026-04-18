const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Product = require("./models/Product");
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
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

  // Clear existing collections
  await Product.deleteMany({});
  await User.deleteMany({});
  console.log("Existing users and products deleted");

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
      branch: "CSE",e
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

  const createdUsers = await User.insertMany(users);
  console.log("50 users seeded successfully");

  const categories = ["Electronics", "Furniture", "Books", "Fashion", "Vehicles"];
  const conditions = ["New", "Like New", "Good", "Used"];

  const categoryData = {
    Electronics: {
      titles: ["Bluetooth Speaker", "Wireless Mouse", "Gaming Keyboard", "Power Bank", "Smartwatch", "Laptop Stand"],
      descriptions: [
        "Works perfectly and has minimal usage.",
        "Excellent condition and ready to use.",
        "Great for college work and daily tasks.",
        "Well maintained and fully functional.",
        "Battery health is good and performance is smooth."
      ],
      images: [
        "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=80"
      ],
      priceRange: [300, 18000]
    },
    Furniture: {
      titles: ["Study Table", "Office Chair", "Bookshelf", "Bedside Lamp", "Storage Rack", "Bean Bag"],
      descriptions: [
        "Sturdy build and ideal for hostel or room use.",
        "Comfortable for long study sessions.",
        "No major defects, clean and ready.",
        "Compact design, fits in small spaces.",
        "Good value and in well-kept condition."
      ],
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1486946255434-2466348c2166?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
      ],
      priceRange: [500, 12000]
    },
    Books: {
      titles: ["Engineering Mathematics", "Data Structures", "DBMS Guide", "Competitive Coding Book", "Physics Notes", "Semester Combo"],
      descriptions: [
        "Helpful for semester preparation and exams.",
        "Neat pages and no missing content.",
        "Useful reference material from recent batches.",
        "Marked important topics for quick revision.",
        "Affordable set for students."
      ],
      images: [
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80"
      ],
      priceRange: [99, 3500]
    },
    Fashion: {
      titles: ["Hoodie", "Sneakers", "College Jacket", "Backpack", "Denim Shirt", "Sports T-shirt"],
      descriptions: [
        "Trendy and comfortable for everyday wear.",
        "Neatly used and maintained.",
        "Great fit and clean condition.",
        "Perfect for campus and casual outings.",
        "Looks almost new and stylish."
      ],
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=1200&q=80"
      ],
      priceRange: [250, 5000]
    },
    Vehicles: {
      titles: ["Bicycle", "Scooty Helmet", "Bike Cover", "Cycle Lock", "Car Phone Holder", "Air Pump"],
      descriptions: [
        "Reliable and useful for daily commute.",
        "Condition is good with regular care.",
        "Ready for immediate use.",
        "No hidden issues and fair pricing.",
        "Practical option for students."
      ],
      images: [
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1519583272095-6433daf26b6e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80"
      ],
      priceRange: [199, 25000]
    }
  };

  const seededProducts = [];
  for (let i = 0; i < 100; i++) {
    const category = categories[i % categories.length];
    const categoryMeta = categoryData[category];
    const titleBase = categoryMeta.titles[i % categoryMeta.titles.length];
    const description = categoryMeta.descriptions[i % categoryMeta.descriptions.length];
    const [minPrice, maxPrice] = categoryMeta.priceRange;

    const price = Math.floor(minPrice + ((i * 137) % (maxPrice - minPrice + 1)));
    const createdAt = new Date(Date.now() - i * 3 * 60 * 60 * 1000);
    const isSold = i % 5 === 0;
    const seller = createdUsers[i % createdUsers.length];
    let buyer = null;
    if (isSold) {
      buyer = createdUsers[(i + 7) % createdUsers.length];
      if (buyer._id.toString() === seller._id.toString()) {
        buyer = createdUsers[(i + 11) % createdUsers.length];
      }
    }

    seededProducts.push({
      title: `${titleBase} #${i + 1}`,
      description,
      category,
      condition: conditions[i % conditions.length],
      price,
      negotiable: i % 3 === 0,
      images: [categoryMeta.images[i % categoryMeta.images.length]],
      user: seller._id,
      status: isSold ? "Sold" : "Available",
      buyer: buyer ? buyer._id : null,
      soldAt: isSold ? new Date(createdAt.getTime() + 2 * 60 * 60 * 1000) : null,
      createdAt,
    });
  }

  await Product.insertMany(seededProducts);
  console.log("100 products seeded successfully across categories and users");

  mongoose.connection.close();
};

seedUsers().catch(console.error);
