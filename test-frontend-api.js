// Test script to verify frontend can call backend API
// Run this in browser console on http://localhost:3000

async function testFrontendAPI() {
    console.log("Testing Frontend -> Backend API Integration");
    
    // Step 1: Test analyze endpoint
    const formData = new FormData();
    formData.append('audio_description', 'Test issue: broken light fixture in conference room');
    formData.append('location', JSON.stringify({
        lat: 40.7128,
        lng: -74.0060,
        area: "Conference Room A",
        floor: 2
    }));
    formData.append('manual_notes', 'Flickering for past 2 days');
    
    console.log("Calling /api/tasks/analyze...");
    const analyzeResponse = await fetch('http://localhost:8001/api/tasks/analyze', {
        method: 'POST',
        body: formData
    });
    
    const analysis = await analyzeResponse.json();
    console.log("Analysis result:", analysis);
    
    // Step 2: Test confirm endpoint
    const confirmData = {
        analysis_id: analysis.analysis_id,
        user_id: "frontend_test",
        organization_id: "venue_001",
        priority: analysis.priority,
        description: analysis.ai_analysis?.description || "Light fixture issue"
    };
    
    console.log("Calling /api/tasks/confirm...");
    const confirmResponse = await fetch('http://localhost:8001/api/tasks/confirm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(confirmData)
    });
    
    const task = await confirmResponse.json();
    console.log("Task created:", task);
    
    return {
        analysis,
        task
    };
}

// Run the test
testFrontendAPI().then(result => {
    console.log("✅ Test complete!", result);
}).catch(error => {
    console.error("❌ Test failed:", error);
});