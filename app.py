from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from transformers import pipeline
from flask_cors import CORS
# from googletrans import Translator
from translate import Translator

app = Flask(__name__)
CORS(app)  # Enable CORS for all origins
# translator = Translator()
translator = Translator(to_lang="ml")

@app.route('/')
def index():
    return 'Hello, World!'

@app.route('/summarize', methods=['POST'])
def summarize():
    video_url = request.json.get('videoUrl')

    if not video_url:
        return jsonify({'error': 'Invalid request. Missing video URL.'}), 400

    try:
        # Get YouTube video ID from the URL
        video_id = video_url.split('v=')[-1]

        # Retrieve the transcript for the YouTube video
        transcript = YouTubeTranscriptApi.get_transcript(video_id)

        # Extract the text from the transcript
        transcript_text = ' '.join([t['text'] for t in transcript])

        # Summarize the transcript using the transformers library
        summarizer = pipeline('summarization')
        summarized_text = summarizer(transcript_text, max_length=150, min_length=40, do_sample=False)[0]['summary_text']

        # Set the CORS headers explicitly
        response = jsonify({'summary': summarized_text})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')

        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/translate', methods=['POST'])
def translate():
    summary = request.json.get('summary')

    if not summary:
        return jsonify({'error': 'Invalid request. Missing summary to translate.'}), 400

    try:
        translated_summary = translator.translate(summary)

        print(translated_summary)
        # Set the CORS headers explicitly
        response = jsonify({'translatedText': translated_summary})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')

        print(response)

        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
