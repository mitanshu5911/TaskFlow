import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    await User.deleteMany();

    const users = await User.insertMany([
      {
        name: "Rahul Sharma",
        email: "rahul@test.com",
        isDefault: true,
      },
      {
        name: "Priya Verma",
        email: "priya@test.com",
      },
      {
        name: "Aman Singh",
        email: "aman@test.com",
      },
      {
        name: "Neha Gupta",
        email: "neha@test.com",
      },
      {
        name: "Arjun Mehta",
        email: "arjun@test.com",
      },
    ]);

    console.log("✅ Users Seeded Successfully");
    console.log(users);

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();