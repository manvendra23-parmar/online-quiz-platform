Online Quiz & Assessment Platform (Quizora)

About the System

Quizora is an online quiz and assessment system made for conducting MCQ-based exams in an easy and secure way. Users can register, attend quizzes, check scores, and view rankings on the leaderboard. Admin can manage quizzes, questions, and monitor student performance.

The system is built using:

Frontend: React.js + Vite
Backend: Node.js + Express.js
Database: SQLite / MySQL
Features
Student Features
Register and login
Attend timed quizzes
Auto save answers during quiz
View score after completing quiz
Check leaderboard ranking
Review answers with explanations
Admin Features
Create, edit, and delete quizzes
Add and manage questions
View student performance
Manage quiz results and analytics
Project Structure

online-quiz-platform/

backend/ → Server-side code

frontend/ → User interface code

README.md → Project documentation

How to Run the System
Step 1: Start Backend

Go to backend folder:

cd backend

Install packages:

npm install

Run server:

npm run dev

The backend will run on:

http://localhost:5137
Step 2: Start Frontend

Open another terminal and go to frontend folder:

cd frontend

Install packages:

npm install

Run frontend:

npm run dev

Open the link shown in terminal (usually):

http://localhost:5173
Demo Login Details
Student Account

Email:

user@quizplatform.com

Password:

userpassword
Admin Account

Email:

test@example.com

Password:

password123
Database

The system supports both SQLite and MySQL.

By default, SQLite works automatically.

If needed, MySQL can also be connected by changing database settings in the .env file.

Testing

To test backend APIs:

node scratch/test-api.js
Conclusion

Quizora is a simple and useful online quiz system for conducting MCQ exams. It helps students attend quizzes online and allows admins to manage quizzes and check performance easily.catalog-attempt-autosave-scoring sequence and output pass/fail results for each phase!*
