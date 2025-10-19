import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { showFirebaseError, showSuccess } from "../../utils/toastMessages";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/auth";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await loginUser(email, password);
            localStorage.setItem("FIREBASE_AUTH", "true");
            navigate("/dashboard");
        } catch (error) {
            showFirebaseError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
            <Toaster
                position="right-top"
                reverseOrder={false}
            />
            <form
                onSubmit={handleSubmit}
                className="w-96 rounded-2xl bg-white p-8 shadow-md dark:bg-gray-800"
            >
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">Login</h2>

                <div className="mb-4">
                    <label className="mb-2 block text-gray-700 dark:text-gray-300">Email</label>
                    <input
                        type="email"
                        className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="mb-2 block text-gray-700 dark:text-gray-300">Password</label>
                    <input
                        type="password"
                        className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-5 w-full rounded-lg bg-blue-500 py-2 text-white transition hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Log In"}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;
