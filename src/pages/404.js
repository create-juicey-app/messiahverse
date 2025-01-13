export default function Custom404() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center space-y-4">
                <h1 className="text-6xl font-bold text-gray-800">404</h1>
                <h2 className="text-3xl font-semibold text-gray-600">Page Not Found</h2>
                <p className="text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
                <a 
                    href="/"
                    className="inline-block px-6 py-3 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go Home
                </a>
            </div>
        </div>
    );
}