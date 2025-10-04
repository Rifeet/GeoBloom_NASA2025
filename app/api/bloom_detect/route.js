export async function POST(request) {
  try {
    const body = await request.json(); // get the data from the POST request
    const { polygon, dateRange } = body;

    // Here you would fetch Sentinel-2 / NDVI data for the polygon
    // Example (pseudo-code):
    // const ndviResult = await getNDVI(polygon, dateRange);

    // For demo, just return received data with a mock result
    const mockResult = {
      ndvi_mean: 0.72,
      status: "peak",
      intensity: "high",
    };

    return new Response(
      JSON.stringify({ polygon, dateRange, result: mockResult }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
