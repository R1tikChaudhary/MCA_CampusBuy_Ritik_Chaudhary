const bcrypt = require("bcryptjs");

const generateUsers = async () => {
  const users = [];
  for (let i = 0; i < 50; i++) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    users.push({
      email: `user${i + 1}@itm.ac.in`,
      name: [
        "Aarav Sharma", "Vihaan Gupta", "Arjun Verma", "Reyansh Singh", "Ayaan Patel",
        "Ishaan Kumar", "Advik Jain", "Ananya Mishra", "Diya Choudhary", "Saanvi Rao",
        "Aryan Khanna", "Kabir Malhotra", "Riya Kapoor", "Arnav Saxena", "Myra Bansal",
        "Devansh Joshi", "Anika Agarwal", "Rudra Pandey", "Pari Mehta", "Veer Chauhan",
        "Zara Khan", "Aryan Gill", "Sara Ahmed", "Rohan Bhatia", "Nisha Sharma",
        "Karan Singh", "Priya Gupta", "Rahul Verma", "Sneha Patel", "Amit Kumar",
        "Neha Jain", "Vikram Mishra", "Kavya Choudhary", "Rajat Rao", "Simran Khanna",
        "Yash Malhotra", "Alisha Kapoor", "Tarun Saxena", "Meera Bansal", "Siddharth Joshi",
        "Ritika Agarwal", "Naveen Pandey", "Shreya Mehta", "Arpit Chauhan", "Tanya Khan",
        "Mohit Gill", "Anjali Ahmed", "Rishi Bhatia", "Poonam Sharma", "Deepak Singh"
      ][i],
      password: hashedPassword,
      branch: [
        "ME", "ECE", "ME", "CSE", "IT", "ECE", "IT", "ME", "ME", "CSE",
        "ECE", "CSE", "CSE", "ECE", "CSE", "IT", "IT", "CE", "IT", "IT",
        "IT", "IT", "IT", "ECE", "ME", "ME", "CSE", "CE", "CSE", "IT",
        "ME", "ECE", "ME", "CSE", "CSE", "ME", "CE", "ECE", "CE", "ECE",
        "IT", "CE", "ME", "CE", "CSE", "ECE", "ECE", "IT", "ME", "IT"
      ][i],
      whatsapp: [
        "9518286009", "9533519143", "9168429812", "9412080419", "9839174678",
        "9502358270", "9202238696", "9158978498", "9320852729", "9153174167",
        "9866363195", "9490185848", "9641030096", "9897651213", "9972260705",
        "9996887023", "9424183632", "9702204550", "9753454754", "9859495772",
        "9104780989", "9401007115", "9548656299", "9387080188", "9113581936",
        "9319028078", "9260612726", "9608300933", "9282149639", "9411103281",
        "9879110590", "9716408019", "9769967499", "9662096405", "9323379593",
        "9936069261", "9572734170", "9185694416", "9127312452", "9264955263",
        "9111304626", "9362104171", "9946754692", "9221512792", "9428815365",
        "9119242710", "9934858761", "9407056011", "9500679186", "9377749491"
      ][i]
    });
  }
  console.log(JSON.stringify(users, null, 2));
};

generateUsers();