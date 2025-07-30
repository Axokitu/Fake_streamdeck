# 🧰 Fake Streamdeck Web Interface

Ce repo contient une application web développée en Python, accessible sur le port `:5000`, servant d'interface Streamdeck simplifiée pour une tablette dédiée. Cela reprend les fonctionalité du streamdeck mais sur une tablette et en opensource

## 🌐 Fonctionnement général

- L'application est hébergée localement sur une machine, et est accessible via une tablette qui ne sert qu'à cela.
- Le serveur web s'exécute sur le port **5000**.
- Une interface de configuration est disponible sur `:5000/editor`.

## 🎛️ Éditeur de Macros

L'éditeur permet de :

- Créer et personnaliser des macros visuelles.
- Définir des actions associées à chaque macro.
- Les macros interagissent directement avec le serveur Python exécuté sur la même machine.

## 🚀 Technologies utilisées

- **Flask** pour le serveur web.
- **HTML/CSS/JavaScript** pour l'interface utilisateur.
- **Python** pour l'exécution des actions liées aux macros.

## 📦 Installation

```bash
git clone https://github.com/Axokitu/Fake_streamdeck.git
cd Fake_streamdeck
pip install -r requirements.txt
python app.py
```
Accédez ensuite à http://localhost:5000 depuis la tablette dédiée ou l'application grace a l'apk.

## 📱 Utilisation
- Interface principale : `http://localhost:5000`

- Éditeur de macros : `http://localhost:5000/editor`
