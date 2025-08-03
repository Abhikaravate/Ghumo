# #  api_key = 'AIzaSyDBPC1XpPJR7blZYuVjTAd5kKPdmtvZ-NU'
# 1. **Itinerary Structure:**
#    - Use **Markdown formatting**.
#    - Start with a Google Maps link of the **main destination**.
#    - Use `**Day X: Title**` for each day.
#    - Include bullet points (`-`) for key activities.
#    - End with an optional tip or suggestion if needed.

# 2. **Tone and Style:**
#    - Write like a **friendly, professional local travel expert**.
#    - Be **engaging, practical, and culturally insightful**.
#    - Make the user feel excited and confident about the trip.

# 3. **Content Requirements:**
#    - Include a mix of **famous attractions** and **local hidden gems**.
#    - Mention local food specialties, cafes, or restaurants.
#    - Recommend travel tips (e.g., timing, attire, bargaining tips, safety).
#    - Ensure the plan is **realistic** based on the trip duration.
#    - Avoid unsafe or illegal suggestions.

# 4. **Images – Real Places Only:**
#    - Add **real, relevant images** of the places you mention.
#    - Use **direct image links** ending in `.jpg` or `.png` (from trusted sources like Unsplash or Wikimedia Commons).
#    - Avoid generic or AI-generated images.
#    - Embed them using Markdown like this:  
#      `![Image Description](https://example.com/image.jpg)`
#    - Add **1–2 high-quality images per major destination/day** that match the places mentioned.

# 5. **Maps:**
#    - At the very top, include a Google Maps link to the primary destination, like:  
#      `[View on Google Maps](https://www.google.com/maps/place/...)`

# ---

# server/app.py

# server/app.py

# server/app.py

import os
import re
import requests
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

# --- 1. CONFIGURE API KEYS ---
try:
    # Use the new, clear environment variable names
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    unsplash_access_key = os.getenv("UNSPLASH_ACCESS_KEY")
    
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY not found in .env file.")
    if not unsplash_access_key:
        raise ValueError("UNSPLASH_ACCESS_KEY not found in .env file.")
        
    genai.configure(api_key=gemini_api_key)

except ValueError as e:
    print(f"Configuration Error: {e}")
    exit()

# --- 2. NEW FUNCTION TO FETCH IMAGES FROM UNSPLASH ---
def fetch_image_for_location(location_name):
    """Fetches an image URL for a given location from Unsplash."""
    if not location_name:
        return None
    
    api_url = f"https://api.unsplash.com/search/photos?query={location_name}&per_page=1&orientation=landscape"
    headers = {
        "Authorization": f"Client-ID {unsplash_access_key}"
    }
    
    try:
        response = requests.get(api_url, headers=headers)
        response.raise_for_status()  # Raises an exception for bad status codes
        data = response.json()
        
        if data["results"]:
            image = data["results"][0]
            return {
                "url": image["urls"]["regular"],
                "description": image["alt_description"] or f"A photo of {location_name}"
            }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching image for '{location_name}': {e}")
    
    return None

# --- 3. NEW FUNCTION TO ADD IMAGES TO THE ITINERARY ---
def add_images_to_itinerary(itinerary_text):
    """Parses itinerary, finds locations, and injects image markdown."""
    # Find all "Day X: Location" headings
    day_headings = re.findall(r"(\*\*(Day \d+:.+?)\*\*)", itinerary_text)
    
    for full_heading, heading_text in day_headings:
        # Extract the primary location from the heading text
        # e.g., "Day 1: Arrival in Manali & Trek" -> "Manali"
        location_match = re.search(r":\s*.*?in\s+([\w\s]+)", heading_text)
        if not location_match:
             location_match = re.search(r":\s*([\w\s]+)", heading_text) # Fallback
        
        if location_match:
            location_name = location_match.group(1).split('&')[0].strip()
            image_data = fetch_image_for_location(location_name)
            
            if image_data:
                # Create the Markdown image tag
                markdown_image = f"\n![{image_data['description']}]({image_data['url']})\n"
                # Insert the image markdown right after the full heading
                itinerary_text = itinerary_text.replace(full_heading, full_heading + markdown_image, 1)

    return itinerary_text


MODEL_FALLBACK_ORDER = ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest']

@app.route("/api/generate-itinerary", methods=["POST"])
def generate_itinerary():
    data = request.get_json()
    if not data or "prompt" not in data:
        return jsonify({"error": "Prompt is missing"}), 400

    user_prompt = data["prompt"]

    # --- 4. SIMPLIFIED PROMPT FOR THE AI ---
    # The AI no longer needs to worry about finding images.
    model_prompt = f"""
    You are Ghumo, an expert Indian travel guide. Create a detailed, engaging, and realistic travel itinerary based on the user's request.
    
    1. **Itinerary Structure:**
       - Use **Markdown formatting**.
       - Start with a Google Maps link for the main destination.
       - Use `**Day X: Title**` for each day.
       - Include bullet points (`-`) for key activities.
       - End with an optional tip or suggestion if needed.

    2. **Tone and Style:**
       - Write like a **friendly, professional local travel expert**.
       - Be **engaging, practical, and culturally insightful**.
       - Make the user feel excited and confident about the trip.

    3. **Content Requirements:**
       - Include a mix of **famous attractions** and **local hidden gems**.
       - Mention local food specialties, cafes, or restaurants.
       - Recommend travel tips (e.g., timing, attire, bargaining tips, safety).
       - Ensure the plan is **realistic** based on the trip duration.

    4. **Tone and Style:**
       - Write like a **friendly, professional local travel expert**.
       - Be **engaging, practical, and culturally insightful**.
       - Make the user feel excited and confident about the trip.
       - Start with a Google Maps link for the main destination.
       - Use `**Day X: Title**` for each day's heading.
    - Use bullet points (-) for activities.
    - Include practical tips, local food, and hidden gems.
    
    **User Request:** "{user_prompt}"
    
    **Your Itinerary:**
    """

    last_error = None
    for model_name in MODEL_FALLBACK_ORDER:
        try:
            print(f"Attempting to use model: {model_name}")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(model_prompt)
            
            # --- 5. PROCESS THE RESPONSE TO ADD IMAGES ---
            itinerary_with_images = add_images_to_itinerary(response.text)
            
            print(f"Successfully generated and enhanced content with {model_name}")
            return jsonify({"itinerary": itinerary_with_images})

        except Exception as e:
            print(f"Error with model {model_name}: {e}")
            last_error = str(e)
            continue

    print("All models failed to generate a response.")
    return jsonify({
        "error": "Failed to generate itinerary. All models are currently busy or an error occurred.",
        "details": last_error
    }), 503

if __name__ == "__main__":
    app.run(debug=True, port=5001)