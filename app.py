from flask import *
from api.attraction import attraction_blueprint
from api.user import user_blueprint

app = Flask(__name__, static_folder = "static", static_url_path = "/")
app.register_blueprint(attraction_blueprint, url_prefix = "/api/")
app.register_blueprint(user_blueprint, url_prefix = "/api/user")

app.config["JSON_AS_ASCII"] = False
app.config['JSON_SORT_KEYS'] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Pages
@app.route("/")
def index():
	return render_template("index.html")

@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")

@app.route("/booking")
def booking():
	return render_template("booking.html")

@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

if __name__ == "__main__":
	app.run(host = "0.0.0.0", port = 3000)