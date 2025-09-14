import os
import requests
from dotenv import load_dotenv

load_dotenv()

def create_blue_birthday_stage():
    hf_token = os.getenv('HF_TOKEN')
    
    headers = {"Authorization": f"Bearer {hf_token}"}
    
    prompt = "elegant blue birthday party stage decoration with colorful flowers, blue and white balloons, birthday backdrop, festive lighting, professional event photography, high quality, detailed"
    
    response = requests.post(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        headers=headers,
        json={"inputs": prompt}
    )
    
    if response.status_code == 200:
        with open("blue_birthday_stage.jpg", "wb") as f:
            f.write(response.content)
        print("Blue birthday stage with flowers and balloons created successfully!")
        return True
    else:
        print(f"Error: {response.status_code}")
        return False

if __name__ == "__main__":
    create_blue_birthday_stage()