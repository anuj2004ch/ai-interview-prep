# AI Interview Prep 🤖

A comprehensive full-stack application designed to help users ace their technical interviews using AI-driven feedback, detailed report generation, and an automated AI-to-PDF resume pipeline.

---

## 🚀 Features

* **Secure Authentication:** Complete Auth system featuring JWT, HTTP-only cookies, and token blacklisting for secure logout.
* **AI Interviewer:** Generates dynamic interview questions and reports using AI Service integration.
* **Interview Management:** Save, retrieve, and manage your past interview reports via a dedicated dashboard.
* **AI-to-PDF Pipeline:** Converts AI-generated reports and interview data into professional PDF resumes using **Puppeteer**.
* **Protected Routes:** Robust frontend security with React Router and custom `useAuth` hooks.
* **Schema Validation:** Strict data integrity using **Zod** for AI response structures and interview models.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React.js (Vite)
* **State Management:** Context API & Custom Hooks
* **Routing:** React Router DOM
* **Styling:** SCSS
* **API Client:** Axios

### **Backend**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB Atlas (Mongoose)
* **File Handling:** Multer
* **PDF Generation:** Puppeteer
* **Validation:** Zod

---

## 📂 Project Structure

The project follows a clean **4-layer architecture** for scalability:

```text
├── Backend
│   ├── controllers/   # Business logic (Auth, Interview, PDF)
│   ├── models/        # Mongoose schemas (User, Report, Blacklist)
│   ├── routes/        # API Endpoints
│   ├── middleware/    # Auth & File upload guards
│   └── services/      # AI Integration & Puppeteer Logic
└── Frontend
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── context/    # Auth & Interview global state
    │   ├── hooks/      # useAuth, useInterview
    │   ├── services/   # Axios API instances
    │   └── pages/      # Login, Register, Home, Interview
```
⚙️ Setup & Installation
1. Clone the repository

      git clone https://github.com/anuj2004ch/ai-interview-prep.git

2. Backend Setup

   1.Navigate to /Backend.
   
   2.Install dependencies: npm install.

   3.Create a .env file and add:
     MONGO_URI,
     JWT_SECRET,
     GOOGLE_GENAI_API_KEY,
     PORT,
     FRONTEND_URL

   4.Start the server: npm run dev.

4. Frontend Setup

   1.Navigate to /Frontend.

   2.Install dependencies: npm install.

   3.Create a .env file and add:
     VITE_BACKEND_URL

   4.Start the development server: npm run dev.
