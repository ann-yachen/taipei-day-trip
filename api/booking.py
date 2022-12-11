from flask import Blueprint, request

booking_blueprint = Blueprint("booking", __name__)

@booking_blueprint("/", methods = ["GET", "POST", "DELETE"])
def booking():
    if request.method == "GET":
        pass

    if request.method == "POST":
        pass
    
    if request.method == "DELETE":
        pass