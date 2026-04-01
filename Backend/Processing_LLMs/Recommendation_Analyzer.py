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
    logging.info("Loading the prompt template for the analysis")
    return f"""
            REVISED PROMPT TEMPLATE — AI Stylist Evaluation (Stable & Consistent)
            You are a strict and precise AI fashion stylist trained to evaluate a new clothing item against 
            a user's personal features and wardrobe. Your task is to produce a consistent, reasoned, and 
            comparative report.Only rate when meaningful. Penalize generously. Follow strict logic. Avoid high 
            scores unless fully justified. You are an unforgiving, hyper-precise AI fashion evaluator. 
            Your task is to ruthlessly assess the new clothing item against the user's features and wardrobe. No exceptions, no leniency.

            User Details
            Use the following face and body features for all personalization:
            Face Type
            Face Size
            Face Structure
            Skin Color
            Hair Density
            Beard Type
            Body Type
            Height & Weight (for fat%)
            Age
            Details: 
            {face}

            Clothing Comparison Target (New Item)
            Use all features of the new clothing item including:
            Occasion
            Color
            Fit
            Design
            Texture
            Material
            Season to Wear
            Category (e.g., Outerwear, Top)
            Details: {cloth_compare}

            Wardrobe Set:
            Only compare with different-category items (e.g., Top ↔ Bottom, Outerwear ↔ Bottom), ignoring items of same class/type as the new clothing.
            Apply comparison in this priority:
            Class (Occasion Label) and Color
            Season
            Design
            Material
            Fit
            Texture
            Details: {cloths}

            Additional Enforcements:
            -Use the same name to refer the clothing item in the report.
            -DO NOT use generic phrases like "looks good" or "fits well." or Any Heading other than the format.
            -All ratings must be justified. No blanks.
            -Use exact values and mappings from input only—do not invent new traits.
            -Do not compare within same clothing category, like no Top vs Top, Bottom vs Bottom, etc.
            -Add Shirts vs T-shirts as an exception.
            -No texts such as "This evaluation ensures the T-shirt fits well within the user's style and wardrobe, considering all aspects of their features and existing clothing."
            -No need of other texts which would go against the format specified, and headings.
            -Do not specify itself for the top rated outfits at any case even if it is None.
            -No need of reasoning for the ratings.
            -Be harsh in rating and keep more considerations for the occasion of wear.

            No such words and general comments other than the formatted output.
            Output Format (Mandatory) follow this at any cost:

            Wardrobe Comparison (Exclude Same Category and arrange in descending order of scores):
            [Wardrobe Item Name] - X/10
            Overall Wardrobe Matches - X/10

            Final Verdict:
            Overall Score : X/10
            Top Rated Outfits:[Wardrobe names only 5, descending order of scores. Don't display if the score is less than or equal to 5]
        """

# Formatting the response
def process_response(response_text):
    """
    Process the LLM response to:
    1. Remove content between thinking tags or before a closing thinking tag
    2. Format the output as proper markdown
    """
    logging.info("Processing LLM response to remove thinking tags and format as markdown")
    
    # Check if there's a </think> tag without an opening tag
    if '</think>' in response_text and '<think>' not in response_text:
        # Split by the closing tag and keep only what comes after
        cleaned_text = response_text.split('</think>', 1)[1]
    else:
        # Try to remove content between <think> and </think> tags
        cleaned_text = re.sub(r'<think>[\s\S]*?</think>', '', response_text, flags=re.DOTALL)
    
    # Also try to match potential variations of the thinking tags
    cleaned_text = re.sub(r'<thinks>[\s\S]*?</thinks>', '', cleaned_text, flags=re.DOTALL)
    cleaned_text = re.sub(r'<thinking>[\s\S]*?</thinking>', '', cleaned_text, flags=re.DOTALL)
    
    # Format section headers
    if "Features:" in cleaned_text:
        cleaned_text = cleaned_text.replace("Features:", "## Features:")
    
    if "Wardrobe Comparison" in cleaned_text:
        pattern = r"Wardrobe Comparison.*?:"
        matches = re.findall(pattern, cleaned_text)
        if matches:
            for match in matches:
                cleaned_text = cleaned_text.replace(match, "## Wardrobe Comparison:")
    
    if "Final Verdict:" in cleaned_text:
        cleaned_text = cleaned_text.replace("Final Verdict:", "## Final Verdict:")
    
    # Format ratings
    cleaned_text = re.sub(r'\((\d+)/10\)', r'(\1/10)', cleaned_text)
    
    # Format item names
    cleaned_text = re.sub(r'\[([^\]]+)\]', r'\1', cleaned_text)
    cleaned_text = re.sub(r'Top Rated Outfits:.*?(?=\n\n|\Z)', '', cleaned_text, flags=re.DOTALL)
    cleaned_text = cleaned_text.replace("##","")
    cleaned_text = cleaned_text.replace("**","")
    
    logging.info(f"Processed text length: {len(cleaned_text)}")
    
    return cleaned_text.strip()

