AI Interview Prep 🤖
A comprehensive full-stack application designed to help users ace their technical interviews using AI-driven feedback, report generation, and automated resume PDF creation.

🚀 Features
Secure Authentication: Complete Auth system featuring JWT, HTTP-only cookies, and token blacklisting for secure logout.

AI Interviewer: Generates dynamic interview questions and reports using an AI Service integration.

Interview Management: Save, retrieve, and manage your past interview reports via a dedicated dashboard.

AI-to-PDF Pipeline: Converts AI-generated reports and interview data into professional PDF resumes using Puppeteer.

Protected Routes: Robust frontend security with React Router and custom useAuth hooks.

Schema Validation: Strict data integrity using Zod for AI response structures and interview models.

🛠️ Tech Stack
Frontend
Framework: React.js (Vite)

State Management: Context API & Custom Hooks

Routing: React Router 

Styling:  SCSS 

API Client: Axios

Backend
Runtime: Node.js

Framework: Express.js

Database: MongoDB Atlas (Mongoose)

File Handling: Multer

PDF Generation: Puppeteer

Validation: Zod

📂 Project Structure
The project follows a clean 4-layer architecture for scalability:

Plaintext
├── Backend
│   ├── controllers/   # Business logic
│   ├── models/        # Mongoose schemas (User, Report, Blacklist)
│   ├── routes/        # API Endpoints
│   ├── middleware/    # Auth & File upload guards
│   └── services/      # AI & PDF logic
└── Frontend
    ├── src/
    │   ├── components/ # Reusable UI
    │   ├── context/    # Auth & Interview state
    │   ├── hooks/      # useAuth, useInterview
    │   ├── services/   # Axios API instances
    │   └── pages/      # Login, Register, Home, Report
⚙️ Setup & Installation
1. Clone the repository
Bash
git clone https://github.com/anuj2004ch/ai-interview-prep.git
2. Backend Setup
Navigate to /Backend.

Install dependencies: npm install.

Create a .env file and add:

MONGO_URI

JWT_SECRET

AI_API_KEY

Start the server: npm run dev.

3. Frontend Setup
Navigate to /Frontend.

Install dependencies: npm install.

Start the development server: npm run dev.
