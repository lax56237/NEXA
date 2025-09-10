'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Smartphone, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();

    const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [otpSent, setOtpSent] = useState('');
    const [userOtp, setUserOtp] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const sendOtp = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/account/send-otp', {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (data.otp) {
                setOtpSent(data.otp);
                setStep('otp');
            } else {
                setError('Failed to send OTP');
            }
        } catch (err) {
            setError('Server error');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = () => {
        if (userOtp === otpSent) {
            setStep('password');
            setError('');
        } else {
            setError('Incorrect OTP');
        }
    };

    const createAccount = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/account/create-user', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            if (data.success) {

                const jwtRes = await fetch('/api/account/generate-token', {
                    method: 'POST',
                    body: JSON.stringify({ email }),
                    headers: { 'Content-Type': 'application/json' },
                });

                const jwtData = await jwtRes.json();

                if (jwtData.token) {
                    localStorage.setItem("authToken", jwtData.token);
                    router.push('/userdetails');
                } else {
                    setError("JWT generation failed");
                }
            } else {
                setError('Failed to create account');
            }
        } catch (err) {
            setError('Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Join NEXA
                    </h1>
                    <p className="text-gray-600 text-lg">Your space to connect, create, and collaborate</p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1">
                        <div className="flex justify-between px-4 py-2 text-white text-sm">
                            <span className={`flex items-center ${step === 'email' ? 'opacity-100' : 'opacity-60'}`}>
                                <Mail size={16} className="mr-2" />
                                Email
                            </span>
                            <span className={`flex items-center ${step === 'otp' ? 'opacity-100' : 'opacity-60'}`}>
                                <Smartphone size={16} className="mr-2" />
                                OTP
                            </span>
                            <span className={`flex items-center ${step === 'password' ? 'opacity-100' : 'opacity-60'}`}>
                                <Lock size={16} className="mr-2" />
                                Password
                            </span>
                        </div>
                    </div>

                    <div className="p-8">
                        {step === 'email' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="inline-flex p-4 rounded-full bg-blue-100 mb-4">
                                        <Mail size={24} className="text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Your Email</h2>
                                    <p className="text-gray-600">We'll send you a verification code</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={sendOtp}
                                    disabled={loading || !email.trim()}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Sending OTP...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Verification Code</span>
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {step === 'otp' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="inline-flex p-4 rounded-full bg-green-100 mb-4">
                                        <Smartphone size={24} className="text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
                                    <p className="text-gray-600">Enter the 6-digit code sent to {email}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                                    <div className="relative">
                                        <Smartphone size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit OTP"
                                            value={userOtp}
                                            onChange={(e) => setUserOtp(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 text-lg text-center tracking-widest"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={verifyOtp}
                                    disabled={!userOtp.trim() || userOtp.length !== 6}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                                >
                                    <span>Verify Code</span>
                                    <ArrowRight size={20} />
                                </button>

                                <button
                                    onClick={() => setStep('email')}
                                    className="w-full text-gray-600 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-300"
                                >
                                    ← Back to Email
                                </button>
                            </div>
                        )}

                        {step === 'password' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="inline-flex p-4 rounded-full bg-purple-100 mb-4">
                                        <Lock size={24} className="text-purple-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Password</h2>
                                    <p className="text-gray-600">Choose a strong password for your account</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                    <div className="relative">
                                        <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            placeholder="Create a strong password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-lg"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Use at least 8 characters with letters, numbers, and symbols</p>
                                </div>

                                <button
                                    onClick={createAccount}
                                    disabled={loading || !password.trim()}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Creating Account...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Create Account</span>
                                            <CheckCircle size={20} />
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => setStep('otp')}
                                    className="w-full text-gray-600 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-300"
                                >
                                    ← Back to OTP
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                                <span className="text-red-700 font-medium">{error}</span>
                            </div>
                        )}

                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-300">
                                    Sign in here
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <p className="text-gray-500 text-sm">
                        By signing up, you agree to our{' '}
                        <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
