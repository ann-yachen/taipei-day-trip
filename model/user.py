from config.config import CNX_POOL, JWT_KEY

from flask import make_response
from werkzeug.security import generate_password_hash, check_password_hash

from model.jwt import JWTAuthModel

class UserModel:
    def register(name, email, password):
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            cnxcursor.execute("SELECT email FROM user WHERE email=%s", (email, ))
            user = cnxcursor.fetchone()
            # Check if user exits
            if user:
                return {"error": True, "message": "註冊失敗，重複的 Email 或其他原因"}, 400
            else:
                hashed_password = generate_password_hash(password)
                cnxcursor.execute("INSERT INTO user(name, email, password) VALUE(%s, %s, %s)", (name, email, hashed_password))
                cnx.commit()              
                return {"ok": True}
        except:
            return {"error": True, "message": "伺服器內部錯誤"}, 500
        finally:
            cnxcursor.close()
            cnx.close()

class UserAuthModel:
    def get_user_by_token(token):
        if token:
            email = JWTAuthModel.decode(token)
            try:
                cnx = CNX_POOL.get_connection()
                cnxcursor = cnx.cursor(dictionary = True)
                cnxcursor.execute("SELECT id, name, email FROM user WHERE email=%s", (email, ))
                user = cnxcursor.fetchone()
                if user:
                    return {"data": user}, 200
                else:
                    return {"error": True, "message": "Email 不正確"}, 400
            except:
                return {"error": True, "message": "伺服器內部錯誤"}, 500
            finally:
                cnxcursor.close()
                cnx.close()
        else:
            return {"data": None}, 200

    def log_in(email, password):
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            cnxcursor.execute("SELECT email, password FROM user WHERE email=%s", (email, ))
            user = cnxcursor.fetchone()
            if user and check_password_hash(user["password"], password):
                token = JWTAuthModel.encode(user["email"])
                response = make_response({"ok": True}, 200)
                response.set_cookie("token", token, max_age = 604800)
                return response
            else:
                return {"error": True, "message": "登入失敗，帳號或密碼錯誤或其他原因"}, 400
        except:
            return {"error": True, "message": "伺服器內部錯誤"}, 500			
        finally:
            cnxcursor.close()
            cnx.close()

    def log_out():
        response = make_response({"ok": True})
        response.set_cookie("token", "", max_age = -1)
        return response