# Extracting the scores and outfits
def extract_scores_and_outfits(response_text):
    """
    Extract key metrics from the LLM response:
    1. Overall Score (after "Overall Score:")
    2. Wardrobe Matches Score (after "Overall Wardrobe Matches:")
    3. Top Rated Outfits (after "Top Rated Outfits:" and split by commas)
    
    Returns a dictionary with the extracted information.
    """
    logging.info("Extracting scores and top outfits from LLM response")
    
    # Initialize return values
    overall_score = None
    wardrobe_score = None
    top_rated_outfits = []
    
    # Extract overall score - it appears after "Overall Score:"
    overall_score_match = re.search(r'Overall Score\s*:\s*\(?(\d+)(?:/10)?\)?', response_text)
    if overall_score_match:
        overall_score = int(overall_score_match.group(1))
        logging.info(f"Extracted overall score: {overall_score}/10")
    
    # Extract wardrobe matches score - it appears after "Overall Wardrobe Matches:"
    wardrobe_score_match = re.search(r'Overall Wardrobe Matches\s*[-:]?\s*\(?(\d+)(?:/10)?\)?', response_text)
    if wardrobe_score_match:
        wardrobe_score = int(wardrobe_score_match.group(1))
        logging.info(f"Extracted wardrobe matches score: {wardrobe_score}/10")
    
    # Extract top rated outfits
    top_outfits_section = re.search(r'Top Rated Outfits:(.*?)(?:\n\n|\Z)', response_text, re.DOTALL)
    if top_outfits_section:
        outfits_text = top_outfits_section.group(1).strip()
        if ',' in outfits_text:
            outfit_items = outfits_text.split(',')
        else:
            outfit_items = outfits_text.split('\n')
        
        for item in outfit_items:
            outfit_name = item.strip()
            if outfit_name:
                outfit_name = re.sub(r'^\d+\.\s*', '', outfit_name)
                outfit_name = re.sub(r'^\-\s*', '', outfit_name)
                outfit_name = outfit_name.strip()
                if outfit_name:
                    top_rated_outfits.append(outfit_name)
        
        logging.info(f"Extracted {len(top_rated_outfits)} top rated outfits")
    
    return {
        "overall_score": overall_score,
        "wardrobe_score": wardrobe_score,
        "top_rated_outfits": top_rated_outfits
    }

# The main execution of the application
def get_recom_desc(clothes, face, cloth_compare, max_retries=3):
    """
    Get clothing recommendations with retry logic for missing data.
    """
    logging.info("Loading the clothing descriptor part of application")
    config = load_yaml()
    api_key = config['Recommendation_Analyze']['api_key']
    prompt = load_prompt(clothes, face, cloth_compare)

    # NVIDIA API configuration
    invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json"
    }

    retry_count = 0
    extracted_data = {}
    processed_response = ""
    
    while retry_count < max_retries:
        try:
            # Prepare payload
            payload = {
                "model": config['Recommendation_Analyze']['model'],
                "messages": [{"role": "user", "content": prompt}],
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
            response.raise_for_status()
            result = response.json()
            raw_response = result['choices'][0]['message']['content']
            
            # Extract data and process response
            extracted_data = extract_scores_and_outfits(raw_response)
            processed_response = process_response(raw_response)
            
            # Check if any critical data is missing
            if (extracted_data["overall_score"] is None or 
                extracted_data["wardrobe_score"] is None or 
                extracted_data["top_rated_outfits"] == []):
                
                retry_count += 1
                logging.warning(f"Missing critical data. Retry attempt {retry_count}/{max_retries}")
                if retry_count < max_retries:
                    config['Recommendation_Analyze']['temperature'] += 0.05
                    continue
            
            # Clean outfits
            for i in range(len(extracted_data["top_rated_outfits"])):
                extracted_data["top_rated_outfits"][i] = extracted_data["top_rated_outfits"][i].replace("*", "")
                
            logging.info("The clothing descriptor is implemented successfully")
            return {
                "recommendations": processed_response,
                "overall_score": extracted_data["overall_score"],
                "wardrobe_score": extracted_data["wardrobe_score"],
                "top_rated_outfits": extracted_data["top_rated_outfits"]
            }
            
        except Exception as e:
            retry_count += 1
            logging.error(f"Error during LLM processing: {str(e)}. Retry attempt {retry_count}/{max_retries}")
            if retry_count >= max_retries:
                raise
    
    return {
        "recommendations": processed_response,
        "overall_score": extracted_data.get("overall_score", 0),
        "wardrobe_score": extracted_data.get("wardrobe_score", 0),
        "top_rated_outfits": extracted_data.get("top_rated_outfits", [])
    }

