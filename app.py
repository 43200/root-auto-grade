from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "your_secret_key"  # Change this in production
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app, supports_credentials=True)

# In-memory quiz data (Replace this with a database in production)
quiz_questions = [
    {"id": 1, "question": "What is 2 + 2?", "options": ["3", "4", "5", "6"], "answer": "4"},
    {"id": 2, "question": "What is the capital of France?", "options": ["London", "Berlin", "Paris", "Rome"], "answer": "Paris"},
    {"id": 3, "question": "What is the chemical symbol for gold?", "options": ["Al", "Ch", "H", "Au"], "answer": "Au"},
    {"id": 4, "question": "How many continents are there on Earth?", "options": ["5", "6", "7", "8"], "answer": "7"},
    {"id": 5, "question": "What is the full form of AI?", "options": ["Another Internet", "App Integration", "Artificial Intelligence", "Art Intelligence"], "answer": "Artificial Intelligence"}
]

# Database setup
def create_tables():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    # Create scores table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            best_score INTEGER NOT NULL
        )
    """)

    conn.commit()
    conn.close()

create_tables()  # Run table creation on startup

# Function to connect to the database
def get_db():
    conn = sqlite3.connect("users.db")
    conn.row_factory = sqlite3.Row
    return conn

# Route 1: User Registration
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

        conn = get_db()
        cursor = conn.cursor()

        # Check if the user already exists
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        existing_user = cursor.fetchone()

        if existing_user:
            conn.close()
            return jsonify({"error": "User already exists"}), 400

        # Insert new user
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_password))
        conn.commit()
        conn.close()

        return jsonify({"message": "User registered successfully"}), 201

    except sqlite3.IntegrityError:  # Handles UNIQUE constraint failure
        return jsonify({"error": "User already exists"}), 400

    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

# Route 2: User Login
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        conn.close()

        if user is None or not bcrypt.check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid username or password"}), 401

        access_token = create_access_token(identity=username)
        return jsonify({"token": access_token})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Route 3: Fetch Quiz Questions
@app.route('/get-quiz', methods=['GET'])
@jwt_required()
def get_quiz():
    return jsonify({"questions": quiz_questions})

# Route 4: Submit Quiz & Update Score
@app.route('/submit-quiz', methods=['POST'])
@jwt_required()
def submit_quiz():
    try:
        user = get_jwt_identity()
        data = request.get_json()
        user_answers = data.get("answers")

        if not user_answers or not isinstance(user_answers, list):
            return jsonify({"error": "Invalid answer format"}), 400

        score = sum(1 for i, question in enumerate(quiz_questions) if i < len(user_answers) and user_answers[i] == question["answer"])

        conn = get_db()
        cursor = conn.cursor()

        # Check if user already has a previous score
        cursor.execute("SELECT best_score FROM scores WHERE username = ?", (user,))
        existing_score = cursor.fetchone()

        if existing_score:
            if score > existing_score["best_score"]:  # Update only if new score is higher
                cursor.execute("UPDATE scores SET best_score = ? WHERE username = ?", (score, user))
        else:
            cursor.execute("INSERT INTO scores (username, best_score) VALUES (?, ?)", (user, score))

        conn.commit()
        conn.close()

        return jsonify({"message": "Quiz submitted!", "score": score})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Route 5: Get Leaderboard (Top Scores)
@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Fetch the highest score per user, sorted in descending order
        cursor.execute("SELECT username, best_score FROM scores ORDER BY best_score DESC LIMIT 10")
        leaderboard = cursor.fetchall()
        conn.close()

        leaderboard_data = [{"user": row["username"], "score": row["best_score"]} for row in leaderboard]
        return jsonify({"leaderboard": leaderboard_data})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Backend is running!"})

@app.route("/health")
def health_check():
    return "OK", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
