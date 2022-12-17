from flask import Blueprint, request
from model.user import UserModel, UserAuthModel

user_blueprint = Blueprint("user", __name__)

@user_blueprint.route("/", methods = ["POST"])
# Register
def user():
    name = request.json["name"]
    email = request.json["email"]
    password = request.json["password"]
    response = UserModel.register(name, email, password)
    return response

@user_blueprint.route("/auth", methods = ["GET", "PUT", "DELETE"])
def user_auth():
    # Get user data by token verification
    if request.method == "GET":
        token = request.cookies.get("token")
        response = UserAuthModel.get_user_by_token(token)
        return response
    
    # Log in
    if request.method == "PUT":
        email = request.json["email"]
        password = request.json["password"]
        response = UserAuthModel.log_in(email, password)
        return response
    
    # Log out
    if request.method == "DELETE":
        response = UserAuthModel.log_out()
        return response