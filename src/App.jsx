import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import Reports from "@/routes/dashboard/reports";
import Users from "@/routes/dashboard/users";
import VerifiedUsers from "@/routes/dashboard/verifiedUsers";
import Cars from "@/routes/dashboard/cars";
import VerifiedCars from "@/routes/dashboard/verifiedCars";

import LoginPage from "@/routes/auth/loginPage";

function App() {
    const router = createBrowserRouter([
        {
            path: "/login",
            element: <LoginPage />,
        },
        {
            path: "/",
            element: (
                <Navigate
                    to="/login"
                    replace
                />
            ),
        },
        {
            path: "/dashboard",
            element: <Layout />,
            children: [
                {
                    index: true,
                    element: <DashboardPage />,
                },
                {
                    path: "reports",
                    element: <Reports />,
                },
                {
                    path: "users",
                    element: <Users />,
                },
                {
                    path: "verifiedUsers",
                    element: <VerifiedUsers />,
                },
                {
                    path: "cars",
                    element: <Cars />,
                },
                {
                    path: "verifiedCars",
                    element: <VerifiedCars />,
                },
                // {
                //     path: "settings",
                //     element: <h1 className="title">Settings</h1>,
                // },
            ],
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;
