import React from 'react';
import { Sparkles } from 'lucide-react';

const LoginPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-red-500 text-white font-sans">
            <div className="text-center p-4">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 flex items-center gap-4 justify-center">
                    <Sparkles size={64} className="animate-pulse" />
                    FireSocial
                </h1>
                <p className="text-lg md:text-xl">Connecting the world, one spark at a time.</p>
                <div className="mt-12 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
                    <p className="mt-4 tracking-wider">Loading your feed...</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
