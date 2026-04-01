import yaml
import logging
import re
import requests

# Configure logging for the project
logging.basicConfig(
    format='[%(levelname)s] %(asctime)s - %(message)s',
    level=logging.INFO,
    handlers=[logging.StreamHandler()]
)

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
def load_prompt(cloths, face, outfit_selected, occasion):
    logging.info("Loading the prompt template for the analysis")
    return f"""
    You are a strict and precise AI fashion stylist trained to evaluate a new clothing item against a user's personal features and wardrobe. Only rate when meaningful. Penalize generously. Follow strict logic. Avoid high scores unless fully justified.
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
    Details: {face} 

    Clothing Comparison Target (New Item)
    Use all features of the selected clothing items including:
    Color
    Fit
    Design
    Occasion
    Texture
    Material
    Season to Wear
    Category (e.g., Outerwear, Top)
    Details: {outfit_selected} 

    Wardrobe Set:
    Only compare with same items (e.g., Top ↔ Top, Bottom ↔ Bottom), ignoring items of different class/type as the new clothing for better choices if present.
    Apply comparison in this priority:
    Class (Occasion Label)
    Color
    Season
    Design
    Material
    Fit
    Texture
    Details: {cloths}  

    Occasion: {occasion}
    Instructions:
    Temp Clothing Suitability (if applicable):
    - If an item's name contains '(TEMP)', it is temporary and must be rated separately. Ignore all other items in its category when evaluating temporary suitability.
    -Rate (0-10) how well the temporary item fits the outfit.
    -If no temp item exists for a category, then only suggest the best from the wardrobe.
    - After rating a temp item, EXCLUDE its entire category from subsequent suggestions

    Restrictions:
    -Never suggest swapping a temp item's category.
    -Use the same name to refer the clothing item in the report.
    -DO NOT use generic phrases like "looks good" or "fits well." or Any Heading other than the format.
    -All ratings must be justified. No blanks.
    -Use exact values and mappings from input only—do not invent new traits.
    -No need of other texts which would go against the format specified, and headings.
    -Do not specify itself for the top rated outfits at any case even if it is None.
    -No need of reasoning for the ratings.
    -NEVER list replacement options for categories containing temp items. Only suggest for non-temp categories.
    -When a temp item exists in a category, DO NOT list that category under "Improvements" at all
    -No scores in decimals. Use integers 0-10 only.
    -CRITICAL: NEVER suggest replacing an item with the exact same item the user is already wearing in the current outfit. Only suggest completely different items from the wardrobe.

    Suggestions:
    -Propose max 2 alternatives from each categories.
    -Prioritize fixes by severity.
    -CRITICAL HOLISTIC PAIRING: When suggesting a replacement for a category (like Bottom), the new item MUST harmoniously pair in color, style, and occasion with the *other existing untouched items* in the current outfit (like the Top).
    -COLOR CLASH PREVENTION: Absolutely forbid suggesting an item that creates a terrible color combination with the rest of the outfit (e.g., do not suggest an olive green bottom if the current top is purple). Only suggest complementary colors.

    Scoring Rubric Additions 
    - Fatal Flaws (0-3/10):   
        • Occasion conflict (e.g., jeans for black-tie)  
        • Season violation (e.g., wool coat in summer)  
    - Major Penalties (-3 each):   
        • Color clashes with skin tone  
        • Material contradicts body type (e.g., clingy fabric on overweight)  
    - Minor Penalties (-1 each):   
        • Texture dissonance (e.g., silk with denim)  

    Output Format
    Outfit Score: [X/10][Not to be in decimal]
    Temp Item Suitability Score [only if a TEMP clothing is present otherwise 0]: [X/10].

    Breakdown Overall Outfit: [X shouldn't be in decial]
    - Fit: [X/10]
    - Color: [X/10]
    - Occasion: [X/10]
    - Design: [X/10]
    - Material: [X/10]
    - Texture: [X/10]

    Improvements:
    Replace [Category]: [Suggest only for categories that need improvement to boost the score. Best 1-2 ALTERNATIVE wardrobe items names only. DO NOT suggest items currently being worn. No reasoning needed. If a category is performing poorly, ALWAYS suggest a replacement from the wardrobe.]
"""

