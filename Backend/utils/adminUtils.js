const parseAdminEmails = () => {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const isAdminUser = (user) => {
  if (!user) return false;
  if (user.isAdmin === true) return true;

  const email = (user.email || "").toLowerCase();
  if (!email) return false;

  const adminEmails = parseAdminEmails();
  return adminEmails.includes(email);
};

module.exports = {
  isAdminUser,
};

