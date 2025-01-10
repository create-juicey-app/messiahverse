import { useState } from "react";

export default function TestPage({ setIsLoading }) {
    const [result, setResult] = useState("");

    const simulateHeavyLoad = async (seconds) => {
        setIsLoading(true);
        setResult(`Loading for ${seconds} seconds...`);
        
        try {
            // Simulate a heavy operation
            await new Promise(resolve => setTimeout(resolve, seconds * 1000));
            setResult(`Completed ${seconds} second load test!`);
        } catch (error) {
            setResult("Error occurred during load test");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold text-primary mb-8">Loading Test Page</h1>
            
            <div className="space-y-4">
                <button
                    onClick={() => simulateHeavyLoad(2)}
                    className="bg-primary text-white px-4 py-2 rounded mr-4 hover:bg-primary/80"
                >
                    2 Second Load
                </button>
                
                <button
                    onClick={() => simulateHeavyLoad(5)}
                    className="bg-primary text-white px-4 py-2 rounded mr-4 hover:bg-primary/80"
                >
                    5 Second Load
                </button>

                <button
                    onClick={() => simulateHeavyLoad(10)}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
                >
                    10 Second Load
                </button>
            </div>

            {result && (
                <div className="mt-8 p-4 bg-surface rounded-lg border border-border">
                    <p className="text-foreground">{result}</p>
                </div>
            )}
        </div>
    );
}