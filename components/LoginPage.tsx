
import React from 'react';
import { Facebook, Chrome } from 'lucide-react';

const LoginPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    FireSocial
                </h1>
                <p className="text-gray-400 mb-8">
                    Connect with the world.
                </p>

                <div className="space-y-4">
                    <button
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold"
                    >
                        <Facebook size={20} />
                        Log in with Facebook
                    </button>
                    <button
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-gray-700 hover:bg-gray-800 transition-colors font-semibold"
                    >
                        <Chrome size={20} />
                        Log in with Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
