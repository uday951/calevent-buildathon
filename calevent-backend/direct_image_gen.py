import os
import requests
import base64
from dotenv import load_dotenv

load_dotenv()

def generate_image(prompt):
    hf_token = os.getenv('HF_TOKEN')
    
    headers = {"Authorization": f"Bearer {hf_token}"}
    
    response = requests.post(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        headers=headers,
        json={"inputs": prompt}
    )
    
    if response.status_code == 200:
        filename = f"generated_image_{prompt[:20].replace(' ', '_')}.jpg"
        with open(filename, "wb") as f:
            f.write(response.content)
        print(f"Image generated: {filename}")
        return True
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return False

# Your prompt
prompt = "blue birthday party stage decoration with colorful flowers, blue and white balloons, birthday backdrop, festive lighting, professional event photography"

generate_image(prompt)