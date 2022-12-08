from flask import *
from model.user import UserModel, UserAuthModel

user_blueprint = Blueprint("user", __name__)

@user_blueprint.route("/", methods = ["POST"])
# Register
def user():
    name = request.json["name"]
    email = request.json["email"]
    password = request.json["password"]
    return UserModel.post(name, email, password)

@user_blueprint.route("/auth", methods = ["GET", "PUT", "DELETE"])
def user_auth():
    # Get user data by token verification
    if request.method == "GET":
        token = request.cookies.get("token")
        return UserAuthModel.get(token)
    
    # Log in
    if request.method == "PUT":
        email = request.json["email"]
        password = request.json["password"]
        return UserAuthModel.put(email, password)
    
    # Log out
    if request.method == "DELETE":
        return UserAuthModel.delete()

