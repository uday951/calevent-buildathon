import os
import requests
from dotenv import load_dotenv

load_dotenv()

def generate_wedding_stage_image():
    hf_token = os.getenv('HF_TOKEN')
    
    headers = {"Authorization": f"Bearer {hf_token}"}
    
    prompt = "elegant wedding stage decoration with flowers, white drapes, golden accents, romantic lighting"
    
    response = requests.post(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        headers=headers,
        json={"inputs": prompt}
    )
    
    if response.status_code == 200:
        with open("wedding_stage.jpg", "wb") as f:
            f.write(response.content)
        print("Wedding stage image generated successfully!")
    else:
        print(f"Error: {response.status_code}")

if __name__ == "__main__":
    generate_wedding_stage_image()