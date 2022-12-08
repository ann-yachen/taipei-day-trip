from flask import make_response, jsonify

class UserView:
    def ok():
        response = jsonify({"ok": True})
        return make_response(response)
                
    def error(result, message, code):
        response = jsonify({"error": True, "message": message})
        return make_response(response), code
