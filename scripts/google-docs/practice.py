import json
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Environment variables
SERVICE_ACCOUNT_FILE = os.getenv('SERVICE_ACCOUNT_FILE', '../../credentials/doc_reader_service_account.json')
GOOGLE_SCOPES = [os.getenv('GOOGLE_SCOPES', 'https://www.googleapis.com/auth/documents.readonly')]

def get_google_credentials():   
    """Get Google credentials from environment or file"""
    service_account_json = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')
    if service_account_json:
        print("Using Google credentials from environment variable (PRODUCTION)")
        try:
            service_account_info = json.loads(service_account_json)
            return service_account.Credentials.from_service_account_info(service_account_info, scopes=GOOGLE_SCOPES)
        except json.JSONDecodeError as e:
            print(f"Error parsing Google credentials JSON: {e}")
            raise
    else:
        print("Using Google credentials from file (DEVELOPMENT)")
        if not os.path.exists(SERVICE_ACCOUNT_FILE):
            raise FileNotFoundError(f"Service account file not found: {SERVICE_ACCOUNT_FILE}")
        return service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE,
            scopes=GOOGLE_SCOPES
        )
            
def get_docs_service():
    """Create Google Docs service"""
    try:
        creds = get_google_credentials()
        return build('docs', 'v1', credentials=creds)
    except Exception as e:
        print(f"Error creating Google Docs service: {e}")
        raise

def add_current_and_child_tabs(tab, all_tabs):
  """Adds the provided tab to the list of all tabs, and recurses through and
  adds all child tabs.

  Args:
      tab: a Tab from a Google Doc.
      all_tabs: a list of all tabs in the document.
  """
  all_tabs.append(tab)

  # ✅ Fixed: Use different variable name and handle None case
  child_tabs = tab.get('childTabs', [])
  for child_tab in child_tabs:
    add_current_and_child_tabs(child_tab, all_tabs)
  


def get_all_tabs(doc):
  """Returns a flat list of all tabs in the document in the order they would
  appear in the UI (top-down ordering). Includes all child tabs.

  Args:
      doc: a document.
  """
  all_tabs = []
  # Iterate over all tabs and recursively add any child tabs to generate a
  # flat list of Tabs.
  for tab in doc.get('tabs', []):  # ✅ Added default empty list
    add_current_and_child_tabs(tab, all_tabs)
  return all_tabs


def read_paragraph_element(element):
  """Returns the text in the given ParagraphElement.

  Args:
      element: a ParagraphElement from a Google Doc.
  """
  text_run = element.get('textRun')
  if not text_run:
    return ''
  return text_run.get('content')


def read_structural_elements(elements):
  """Recurses through a list of Structural Elements to read a document's text
  where text may be in nested elements.

  Args:
      elements: a list of Structural Elements.
  """
  text = ''
  for value in elements:
    if 'paragraph' in value:
      elements = value.get('paragraph').get('elements')
      for elem in elements:
        text += read_paragraph_element(elem)
    elif 'table' in value:
      # The text in table cells are in nested Structural Elements and tables may
      # be nested.
      table = value.get('table')
      for row in table.get('tableRows'):
        cells = row.get('tableCells')
        for cell in cells:
          text += read_structural_elements(cell.get('content'))
    elif 'tableOfContents' in value:
      # The text in the TOC is also in a Structural Element.
      toc = value.get('tableOfContents')
      text += read_structural_elements(toc.get('content'))
  return text


def main():
    """Uses the Docs API to print out the text of a document."""

    docs_service = get_docs_service()
    # Fetch the document with all of the tabs populated, including any nested
    # child tabs.
    doc = (
        docs_service.documents()
        .get(documentId="1Mg9SLeTEKmb2IkhGc0h9yyGMkyN7GXKdQWvM0IOZbcU", includeTabsContent=True)  # ✅ Fixed parameter name
        .execute()
    )
    all_tabs = get_all_tabs(doc)

    # Print the text from each tab in the document.
    for tab in all_tabs:
        # Get the DocumentTab from the generic Tab.
        document_tab = tab.get('documentTab')
        # print(document_tab)
        if document_tab:  # ✅ Added safety check
            doc_content = document_tab.get('body', {}).get('content', [])
            print(read_structural_elements(doc_content))


if __name__ == '__main__':
  main()