# Formatting the response
def process_response(response_text):
    """
    Process the LLM response to:
    1. Remove content between thinking tags or before a closing thinking tag
    2. Clean up formatting for better readability
    """
    logging.info("Processing LLM response to remove thinking tags and clean formatting")
    
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
    
    # Remove markdown formatting symbols for cleaner output
    cleaned_text = cleaned_text.replace("##", "")
    cleaned_text = cleaned_text.replace("**", "")
    
    # Clean up extra whitespace and normalize line breaks
    cleaned_text = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned_text)  # Remove excessive line breaks
    cleaned_text = re.sub(r'[ \t]+', ' ', cleaned_text)  # Normalize spaces and tabs
    
    # Remove any remaining bracket formatting
    cleaned_text = re.sub(r'\[([^\]]+)\]', r'\1', cleaned_text)
    
    logging.info(f"Processed text length: {len(cleaned_text)}")
    
    return cleaned_text.strip()

# Extracting key metrics from the LLM response
def extract_key_metrics(response_text):
    """
    Extract specific metrics from the LLM response:
    1. Outfit Score (after "Outfit Score:")
    2. Temp Item Suitability Score (after "Temp Item Suitability Score:")
    3. Replace suggestions (after "Replace [Category]:")
    4. Breakdown scores (Color, Occasion, Design, etc.)
    
    Returns a dictionary with the extracted information.
    """
    logging.info("Extracting key metrics: Outfit Score, Temp Score, Replace suggestions, and Breakdown scores")
    
    # Initialize return values
    outfit_score = None
    temp_score = None
    replace_suggestions = {}
    breakdown_scores = {}
    
    # Extract outfit score - pattern: "Outfit Score: X/10" or "Outfit Score: X.X/10"
    outfit_score_match = re.search(r'Outfit Score\s*:\s*(\d+(?:\.\d+)?)/10', response_text)
    if outfit_score_match:
        outfit_score = float(outfit_score_match.group(1))
        logging.info(f"Extracted outfit score: {outfit_score}/10")
    
    # Extract temp item suitability score - pattern: "Temp Item Suitability Score (if any): X/10"
    temp_score_match = re.search(r'Temp Item Suitability.*?:\s*(\d+(?:\.\d+)?)/10', response_text)
    if temp_score_match:
        temp_score = float(temp_score_match.group(1))
        logging.info(f"Extracted temp score: {temp_score}/10")
    
    # Extract replace suggestions - pattern: "Replace [Category]: item1, item2"
    replace_matches = re.findall(r'Replace\s+([^:]+):\s*([^\n]+)', response_text)
    for category, items in replace_matches:
        category = category.strip()
        # Split items by comma and clean them up
        item_list = [item.strip() for item in items.split(',') if item.strip()]
        replace_suggestions[category] = item_list
        logging.info(f"Extracted replace suggestions for {category}: {item_list}")
    
    # Extract breakdown scores - patterns like "Color: 8/10", "Occasion: 10/10", "Design: 8/10"
    # Look for patterns in "Breakdown:" section or standalone
    breakdown_patterns = [
        r'Color\s*[:\(]\s*(\d+(?:\.\d+)?)/10',
        r'Occasion\s*[:\(]\s*(\d+(?:\.\d+)?)/10', 
        r'Design\s*[:\(]\s*(\d+(?:\.\d+)?)/10',
        r'Fit\s*[:\(]\s*(\d+(?:\.\d+)?)/10',
        r'Style\s*[:\(]\s*(\d+(?:\.\d+)?)/10',
        r'Material\s*[:\(]\s*(\d+(?:\.\d+)?)/10',
        r'Texture\s*[:\(]\s*(\d+(?:\.\d+)?)/10',
        r'Season\s*[:\(]\s*(\d+(?:\.\d+)?)/10',
        r'Overall\s*[:\(]\s*(\d+(?:\.\d+)?)/10'
    ]
    
    breakdown_categories = ['Color', 'Occasion', 'Design', 'Fit', 'Style', 'Material', 'Texture', 'Season', 'Overall']
    
    for i, pattern in enumerate(breakdown_patterns):
        matches = re.findall(pattern, response_text, re.IGNORECASE)
        if matches:
            category = breakdown_categories[i]
            score = float(matches[0])  # Take the first match
            breakdown_scores[category] = score
            logging.info(f"Extracted {category} score: {score}/10")
    
    # Alternative pattern matching for breakdown section
    # Look for "Breakdown:" followed by scores
    breakdown_section = re.search(r'Breakdown\s*:(.*?)(?:\n\n|\n[A-Z]|\Z)', response_text, re.DOTALL | re.IGNORECASE)
    if breakdown_section:
        breakdown_text = breakdown_section.group(1)
        
        # Extract individual scores from breakdown section
        score_matches = re.findall(r'(\w+)\s*[:\(]\s*(\d+(?:\.\d+)?)/10', breakdown_text, re.IGNORECASE)
        for category, score in score_matches:
            category_clean = category.strip().title()
            breakdown_scores[category_clean] = float(score)
            logging.info(f"Extracted {category_clean} score from breakdown: {score}/10")
    
    # Also look for dash-separated format: "- Color: 8/10"
    dash_scores = re.findall(r'-\s*(\w+)\s*:\s*(\d+(?:\.\d+)?)/10', response_text, re.IGNORECASE)
    for category, score in dash_scores:
        category_clean = category.strip().title()
        breakdown_scores[category_clean] = float(score)
        logging.info(f"Extracted {category_clean} score from dash format: {score}/10")
    
    return {
        "outfit_score": outfit_score,
        "temp_score": temp_score,
        "replace_suggestions": replace_suggestions,
        "breakdown_scores": breakdown_scores
    }

