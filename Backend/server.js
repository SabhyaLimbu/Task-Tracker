require('dotenv').config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");

// Import models
const User = require("./models/User");
const Task = require("./models/Task");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey123";

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Please log in" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

// Configure Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails[0].value });

                if (!user) {
                    user = new User({
                        email: profile.emails[0].value,
                        password: bcrypt.hashSync("google-auth", 10),
                        googleId: profile.id,
                    });
                    await user.save();
                }
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

// Routes
app.get("/health", (req, res) => {
    res.send("Backend is up and running!");
});

// Task Routes
app.get("/api/tasks", authenticateJWT, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: "Error fetching tasks" });
    }
});

app.post("/api/tasks", authenticateJWT, async (req, res) => {
    try {
        const newTask = new Task({
            title: req.body.title,
            user: req.user.id,
            completed: false,
        });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ message: "Error creating task" });
    }
});

app.put("/api/tasks/:id", authenticateJWT, async (req, res) => {
    const id = req.params.id;
    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }
        await Task.findByIdAndUpdate(id, req.body);
        res.json({ message: "Task updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating task" });
    }
});

app.delete("/api/tasks/:id", authenticateJWT, async (req, res) => {
    const id = req.params.id;
    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }
        await Task.findByIdAndDelete(id);
        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: "Error deleting task", error: err.message });
    }
});

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const defaultName = email.split("@")[0].replace(/[0-9]/g, "");
        const nameToUse = name || defaultName;

        if (!nameToUse || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const newUser = new User({
            name: nameToUse,
            email,
            password: bcrypt.hashSync(password, 10),
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error registering user" });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const isValidPassword = bcrypt.compareSync(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: "Wrong email or password" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: "7d",
        });

        // Exclude password from the user object
        const { password: _, ...userData } = user.toObject();
        
        res.json({ 
            token, 
            user: userData,
            message: "Login successful" 
        });
    } catch (err) {
        res.status(500).json({ message: "Error during login" });
    }
});

app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { session: false }),
    async (req, res) => {
        try {
            const token = jwt.sign({ id: req.user._id, role: req.user.role }, JWT_SECRET, {
                expiresIn: "7d",
            });
            res.redirect(`http://localhost:3000/?token=${token}`);
        } catch (err) {
            res.redirect(`http://localhost:3000/login?error=authentication_failed`);
        }
    }
);

app.post("/api/auth/logout", (req, res) => {
    res.json({
        message: "Logout successful. Please clear the token on the client side.",
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});