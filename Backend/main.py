# Getting the needed files for the backend of the application:
from Processing_LLMs import Clothing_Descriptor
from Processing_LLMs import Facial_Descriptor
from Processing_LLMs import Recommendation_Analyzer
from Processing_LLMs import Outfit_Analyzer

# Getting the needed libraries for the backend of the application:
import logging
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(
    format='[%(levelname)s] %(asctime)s - %(message)s',
    level=logging.INFO,
    handlers=[logging.StreamHandler()]
)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = tempfile.gettempdir()
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # Increase to 100MB for high-res photos

@app.route('/', methods=['GET'])
def root():
    return jsonify({"status": "healthy", "service": "Almari Backend"}), 200

@app.route('/api/analyze-face', methods=['POST'])
def analyze_face():
    """
    Endpoint to analyze a face image
    Expects: image file in the request
    Returns: Face analysis results as text
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
    
    try:
        # Save the uploaded file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        logging.info(f"Image saved at {filepath}, analyzing face...")
        
        # Process the image using the Facial_Descriptor module
        face_analysis = Facial_Descriptor.get_cloths_desc(filepath)
        
        # Clean up the temporary file
        os.remove(filepath)

        # Clean the analysis results:
        face_analysis = face_analysis.replace("*","")
        
        return face_analysis, 200
    
    except Exception as e:
        error_msg = f"Error analyzing face: {str(e)}"
        logging.error(error_msg)
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-clothing', methods=['POST'])
def analyze_clothing():
    """
    Endpoint to analyze clothing images
    Expects: Multiple image files in the request
    Returns: Clothing analysis results in three formats
    """
    if 'images' not in request.files:
        return jsonify({'error': 'No images provided'}), 400
    
    files = request.files.getlist('images')
    if not files or files[0].filename == '':
        return jsonify({'error': 'No images selected'}), 400
    
    try:
        # Save all uploaded files temporarily
        filepaths = []
        for file in files:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            filepaths.append(filepath)
        
        logging.info(f"Images saved, analyzing clothing...")
        
        # Process the images using the Clothing_Descriptor module
        clothing_analysis_results = Clothing_Descriptor.get_cloths_desc(filepaths)
        
        # Clean up the temporary files
        for filepath in filepaths:
            os.remove(filepath)
        
        # Prepare the three different response formats
        descriptions_only = [item["description"] for item in clothing_analysis_results]
        labels_only = [item["label"] for item in clothing_analysis_results]
        
        response = {
            "descriptions": descriptions_only,  # Full descriptions
            "labels": labels_only,              # Just the labels
            "combined": clothing_analysis_results  # Combined format with both
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        logging.error(f"Error analyzing clothing: {str(e)}")
        return jsonify({'error': f'Failed to analyze clothing: {str(e)}'}), 500

@app.route('/api/get-recommendations', methods=['POST'])
def get_recommendations():
    """
    Endpoint to get clothing recommendations based on face and clothing analysis
    Expects: JSON with face and clothing analysis
    Returns: Recommendations as text
    """
    data = request.json
    if not data or 'face' not in data or 'clothing' not in data or 'cloth_compare' not in data:
        return jsonify({'error': 'Missing face or clothing analysis data'}), 400
    
    try:
        # Check if clothing data is in the new format or old format
        clothing_data = data['clothing']
        cloth_compare = data['cloth_compare']
        
        # If it's in the new combined format, extract just the descriptions
        if isinstance(clothing_data, list) and clothing_data and isinstance(clothing_data[0], dict) and "description" in clothing_data[0]:
            # Create a list of formatted strings that include both name and description
            formatted_clothing = [f"{item['name']}: {item['description']}" for item in clothing_data]
        else:
            # If it's already in a simple format, use as is
            formatted_clothing = clothing_data
        
        # Get recommendations using the Recommendation_Analyzer module
        recommendations = Recommendation_Analyzer.get_recom_desc(formatted_clothing, data['face'], data['cloth_compare'])
        return recommendations, 200
    
    except Exception as e:
        logging.error(f"Error getting recommendations: {str(e)}")
        return jsonify({'error': f'Failed to get recommendations: {str(e)}'}), 500

@app.route('/api/get-outfit-recommendations', methods=['POST'])
def get_outfit_recommendations():
    """
    Endpoint to get outfit recommendations based on face and clothing analysis
    Expects: JSON with face, clothing, selectedOutfit, and occasion data
    Returns: Outfit recommendations with scores and suggestions
    """
    try:
        data = request.json
        if not data or 'face' not in data or 'clothing' not in data or 'selectedOutfit' not in data or 'occasion' not in data:
            return jsonify({'error': 'Missing required data: face, clothing, selectedOutfit, or occasion'}), 400
        
        # Extract data from request
        face_data = data['face']
        clothing_data = data['clothing']
        selected_outfit = data['selectedOutfit']
        occasion = data['occasion']
        
        result = Outfit_Analyzer.get_recom_desc(
            clothes=clothing_data,
            face=face_data,
            cloth_compare=selected_outfit,
            occasion=occasion
        )
        
        # Return the structured response
        return jsonify({
            'success': True,
            'recommendations': result['recommendations'],
            'outfit_score': result['outfit_score'],
            'temp_score': result['temp_score'],
            'replace_suggestions': result['replace_suggestions'],
            'breakdown_scores': result['breakdown_scores'],
        }), 200
        
    except Exception as e:
        logging.error(f"Error in get_outfit_recommendations: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Run as Flask web server
    port = int(os.environ.get('PORT', 7860))
    app.run(host='0.0.0.0', port=port, debug=False)
