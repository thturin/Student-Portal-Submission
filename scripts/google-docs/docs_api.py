import json
from flask import Flask, request, jsonify
from google.oauth2 import service_account
from googleapiclient.discovery import build
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Environment variables
#SERVICE_ACCOUNT_FILE = os.getenv('SERVICE_ACCOUNT_FILE', '../../credentials/doc_reader_service_account.json')
GOOGLE_SCOPES = [os.getenv('GOOGLE_SCOPES')]

#print("Looking for service account file at:", os.path.abspath(SERVICE_ACCOUNT_FILE))

#GOOGLE_SERVICE_ACCOUNT_JSON -> VARIABLE ON RAILWAY
#SERVICE_ACCOUNT_JSON -> LOCAL ENVIRONMENT VARIABLE
def get_google_credentials():   
    #try to extract railway environment variable first 
    service_account_json = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')
    if service_account_json: #if it exists 
        print("Using google credentials from environment variable PRODUCTION")
        try:
            service_account_info = json.loads(service_account_json)
            return service_account.Credentials.from_service_account_info(service_account_info, scopes=GOOGLE_SCOPES)
        except json.JSONDecodeError as e:
            print(f"Error parsing Google credentials JSON: {e}")
            raise
    else:
        print("Using google crednetials from file (development)")
        SERVICE_ACCOUNT_FILE=os.getenv('SERVICE_ACCOUNT_FILE')
        if not os.path.exists(SERVICE_ACCOUNT_FILE):
            raise FileNotFoundError(f"Service account file not found: {SERVICE_ACCOUNT_FILE}")
        return service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE,
            scopes=GOOGLE_SCOPES
        )
            
def get_docs_service():
    try:
        creds = get_google_credentials()
        return build('docs','v1', credentials=creds)
    except Exception as e:
        print(f"Error creating Google Docs service: {e}")
        raise

# Test route
@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Flask is working!'})

def extract_text(element):
    """Recursively extract all text from any document element"""
    text = ""
    
    if 'paragraph' in element:
        for el in element['paragraph'].get('elements', []):
            if 'textRun' in el:
                text += el['textRun'].get('content', '')
    
    elif 'table' in element:
        for row in element['table'].get('tableRows', []):
            for cell in row.get('tableCells', []):
                for content in cell.get('content', []):
                    text += extract_text(content)
    
    elif 'tableOfContents' in element:
        for content in element['tableOfContents'].get('content', []):
            text += extract_text(content)
    
    return text

@app.route('/check-doc-title', methods=['GET'])
def check_doc_title():
    try:
        document_id = request.args.get('documentId')
        assignment_name = request.args.get('assignmentName')

        if not document_id or not assignment_name:
            return jsonify({'error': 'Document ID and assignment name are required'}), 400

        docs_service = get_docs_service()
        doc = docs_service.documents().get(documentId=document_id).execute()
        doc_title = doc.get('title', '')
        
        def normalize_text(text):
            return ''.join(text.lower().split()) #remove spaces
        
        print(normalize_text(doc_title.lower()))
        doc_title = normalize_text(doc_title.lower())
        assignment_name = normalize_text(assignment_name.lower())[:4]
        is_correct_doc = assignment_name in doc_title
        return jsonify({
            'docTitle': doc_title,
            'isCorrectDoc': is_correct_doc
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/check-doc', methods=['POST'])
def check_document():
    try:
        data = request.get_json()
        document_id = data.get('documentId')
        
        if not document_id:
            return jsonify({'error': 'Document ID is required'}), 400
        
        docs_service = get_docs_service()
        doc = docs_service.documents().get(documentId=document_id).execute()

        # Extract all text
        full_text = ""
        for element in doc.get('body', {}).get('content', []):
            full_text += extract_text(element)

        # Define placeholders
        placeholders = [
            "[Your Answer Here]",
            "[Enter your response]", 
            "[Paste your code here]",
            "[Your Name Here]",
        ]

        # Check if any placeholder exists
        filled = not any(placeholder in full_text for placeholder in placeholders)
        found_placeholders = [p for p in placeholders if p in full_text] if not filled else []

        print("Document Analysis:")
        print(f"  Filled: {filled}")
        print(f"  Found placeholders: {found_placeholders}")
        
        return jsonify({
            'filled': filled,
            'status': 'Filled' if filled else 'Not Filled',
            'foundPlaceholders': found_placeholders,
            'documentId': document_id
        })
        
    except Exception as e:
        print(f"Error checking document: {e}")
        return jsonify({'error': str(e)}), 500

if os.getenv('FLASK_ENV')=='development':
    if __name__ == '__main__':
        
        port = int(os.getenv('FLASK_PORT', 5001))
        debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
        
        print(f"Starting Flask app with waitress on port {port}")
        print(f"Debug mode: {debug}")
        print(f"Environment: {os.environ.get('FLASK_ENV', 'development')}")
        
        app.run(
            debug=debug,
            port=port,
            host='0.0.0.0'  # Allow external connections for deployment
        )

