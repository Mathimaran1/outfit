import yaml
import logging
import base64
import re
import requests
import os

# Configure logging for the project
logging.basicConfig(
    format='[%(levelname)s] %(asctime)s - %(message)s',
    level=logging.INFO,
    handlers=[logging.StreamHandler()]
)

# Load YAML file
def load_yaml():
    logging.info("Loading API key and config from YAML")
    config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config.yaml")
    with open(config_path, "r") as file:
        data = yaml.safe_load(file)
    return data

# Prompt template
def load_prompt():
    logging.info("Loading the prompt template for the face")
    return """
        Analyze the provided facial image and provide the following details in bullet points:

        Beard Type: [clean-shaven, stubble, full beard]
        Hair Density: [sparse, medium, dense]
        Face Type: [oval, round, square, heart-shaped]
        Skin Color: [fair, medium, dark]
        Face Size: [small, medium, large]
        Face Structure: [angular, soft, prominent jawline]

        If there is no single human face or multiple faces detected, only then say: 
        "There is no face detected or the image isn't clear enough for analysing. Please re-try for better working."

        Otherwise, strictly provide the details in this exact format without any additional text:

        Beard Type:
        Hair Density:
        Face Type:
        Skin Color:
        Face Size:
        Face Structure:
    """

# Main execution
def get_cloths_desc(image_path):
    logging.info("Running face descriptor with NVIDIA Llama Vision")

    try:
        # Load config
        config = load_yaml()
        api_key = config['Face_Desc']['api_key']
        
        # Load and encode image using PIL to resize
        from PIL import Image
        import io
        with Image.open(image_path) as img:
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
            buffered = io.BytesIO()
            img.save(buffered, format="JPEG", quality=85)
            image_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

        # NVIDIA API configuration
        invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
        stream = False  # Set to False for simpler response handling
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json"
        }
        
        # Prepare the payload with image
        prompt = load_prompt()
        payload = {
            "model": "meta/llama-3.2-90b-vision-instruct",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": config['Face_Desc']['max_tokens'],
            "temperature": config['Face_Desc']['temperature'],
            "top_p": config['Face_Desc']['top_p'],
            "stream": stream
        }
        
        # Make API request
        logging.info("Sending request to NVIDIA API")
        response = requests.post(invoke_url, headers=headers, json=payload, timeout=45)
        
        # Check for errors
        response.raise_for_status()
        
        # Parse response
        result = response.json()
        description = result['choices'][0]['message']['content']
        
        # Clean the response
        description = re.sub(r'\*', '', str(description))
        
        logging.info("Face description generated successfully")
        return description

    except requests.exceptions.RequestException as e:
        logging.error(f"API request error: {str(e)}")
        raise RuntimeError(f"Failed to analyze face: {str(e)}")
    except Exception as e:
        logging.error(f"Error in face analysis: {str(e)}")
        raise RuntimeError(f"Failed to analyze face: {str(e)}")
    
