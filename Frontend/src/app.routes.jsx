import { createBrowserRouter, Link } from "react-router"
import Login from "./features/auth/pages/Login"
import Register from "./features/auth/pages/Register"
import Protected from "./features/auth/components/Protected"
import Home from "./features/interview/pages/Home"
import Interview from "./features/interview/pages/Interview"
import MockInterview from "./features/interview/pages/MockInterview"
import Flashcards from "./features/interview/pages/Flashcards"
import PublicReport from "./features/interview/pages/PublicReport"

export const router = createBrowserRouter([
    { path: "/login",    element: <Login /> },
    { path: "/register", element: <Register /> },
    {
        path: "/",
        element: <Protected><Home /></Protected>
    },
    {
        path: "/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    },
    {
        path: "/mock/:interviewId",
        element: <Protected><MockInterview /></Protected>
    },
    {
        path: "/flashcards/:interviewId",
        element: <Protected><Flashcards /></Protected>
    },
    {
        path: "/share/:interviewId",
        element: <PublicReport />
    },
    {
        path: "*",
        element: (
            <main className="loading-screen">
                <h1>Page not found.</h1>
                <Link to="/" style={{ color: "#ff2a6d" }}>Back to dashboard</Link>
            </main>
        )
    }
])
