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
            data['timeout'] = 90000
            return data
    except Exception as e:
        return {
            'Clothing_Desc': {'api_key': env_api_key, 'model': 'meta/llama-3.2-90b-vision-instruct', 'max_tokens': 1024, 'temperature': 0.20, 'top_p': 0.70, 'frequency_penalty': 0, 'presence_penalty': 0},
            'Face_Desc': {'api_key': env_api_key, 'model': 'meta/llama-3.2-90b-vision-instruct', 'max_tokens': 1024, 'temperature': 0.20, 'top_p': 0.70},
            'Recommendation_Analyze': {'api_key': env_api_key, 'model': 'meta/llama-3.1-405b-instruct', 'max_tokens': 1024, 'temperature': 0.20, 'top_p': 0.70, 'frequency_penalty': 0, 'presence_penalty': 0},
            'timeout': 90000
        }

# Loading the prompt template
def load_prompt(clothes, face, cloth_compare):
    logging.info("Loading the prompt template for the analysis")
    
    # Identify the current item to avoid self-recommendation
    current_item_name = "Unknown"
    current_item_category = "Unknown"
    
    try:
        if isinstance(cloth_compare, str):
            # Try to find Name: and Category: in the string
            name_match = re.search(r"Name:\s*([^\n]+)", cloth_compare)
            if name_match: current_item_name = name_match.group(1).strip()
            
            cat_match = re.search(r"Category:\s*([^\n]+)", cloth_compare)
            if cat_match: current_item_category = cat_match.group(1).strip()
    except:
        pass

    return f"""
            REVISED PROMPT TEMPLATE — AI Stylist Evaluation (Stable & Consistent)
            You are a strict and precise AI fashion stylist. Your task is to evaluate a NEW clothing item against 
            a user's personal features and wardrobe and provide specific, CATEGORIZED replacement suggestions.

            CRITICAL SAFETY RULE:
            - NEVER suggest the item named "{current_item_name}". It is already being worn/analyzed.
            - "Replace Top" MUST only contain items that are explicitly categorized as Tops, Shirts, T-shirts, or Jackets.
            - "Replace Bottom" MUST only contain items that are explicitly categorized as Bottoms, Pants, Trousers, or Jeans.

            User Details
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
            Details: {clothes}

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
            
            Features:
            • Face Shape Suitability - X/10
            • Complexion Matching - X/10
            • Body Type Fit - X/10
            • Beard & Hair Compatibility - X/10
            • Age Appropriateness - X/10
            • Overall Suitability - X/10

            Wardrobe Comparison (Ranked by Compatibility):
            • [Item Name] - X/10
            
            Overall Wardrobe Matches - X/10

            Final Verdict:
            Overall Score : X/10
            
            Note: Do NOT include "Replace Top" or "Replace Bottom" sections in this text report. 
            They must only be returned in the JSON improvements field.
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
    # Clean up formatting for UI display
    cleaned_text = cleaned_text.replace("##","").replace("**","")
    
    # Remove any stray "Replace Top" or "Replace Bottom" sections from the text 
    # if the AI ignores instructions, to keep the UI clean.
    cleaned_text = re.sub(r'(?i)Replace Top:[\s\S]*?(?=\n\n|\Z)', '', cleaned_text)
    cleaned_text = re.sub(r'(?i)Replace Bottom:[\s\S]*?(?=\n\n|\Z)', '', cleaned_text)
    
    logging.info(f"Processed text length: {len(cleaned_text)}")
    return cleaned_text.strip()

# Extracting the scores for the UI
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
    improvements = {"replace_top": [], "replace_bottom": []}
    
    # Extract overall score - it appears after "Overall Score:"
    # Pattern: "Overall Score: (X/10)" or "Overall Score : (X/10)"
    overall_score_match = re.search(r'Overall Score\s*:\s*\(?(\d+)(?:/10)?\)?', response_text)
    if overall_score_match:
        overall_score = int(overall_score_match.group(1))
        logging.info(f"Extracted overall score: {overall_score}/10")
    
    # Extract wardrobe matches score - it appears after "Overall Wardrobe Matches:"
    # Pattern: "Overall Wardrobe Matches: (X/10)" or "Overall Wardrobe Matches - (X/10)"
    wardrobe_score_match = re.search(r'Overall Wardrobe Matches\s*[-:]?\s*\(?(\d+)(?:/10)?\)?', response_text)
    if wardrobe_score_match:
        wardrobe_score = int(wardrobe_score_match.group(1))
        logging.info(f"Extracted wardrobe matches score: {wardrobe_score}/10")
    
    # Extract top rated outfits - appears after "Top Rated Outfits:" line
    # and items may be separated by commas
    top_outfits_section = re.search(r'Top Rated Outfits:(.*?)(?:\n\n|\Z)', response_text, re.DOTALL)
    if top_outfits_section:
        outfits_text = top_outfits_section.group(1).strip()
        
        # First try splitting by commas if they exist
        if ',' in outfits_text:
            outfit_items = outfits_text.split(',')
        else:
            # Otherwise split by newlines
            outfit_items = outfits_text.split('\n')
        
        for item in outfit_items:
            # Clean up the item
            outfit_name = item.strip()
            if outfit_name:
                # Remove any numbering, bullets, or other formatting
                outfit_name = re.sub(r'^\d+\.\s*', '', outfit_name)
                outfit_name = re.sub(r'^\-\s*', '', outfit_name)
                outfit_name = outfit_name.strip()
                if outfit_name:
                    top_rated_outfits.append(outfit_name)
        
    logging.info(f"Extracted {len(top_rated_outfits)} top rated outfits")

    # Extract Improvements (Replace Top/Bottom)
    try:
        # Match "Replace Top: Name1, Name2" or "Replace Top: Name1"
        top_match = re.search(r"Replace Top:\s*([^\n]+)", response_text)
        if top_match:
            tops = [t.strip().replace("*", "") for t in top_match.group(1).split(",") if t.strip()]
            improvements["replace_top"] = tops[:2] 

        bottom_match = re.search(r"Replace Bottom:\s*([^\n]+)", response_text)
        if bottom_match:
            bottoms = [b.strip().replace("*", "") for b in bottom_match.group(1).split(",") if b.strip()]
            improvements["replace_bottom"] = bottoms[:2]
    except:
        pass
    
    return {
        "overall_score": overall_score,
        "wardrobe_score": wardrobe_score,
        "top_rated_outfits": top_rated_outfits,
        "improvements": improvements
    }

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
    }

    retry_count = 0
    extracted_data = {}
    processed_response = ""
    
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
            
            # First extract the data before processing the response
            extracted_data = extract_scores_and_outfits(raw_response)
            
            # Then process the response (which will remove the top-rated outfits section)
            processed_response = process_response(raw_response)
            
            # Check if any critical data is missing
            if (extracted_data["overall_score"] is None or 
                extracted_data["wardrobe_score"] is None or 
                extracted_data["top_rated_outfits"] == []):
                
                retry_count += 1
                logging.warning(f"Missing critical data in LLM response. Retry attempt {retry_count}/{max_retries}")
                
                # If we've reached max retries, use whatever we have
                if retry_count >= max_retries:
                    logging.error("Max retries reached. Returning partial data.")
                    break
                    
                # Adjust temperature slightly to get different results on retry
                config['Recommendation_Analyze']['temperature'] += 0.05
                continue
            
            # If we get here, we have all the data we need
            for i in range(len(extracted_data["top_rated_outfits"])):
                extracted_data["top_rated_outfits"][i] = extracted_data["top_rated_outfits"][i].replace("*", "")
                
            logging.info("The clothing descriptor is implemented successfully")
            return {
                "recommendations": processed_response,
                "overall_score": extracted_data["overall_score"],
                "wardrobe_score": extracted_data["wardrobe_score"],
                "top_rated_outfits": extracted_data["top_rated_outfits"],
                "improvements": extracted_data["improvements"]
            }
            
        except Exception as e:
            retry_count += 1
            logging.error(f"Error during LLM processing: {str(e)}. Retry attempt {retry_count}/{max_retries}")
            
            if retry_count >= max_retries:
                logging.error("Max retries reached after exceptions. Returning fallback data.")
                break
    
    # If we get here after max retries, return whatever we have
    logging.warning("Returning results after max retries with missing data")
    return {
        "recommendations": processed_response,
        "overall_score": extracted_data.get("overall_score", 0),
        "wardrobe_score": extracted_data.get("wardrobe_score", 0),
        "top_rated_outfits": extracted_data.get("top_rated_outfits", []),
        "improvements": extracted_data.get("improvements", {"replace_top": [], "replace_bottom": []})
    }

