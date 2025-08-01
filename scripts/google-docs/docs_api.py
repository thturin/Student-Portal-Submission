from flask import Flask, request, jsonify
from google.oauth2 import service_account
from googleapiclient.discovery import build
import os

app = Flask(__name__)

#DOCUMENT_ID = '1NI0OBTvsB7bKvhDQkhIXfafJti7NGAUPe2_0LqFascs' #NOT FILLED 
#DOCUMENT_ID = '1Lrkv6H8iIfeZp9xUam-NdbsRvwemYn7uWvT_jlyVVHY' ##FILLED
#DOCUMENT_ID = '1VN3_lex9-c6_x99QvaeeUVs_Rfh4hDNTeQpjL7EcQlI' #NOT FILLED U1l1
SERVICE_ACCOUNT_FILE = '../../credentials/doc_reader_service_account.json'
SCOPES = ['https://www.googleapis.com/auth/documents.readonly']


print("Looking for service account file at:", os.path.abspath(SERVICE_ACCOUNT_FILE))

# Add this test route before your existing route
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

        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES
        )
        
        docs_service = build('docs', 'v1', credentials=creds)
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

    
@app.route('/check-doc',methods=['POST'])
def check_document():
    try:
        #GOOGLE DOC
        data = request.get_json()
        document_id = data.get('documentId')
        assignment_name = data.get('assignmentName')
        
        if not document_id:
            return jsonify({'error':'Document ID is required'})
        
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES
            )

        docs_service = build('docs', 'v1', credentials=creds)
        doc = docs_service.documents().get(documentId=document_id).execute()




        #DETERMINE IF DOCUMENT WAS FILLED 
        # Extract all text
        full_text = ""
        for element in doc.get('body', {}).get('content', []):
            full_text += extract_text(element)

        # print("Full document text:")
        # print(full_text)
        # print("\n" + "="*50 + "\n")

        # Define placeholders
        placeholders = [
            "[Your Answer Here]",
            "[Enter your response]",
            "[Paste your code here]",
            "[Your Name Here]",
        ]

        # Simple check: if any placeholder exists in the full text
        filled = not any(placeholder in full_text for placeholder in placeholders)

        print("Filled" if filled else "Not Filled")
        
        # Initialize found_placeholders
        found_placeholders = []
        # Optional: Show which placeholders were found
        if not filled:
            found_placeholders = [p for p in placeholders if p in full_text]
            print(f"Found placeholders: {found_placeholders}")
        
        return jsonify({
            'filled': filled,
            'status': 'Filled' if filled else 'Not Filled',
            'foundPlaceholders': found_placeholders,
            'documentId': document_id
        })
        
    except Exception as e:
        return jsonify({'error':str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
    
    