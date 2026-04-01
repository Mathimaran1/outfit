import yaml
import logging
import re
import requests

# Loading the YAML file
def load_yaml():
    import os
    env_api_key = os.environ.get("NVIDIA_API_KEY")
    try:
        config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config.yaml")
        with open(config_path, "r") as file:
            data = yaml.safe_load(file)
            if env_api_key:
                for key in data:
                    if isinstance(data[key], dict) and 'api_key' in data[key]:
                        data[key]['api_key'] = env_api_key
            return data
    except Exception as e:
        return {
            'Clothing_Desc': {'api_key': env_api_key, 'model': 'meta/llama-3.2-90b-vision-instruct', 'max_tokens': 1024, 'temperature': 0.20, 'top_p': 0.70, 'frequency_penalty': 0, 'presence_penalty': 0},
            'Face_Desc': {'api_key': env_api_key, 'model': 'meta/llama-3.2-90b-vision-instruct', 'max_tokens': 1024, 'temperature': 0.20, 'top_p': 0.70},
            'Recommendation_Analyze': {'api_key': env_api_key, 'model': 'meta/llama-3.1-405b-instruct', 'max_tokens': 1024, 'temperature': 0.20, 'top_p': 0.70, 'frequency_penalty': 0, 'presence_penalty': 0}
        }

# Loading the prompt template
def load_prompt(cloths, face, cloth_compare):
    logging.info("Loading the strict JSON prompt template for the analysis")
    return f"""
            You are a strict and precise AI fashion stylist. 
            Evaluate the following clothing item against the user's features and wardrobe.

            User Details:
            {face}

            Clothing Comparison Target (New Item):
            {cloth_compare}

            Wardrobe Set (for context):
            {cloths}

            Return ONLY valid JSON.
            Do NOT include explanations, reasoning, or extra text.

            Output format:
            {{
              "overall_score": number (0-10),
              "features": {{
                "face_shape": number (0-10),
                "skin_tone": number (0-10),
                "body_fit": number (0-10),
                "hair_beard": number (0-10),
                "age": number (0-10),
                "overall_style": number (0-10)
              }}
            }}
            🔒 Rules:
            No text outside JSON
            No markdown
            No comments
            No missing fields
        """

# Formatting and Extracting the response
def extract_scores_and_features(response_text):
    """
    Extract key metrics from the LLM JSON response.
    """
    logging.info("Extracting scores and features from LLM JSON response")
    
    try:
        # Remove content between thinking tags if present
        cleaned_text = re.sub(r'<think>[\s\S]*?</think>', '', response_text, flags=re.DOTALL)
        cleaned_text = re.sub(r'<thinking>[\s\S]*?</thinking>', '', cleaned_text, flags=re.DOTALL)
        
        # Find the JSON block
        json_match = re.search(r'\{[\s\S]*\}', cleaned_text)
        if json_match:
            data = json.loads(json_match.group(0))
            logging.info("Successfully parsed LLM JSON response")
            return data
        else:
            logging.error("No JSON block found in LLM response")
            return None
    except Exception as e:
        logging.error(f"Error parsing LLM JSON: {str(e)}")
        return None

# The main execution of the application
def get_recom_desc(clothes, face, cloth_compare, max_retries=3):
    """
    Get clothing recommendations with retry logic for missing data.
    
    Args:
        clothes: Wardrobe items information
        face: User's facial features information
        cloth_compare: New clothing item to compare
        max_retries: Maximum number of retry attempts (default: 3)
    
    Returns:
        Dictionary containing recommendations, scores, and top outfits
    """
    logging.info("Loading the clothing descriptor part of application")
    # Setting up the basic requirements:
    config = load_yaml()
    api_key = config['Recommendation_Analyze']['api_key']
    prompt = load_prompt(clothes, face, cloth_compare)

    # NVIDIA API configuration
    invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json"
    }    retry_count = 0
    extracted_data = {}
    
    while retry_count < max_retries:
        try:
            # Prepare payload
            payload = {
                "model": config['Recommendation_Analyze']['model'],
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": config['Recommendation_Analyze']['max_tokens'],
                "temperature": config['Recommendation_Analyze']['temperature'],
                "top_p": config['Recommendation_Analyze']['top_p'],
                "frequency_penalty": config['Recommendation_Analyze']['frequency_penalty'],
                "presence_penalty": config['Recommendation_Analyze']['presence_penalty'],
                "stream": False
            }
 
            # Make API request
            logging.info("Sending request to NVIDIA API")
            response = requests.post(invoke_url, headers=headers, json=payload, timeout=60)
            
            # Check for errors
            response.raise_for_status()
            
            # Parse response
            result = response.json()
            raw_response = result['choices'][0]['message']['content']
            
            # Extract the JSON data
            extracted_data = extract_scores_and_features(raw_response)
            
            # Check if any critical data is missing
            if (extracted_data is None or 
                "overall_score" not in extracted_data or 
                "features" not in extracted_data):
                
                retry_count += 1
                logging.warning(f"Missing critical data in LLM JSON response. Retry attempt {retry_count}/{max_retries}")
                
                if retry_count >= max_retries:
                    logging.error("Max retries reached. Returning partial data.")
                    break
                    
                config['Recommendation_Analyze']['temperature'] += 0.05
                continue
            
            logging.info("The clothing descriptor is implemented successfully")
            return {
                "overall_score": extracted_data["overall_score"],
                "features": extracted_data["features"]
            }
            
        except Exception as e:
            retry_count += 1
            logging.error(f"Error during LLM processing: {str(e)}. Retry attempt {retry_count}/{max_retries}")
            
            if retry_count >= max_retries:
                logging.error("Max retries reached after exceptions. Raising error.")
                raise
    
    # If we get here after max retries, return whatever we have
    logging.warning("Returning results after max retries with missing data")
    return {
        "overall_score": extracted_data.get("overall_score", 0) if extracted_data else 0,
        "features": extracted_data.get("features", {}) if extracted_data else {}
    }

