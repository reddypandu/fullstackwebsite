const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

// Connect to MongoDB (replace <your-connection-string> with your actual connection string)
const connectionString =
  "mongodb+srv://pandureddypatterns:L3ItZ97qbAo1TjPt@cluster0.by9nkhh.mongodb.net/pandu?retryWrites=true&w=majority";
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pandureddypatterns@gmail.com", // Replace with your Gmail email address
    pass: "Pandu@12", // Replace with your Gmail password or an app-specific password
  },
  tls: {
    rejectUnauthorized: false,
  },
});
// Define a mongoose schema for the user data
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  number: {
    type: Number,
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer.",
    },
  },
  gender: String,
});

// Create a mongoose model based on the schema
const User = mongoose.model("User", userSchema);

// Middleware setup
app.use(bodyParser.json());

// Serve static files (e.g., HTML, CSS, client-side JavaScript)
app.use(express.static("public"));

// Handle form submission
app.post("/submit-form", async (req, res) => {
  const { name, email, number, gender } = req.body;

  try {
    // Create a new user instance
    const newUser = new User({
      name,
      email,
      number,
      gender,
    });

    // Save the user to the database
    await newUser.save();
    // Send email notification
    const mailOptions = {
      from: "pandureddypatterns@gmail.com", // Replace with your Gmail email address
      to: "saipandupatt143@gmail.com", // Replace with the recipient's email address
      subject: "New Form Submission",
      text: `Name: ${name}\nEmail: ${email}\nNumber: ${number}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
    res.json({ message: "Form data submitted successfully!" });
  } catch (error) {
    console.error("Error saving user to database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
