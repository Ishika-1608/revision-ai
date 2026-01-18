import os
import uuid
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
from replicate import Client
from flask_cors import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
# We need a folder to save uploaded images temporarily
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize Replicate Client
try:
    client = Client(api_token=os.environ.get("REPLICATE_API_TOKEN"))
except Exception as e:
    print("Error initializing Replicate client. Check your API Token.")
    print(e)

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "ReVision AI Backend is Running!"})

@app.route('/generate', methods=['POST'])
def generate():
    try:
        # 1. Check if an image and prompt are in the request
        if 'image' not in request.files or 'prompt' not in request.form:
            return jsonify({"error": "Missing image or prompt"}), 400
        
        file = request.files['image']
        prompt = request.form['prompt']
        
        # Optional: Get 'strength' (how much the AI changes the image)
        # Default is 0.6 (balanced change)
        strength = float(request.form.get('strength', 0.6))

        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # 2. Save the uploaded image with a unique name
        filename = str(uuid.uuid4()) + "_" + file.filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # 3. Call the AI Model (Stable Diffusion XL)
        # We open the file in binary mode to pass it to Replicate
        with open(filepath, "rb") as image_file:
            # Using SDXL for high-quality image-to-image generation
            output = client.run(
                "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
                input={
                    "image": image_file,
                    "prompt": prompt,
                    "image_to_image_strength": strength, 
                    "num_inference_steps": 30,
                    "guidance_scale": 7.5
                }
            )

        # 4. The output from Replicate is usually a list (or single item) containing a URL
        # We return this URL to the frontend
        print("Generation Complete:", output)
        
        return jsonify({"result_url": output})

    except Exception as e:
        print(f"Error during generation: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)