import React, { useState } from 'react';

// You would reuse your styles object and theme here
// For simplicity, we'll use basic inline styles in this example

const PlannerPage = () => {
    // State for the form inputs
    const [destination, setDestination] = useState('');
    const [duration, setDuration] = useState('');
    const [interests, setInterests] = useState('');
    
    // State to manage the app's status
    const [isLoading, setIsLoading] = useState(false);
    const [itinerary, setItinerary] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent the browser from reloading
        
        setIsLoading(true);
        setItinerary(null);
        setError(null);
        
        // This is where you will call your backend API!
        try {
            // 1. Gather the data
            const formData = { destination, duration, interests };

            // 2. Send it to your backend (e.g., http://localhost:5000/api/generate-itinerary)
            const response = await fetch('YOUR_BACKEND_API_URL', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Something went wrong!');
            }

            const data = await response.json();
            
            // 3. Set the result
            setItinerary(data.itinerary); // Assuming the backend returns { itinerary: "..." }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
            <h1>Ghumo Itinerary Planner</h1>
            <p style={{marginBottom: '2rem'}}>Tell us about your dream trip to India, and we'll craft the perfect plan.</p>
            
            <form onSubmit={handleSubmit}>
                {/* Form Inputs */}
                <div style={{ marginBottom: '1rem' }}>
                    <label>Destination (e.g., Jaipur, Kerala)</label>
                    <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} required style={{width: '100%', padding: '0.5rem'}}/>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Duration (e.g., 7 days)</label>
                    <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} required style={{width: '100%', padding: '0.5rem'}}/>
                </div>
                 <div style={{ marginBottom: '1.5rem' }}>
                    <label>Interests (e.g., Spiritual journey, street food, forts)</label>
                    <input type="text" value={interests} onChange={(e) => setInterests(e.target.value)} required style={{width: '100%', padding: '0.5rem'}}/>
                </div>
                <button type="submit" disabled={isLoading} style={{padding: '0.75rem 1.5rem', cursor: 'pointer'}}>
                    {isLoading ? 'Crafting Your Adventure...' : 'Generate Itinerary'}
                </button>
            </form>

            {/* Display Area for Results */}
            <div style={{marginTop: '3rem'}}>
                {isLoading && <p>Please wait, our AI is building your personalized plan...</p>}
                {error && <p style={{color: 'red'}}>Error: {error}</p>}
                {itinerary && (
                    <div>
                        <h2>Your Trip to {destination}</h2>
                        <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f4f4f4', padding: '1rem', borderRadius: '8px' }}>
                            {itinerary}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlannerPage;