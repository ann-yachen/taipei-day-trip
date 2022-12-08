from config.config import CNX_POOL, JWT_KEY

from flask import make_response, jsonify
import mysql.connector, mysql.connector.pooling
from werkzeug.security import generate_password_hash, check_password_hash
import jwt, datetime

class UserModel:
    def post(name, email, password):
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            cnxcursor.execute("SELECT email FROM member WHERE email=%s", (email,))
            user = cnxcursor.fetchone()
            if user:
                return jsonify({"error": True, "message": "註冊失敗，重複的 Email 或其他原因"}), 400
            else:
                hashed_password = generate_password_hash(password)
                cnxcursor.execute("INSERT INTO member(name, email, password) VALUE(%s, %s, %s)", (name, email, hashed_password))
                cnx.commit()
                return jsonify({"ok": True})
        except:
            return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
        finally:
            cnxcursor.close()
            cnx.close()

class UserAuthModel:
    def get(token):
        if token == None:
            return jsonify({"data": None}), 200
        else:
            decoded_token = jwt.decode(token, JWT_KEY, algorithms = "HS256")
            email = decoded_token["email"]
            try:
                cnx = CNX_POOL.get_connection()
                cnxcursor = cnx.cursor(dictionary = True)
                cnxcursor.execute("SELECT id, name, email FROM member WHERE email=%s", (email,))
                user = cnxcursor.fetchone()
                if user:
                    return jsonify({"data": user}), 200
            except:
                return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
            finally:
                cnxcursor.close()
                cnx.close()

    def put(email, password):
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            cnxcursor.execute("SELECT email, password FROM member WHERE email=%s", (email, ))
            user = cnxcursor.fetchone()
            if user and check_password_hash(user["password"], password):
                token = jwt.encode({"email": user["email"], "exp": datetime.datetime.utcnow() + datetime.timedelta(days = 7)}, JWT_KEY, algorithm = "HS256")
                response = make_response(jsonify({"ok": True}), 200)
                response.set_cookie("token", token, max_age = 604800)
                return response
            else:
                return jsonify({"error": True, "message": "登入失敗，帳號或密碼錯誤或其他原因"}), 400
        except:
            return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500			
        finally:
            cnxcursor.close()
            cnx.close()

    def delete():
        response = make_response(jsonify({"ok": True}))
        response.set_cookie("token", "", max_age = -1)
        return response