# The main execution of the application
def get_recom_desc(clothes, face, cloth_compare, occasion, max_retries=3):
    """
    Get clothing recommendations with retry logic for missing data.
    
    Args:
        clothes: Wardrobe items information
        face: User's facial features information
        cloth_compare: New clothing item to compare
        occasion: The occasion for the outfit
        max_retries: Maximum number of retry attempts (default: 3)
    
    Returns:
        Dictionary containing recommendations, outfit score, temp score, replace suggestions, and breakdown scores
    """
    logging.info("Loading the clothing descriptor part of application")
    
    # Setting up the basic requirements:
    config = load_yaml()
    api_key = config['Recommendation_Analyze']['api_key']
    prompt = load_prompt(clothes, face, cloth_compare, occasion)
    
    # NVIDIA API configuration
    invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json"
    }

    retry_count = 0
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
            
            # Sending the request to NVIDIA API
            logging.info("Sending request to NVIDIA API")
            response = requests.post(invoke_url, headers=headers, json=payload)
            
            # Check for errors
            response.raise_for_status()
            
            # Parse response
            result = response.json()
            raw_response = result['choices'][0]['message']['content']
            
            # Extract the key metrics
            key_metrics = extract_key_metrics(raw_response)
            
            # Process the response for display
            processed_response = process_response(raw_response)
            
            # Check if critical data is missing
            if key_metrics["outfit_score"] is None or key_metrics['breakdown_scores'] is None:
                retry_count += 1
                logging.warning(f"Missing outfit score in LLM response. Retry attempt {retry_count}/{max_retries}")
                
                if retry_count >= max_retries:
                    logging.error("Max retries reached. Returning partial data.")
                    break
                    
                config['Recommendation_Analyze']['temperature'] += 0.05
                continue
            
            logging.info("The clothing descriptor is implemented successfully")
            return {
                "recommendations": processed_response,
                "outfit_score": key_metrics["outfit_score"],
                "temp_score": key_metrics["temp_score"],
                "replace_suggestions": key_metrics["replace_suggestions"],
                "breakdown_scores": key_metrics["breakdown_scores"]
            }
            
        except requests.exceptions.RequestException as e:
            retry_count += 1
            logging.error(f"API request error: {str(e)}. Retry attempt {retry_count}/{max_retries}")
            
            if retry_count >= max_retries:
                logging.error("Max retries reached after exceptions. Raising error.")
                raise RuntimeError(f"Failed to get recommendations: {str(e)}")
                
        except Exception as e:
            retry_count += 1
            logging.error(f"Error during LLM processing: {str(e)}. Retry attempt {retry_count}/{max_retries}")
            
            if retry_count >= max_retries:
                logging.error("Max retries reached after exceptions. Raising error.")
                raise
    
    # If we get here after max retries, return whatever we have
    logging.warning("Returning results after max retries with missing data")
    return {
        "recommendations": processed_response if 'processed_response' in locals() else "Re-Generate",
        "outfit_score": key_metrics.get("outfit_score", "Re-Generate") if 'key_metrics' in locals() else "Re-Generate",
        "temp_score": key_metrics.get("temp_score", None) if 'key_metrics' in locals() else None,
        "replace_suggestions": key_metrics.get("replace_suggestions", {}) if 'key_metrics' in locals() else {},
        "breakdown_scores": key_metrics.get("breakdown_scores", {}) if 'key_metrics' in locals() else {}
    }

