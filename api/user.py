from flask import Blueprint, request
from model.user import UserModel

import re # For input validation
# Regex for input validation
name_validate_pattern = re.compile(r"(.|\s)*\S(.|\s)*")
email_validate_pattern = re.compile(r"([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+")
password_validate_pattern = re.compile(r"^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$")

user_blueprint = Blueprint("user", __name__)

@user_blueprint.route("/", methods = ["POST"])
# Register
def user():
    name = request.json["name"]
    email = request.json["email"]
    password = request.json["password"]
    if re.fullmatch(name_validate_pattern, name) and re.fullmatch(email_validate_pattern, email) and re.fullmatch(password_validate_pattern, password):
        response = UserModel.register(name, email, password)
        return response
    else:
        return {"error": True, "message": "輸入格式不正確"}, 400

@user_blueprint.route("/auth", methods = ["GET", "PUT", "DELETE"])
def user_auth():
    # Get user data by token verification
    if request.method == "GET":
        token = request.cookies.get("token")
        response = UserModel.get_user_by_token(token)
        return response
    
    # Log in
    if request.method == "PUT":
        email = request.json["email"]
        password = request.json["password"]
        response = UserModel.log_in(email, password)
        return response
    
    # Log out
    if request.method == "DELETE":
        response = UserModel.log_out()
        return response