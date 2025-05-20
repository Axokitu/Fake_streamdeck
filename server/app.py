from flask import Flask, request, jsonify, send_from_directory
import pyautogui
import os
import json

app = Flask(__name__, static_folder="static")

# Route pour servir l'interface tablette
@app.route('/')
@app.route('/interface')
def interface():
    return send_from_directory('static', 'interface.html')

# Route pour servir l'éditeur
@app.route('/editor')
def editor():
    return send_from_directory('static', 'editor.html')

# API pour recevoir les commandes de la tablette
@app.route('/api/command', methods=['POST'])
def handle_command():
    data = request.json
    action = data.get('action')
    
    print(action[0:3], action[4], len(action))
    
    if action[0:3] == "key" and len(action) == 5:
        pyautogui.press(action[4])
        print("Key",action[4], "pressed")
    elif action[0:3] == "key" and len(action) > 5:
        keys = action[4:].split('+')
        pyautogui.hotkey(*keys)
        print("Key",keys , "pressed")
    return jsonify({"status": "success"})

# Route pour charger le fichier JSON
@app.route('/config/interface_v1.json', methods=['GET'])
def get_config():
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'interface_v1.json')
    try:
        with open(config_path, 'r') as file:
            data = json.load(file)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route pour mettre à jour le fichier JSON
@app.route('/config/interface_v1.json', methods=['PUT'])
def update_config():
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'interface_v1.json')
    try:
        data = request.json
        with open(config_path, 'w') as file:
            json.dump(data, file, indent=2)
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory(os.path.join(app.static_folder, 'css'), filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(os.path.join(app.static_folder, 'js'), filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)