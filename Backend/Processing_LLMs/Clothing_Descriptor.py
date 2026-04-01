import yaml
import logging
import base64
import re
import requests
import os

# Configure logging
logging.basicConfig(
    format='[%(levelname)s] %(asctime)s - %(message)s',
    level=logging.INFO,
    handlers=[logging.StreamHandler()]
)

# Load YAML config
def load_yaml():
    env_api_key = os.environ.get("NVIDIA_API_KEY")
    try:
        logging.info("Loading API key and config from YAML")
        config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config.yaml")
        with open(config_path, "r") as file:
            data = yaml.safe_load(file)
            if env_api_key:
                for key in data:
                    if isinstance(data[key], dict) and 'api_key' in data[key]:
                        data[key]['api_key'] = env_api_key
            return data
    except Exception as e:
        logging.warning("YAML load failed. Falling back to Environment Variables.")
        return {
            'Clothing_Desc': {'api_key': env_api_key, 'model': 'meta/llama-3.2-90b-vision-instruct', 'max_tokens': 1024, 'temperature': 0.20, 'top_p': 0.70, 'frequency_penalty': 0, 'presence_penalty': 0},
            'Face_Desc': {'api_key': env_api_key, 'model': 'meta/llama-3.2-90b-vision-instruct', 'max_tokens': 1024, 'temperature': 0.20, 'top_p': 0.70},
            'Recommendation_Analyze': {'api_key': env_api_key, 'model': 'meta/llama-3.1-405b-instruct', 'max_tokens': 1024, 'temperature': 0.20, 'top_p': 0.70, 'frequency_penalty': 0, 'presence_penalty': 0}
        }

# Prompt template
def load_prompt():
    logging.info("Loading the prompt template for clothing analysis")
    return """
    Analyze the input clothing image and output *only* the following fields in the specified structure.  
    Use the predefined options for each field. No headings, explanations, or extra text.  

    Category: [Top, Bottom, Outerwear, Footwear, Accessories]  
    Type: [Shirt, T-shirt, Pant, etc.]  
    Occasion to Wear: [Casual, Formal, Party, etc.]  
    Color: [Black, Floral, Pastel Blue, etc.]  
    Fit: [Slim, Relaxed, Tailored, etc.]  
    Design: [Striped, Floral, Embroidered, Plain, etc.]  
    Material(s): [Cotton, Silk, Polyester, etc.]  
    Texture: [Smooth, Rough, Shiny, Matte, etc.]  
    Season to Wear: [Summer, Winter, All-season, etc.]  
    Belt Requirement: [Included, Optional, Not Required]  
    Label: [Casual, Formal, Business, Party, Ethnic, Athleisure, Loungewear, Seasonal, Beachwear, Streetwear]  

    Output format (strict, two words max per field):  

    Category:  
    Type:  
    Occasion to Wear:  
    Color:  
    Fit:  
    Design:  
    Material(s):  
    Texture:  
    Season to Wear:  
    Belt Requirement:  
    Label:    
    """

from PIL import Image
import io

# Convert image to base64
def to_base64(image_path):
    logging.info("Encoding image to base64 with downscaling")
    try:
        with Image.open(image_path) as img:
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
            buffered = io.BytesIO()
            img.save(buffered, format="JPEG", quality=85)
            return base64.b64encode(buffered.getvalue()).decode("utf-8")
    except Exception as e:
        logging.error(f"Error encoding image: {e}")
        return None

# Extract label from description
def extract_label(description):
    logging.info("Extracting label from description")
    try:
        pattern = r"Label:\s*([^\n]+)"
        match = re.search(pattern, description)
        if match:
            return match.group(1).strip()
        else:
            logging.warning("Label not found in description")
            return "Unknown"
    except Exception as e:
        logging.error(f"Error extracting label: {e}")
        return "Unknown"

# Main execution
def get_cloths_desc(clothings):
    logging.info("Running clothing descriptor with NVIDIA Llama Vision")
    results = []

    try:
        # Load config
        config = load_yaml()
        api_key = config['Clothing_Desc']['api_key']
        prompt = load_prompt()

        # NVIDIA API configuration
        invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json"
        }

        for image_path in clothings:
            image_base64 = to_base64(image_path)
            if not image_base64:
                continue

            # Prepare payload
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
                "max_tokens": config['Clothing_Desc']['max_tokens'],
                "temperature": config['Clothing_Desc']['temperature'],
                "top_p": config['Clothing_Desc']['top_p'],
                "frequency_penalty": config['Clothing_Desc']['frequency_penalty'],
                "presence_penalty": config['Clothing_Desc']['presence_penalty'],
                "stream": False
            }

            # Make API request
            logging.info(f"Sending request to NVIDIA API for {image_path}")
            response = requests.post(invoke_url, headers=headers, json=payload, timeout=45)
            
            # Check for errors
            response.raise_for_status()
            
            # Parse response
            result = response.json()
            description = result['choices'][0]['message']['content']
            description = re.sub(r'\*', '', str(description))  # Clean unwanted symbols
            label = extract_label(description)

            results.append({
                "description": description,
                "label": label
            })
            print(description)

        logging.info("Clothing descriptions generated successfully")
        return results

    except requests.exceptions.RequestException as e:
        logging.error(f"API request error: {e}")
        raise RuntimeError(f"Failed to analyze clothing: {e}")
    except Exception as e:
        logging.error(f"Error in clothing analysis: {e}")
        raise RuntimeError(f"Failed to analyze clothing: {e}")
    
    