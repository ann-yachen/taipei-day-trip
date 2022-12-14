from flask import make_response

class Response:
    def error(result, message, code):
        response = {"error": True, "message": message}
        return make_response(response), code
