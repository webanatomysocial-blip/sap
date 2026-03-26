import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { Helmet } from "react-helmet-async";
import { forgotPassword } from "../services/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword(email);
            setSubmitted(true);
            addToast("If your email is registered, you will receive a reset link.", "success");
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to process request.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "100px 20px", display: "flex", justifyContent: "center", background: "#f8fafc" }}>
            <Helmet><title>Forgot Password | SAP Security Expert</title></Helmet>
            <div style={{ maxWidth: "400px", width: "100%", background: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
                <h2 style={{ marginBottom: "16px" }}>Forgot Password?</h2>
                <p style={{ color: "#64748b", marginBottom: "32px" }}>Enter your email address and we'll send you a link to reset your password.</p>

                {submitted ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <p style={{ color: "#059669", fontWeight: "600", marginBottom: "20px" }}>Email Sent!</p>
                        <p style={{ marginBottom: "20px" }}>Please check your inbox (and spam folder) for the reset link.</p>
                        <Link to="/member/login" style={{ color: "#3b82f6", textDecoration: "none" }}>Back to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: "24px" }}>
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@company.com"
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={loading}>
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                        <div style={{ textAlign: "center", marginTop: "20px" }}>
                            <Link to="/member/login" style={{ fontSize: "0.9rem", color: "#64748b" }}>Wait, I remember it!</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
