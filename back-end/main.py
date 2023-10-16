from fastapi import FastAPI, UploadFile, File
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import PyPDF2
import io
import nltk

# Initializing NLTK
nltk.download('punkt')
from nltk import sent_tokenize

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Specifying the Hugging Face model name and revision
model_name = "distilbert-base-uncased-finetuned-sst-2-english"
revision = "af0f99b"

# Load the sentiment analysis pipeline
classifier = pipeline("sentiment-analysis", model= model_name, revision= revision)

@app.post("/analyze-sentiment")
async def analyze_sentiment(sentence_input: str):
    # Perform sentiment analysis
    results = classifier(sentence_input)

    # Extract and return the label and score
    label = results[0]['label']
    score = results[0]['score']

    # Create a JSON response with sentiment information
    response_data = {
        "sentence": sentence_input,
        "sentiment": label,
        "score": score
    }

    return JSONResponse(content=response_data)

@app.post("/analyze-sentiment-for-pdf")
async def analyze_sentiment_for_pdf(file: UploadFile):
    # Read the content of the uploaded PDF file
    pdf_content = await file.read()

    # Extract text from the PDF
    sentences = extract_text_from_pdf(pdf_content)

    # Perform sentiment analysis on the extracted text
    results = []

    for sentence in sentences:
        sentiment_result = classifier(sentence)
        label = sentiment_result[0]['label']
        score = sentiment_result[0]['score']
        results.append({
            "sentence": sentence,
            "sentiment": label,
            "score": score
        })

    return JSONResponse(content=results)

def extract_text_from_pdf(pdf_content):
    # Create a PDFFileReader
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))

    # Initializing list to store sentences
    sentences = []

    # Loop through all the pages in the PDF
    for page in pdf_reader.pages:
        page_text = page.extract_text()
        page_sentences = sent_tokenize(page_text)
        sentences.extend(page_sentences)
    return sentences

