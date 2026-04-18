const branches = ['CSE', 'ECE', 'ME', 'CE', 'IT'];
const names = [
  'Aarav Sharma', 'Vihaan Gupta', 'Arjun Verma', 'Reyansh Singh', 'Ayaan Patel',
  'Ishaan Kumar', 'Advik Jain', 'Ananya Mishra', 'Diya Choudhary', 'Saanvi Rao',
  'Aryan Khanna', 'Kabir Malhotra', 'Riya Kapoor', 'Arnav Saxena', 'Myra Bansal',
  'Devansh Joshi', 'Anika Agarwal', 'Rudra Pandey', 'Pari Mehta', 'Veer Chauhan',
  'Zara Khan', 'Aryan Gill', 'Sara Ahmed', 'Rohan Bhatia', 'Nisha Sharma',
  'Karan Singh', 'Priya Gupta', 'Rahul Verma', 'Sneha Patel', 'Amit Kumar',
  'Neha Jain', 'Vikram Mishra', 'Kavya Choudhary', 'Rajat Rao', 'Simran Khanna',
  'Yash Malhotra', 'Alisha Kapoor', 'Tarun Saxena', 'Meera Bansal', 'Siddharth Joshi',
  'Ritika Agarwal', 'Naveen Pandey', 'Shreya Mehta', 'Arpit Chauhan', 'Tanya Khan',
  'Mohit Gill', 'Anjali Ahmed', 'Rishi Bhatia', 'Poonam Sharma', 'Deepak Singh'
];

const users = [];
for (let i = 0; i < 50; i++) {
  const branch = branches[Math.floor(Math.random() * branches.length)];
  const name = names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : '');
  users.push({
    email: `user${i + 1}@itm.ac.in`,
    name: name,
    password: 'password123', // Will be hashed
    branch: branch,
    whatsapp: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
  });
}
console.log(JSON.stringify(users, null, 2));