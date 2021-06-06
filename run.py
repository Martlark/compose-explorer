# run.py

from app import create_app

# ======================================
# debug start location
# ======================================

if __name__ == "__main__":
    app = create_app()
    app.debug = True
    app.config["SECRET_KEY"] = "blah"
    app.run(host="127.0.0.1", port=5025, threaded=True)
