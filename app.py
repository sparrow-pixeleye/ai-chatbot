from flask import Flask, render_template, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

app = Flask(__name__)

# Load DialoGPT model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-small")
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-small")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get", methods=["POST"])
def get_response():
    user_message = request.json.get("message", "")
    if not user_message:
        return jsonify({"reply": "Say something!"})
    
    # Encode input and generate response
    input_ids = tokenizer.encode(user_message + tokenizer.eos_token, return_tensors="pt")
    chat_history_ids = model.generate(
        input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id
    )
    bot_reply = tokenizer.decode(chat_history_ids[:, input_ids.shape[-1]:][0], skip_special_tokens=True)
    
    return jsonify({"reply": bot_reply})

if __name__ == "__main__":
    app.run(debug=True)