from flask_login import LoginManager, UserMixin, \
    login_required, login_user, logout_user
from flask import *
from config import *
from db import *
from random import *
import string
from flask_cors import cross_origin
from utils import hash_password, verify_password, dotdict
from bson import ObjectId

# silly user model
class User(UserMixin):
    def __init__(self, u):
        self.u = dotdict(u)

    def __repr__(self):
        return "%s" % (self.user._id)

    def get_id(self):
        return self.u._id;


class MyLoginManager():
    def __init__(self, app, db, eng, users):
        self.db = db
        self.eng = eng
        self.users = users
        self.login_manager = LoginManager()
        self.login_manager.init_app(app)
        self.login_manager.login_view = "login"
        self.login_manager.user_loader(self.load_user)
        app.route('/login', methods=['GET','POST'])(self.login)
        app.route('/new_user', methods=['GET', 'POST'])(self.new_user)
        app.route('/logout', methods=['POST'])(self.logout)


    @cross_origin(supports_credentials=True)
    def login(self):
        if request.method == 'POST':
            req = request.get_json(force=True)
            email = req['email']
            password = req['password']

            r = dotdict(self.users.find_one({'email': email}))
            if not r is None:
                # user exists
                if verify_password(r.password, password):
                    user = User(r)
                    login_user(user)
                    return jsonify({'name': r['name'], 'email': r['email']}), 200
                else:
                    return jsonify({"status":"wrong password"}), 400
            else:
                # user doesn't exist
                return jsonify({"status":"no user"}), 404
        else:
            return jsonify({"status":"need to login"}), 401


    @cross_origin(supports_credentials=True)
    def new_user(self):
        req = request.get_json(force=True)
        email = req['email']
        name = req['name']
        password = req['password']

        #check whether user exists
        r = self.users.find_one({'email': email})

        if not r is None:
            r = dotdict(r)
            if verify_password(r.password, password):  # existing user with correct password tried to register
                user = User(r)
                login_user(user)
                return jsonify(r), 200
            else:
                return jsonify({"status": "Email already exists"}), 400

        ret = self.users.update({'email': email}, {'email': email, 'name': name, 'password': hash_password(password)},
                          upsert=True)
        r = dotdict(self.users.find_one({'email': email}))
        user = User(r)
        login_user(user)
        return jsonify(r), 200


    def load_user(self, userid):
        r = self.users.find_one({'_id': ObjectId(userid)})
        return User(r)


    @cross_origin(supports_credentials=True)
    def login_sql(self):
        if request.method == 'POST':
            req = request.get_json(force=True)
            email = req['email']
            password = req['password']

            r = self.eng.execute("SELECT * FROM users WHERE email='{}'"
                                 .format(email)).first()
            if not r is None:
                # user exists
                if verify_password(r.password, password):
                    user = User(r.id, r.email)
                    login_user(user)
                    return jsonify({"status":"ok","email":r.email}), 200
                else:
                    return jsonify({"status":"wrong password"}), 400
            else:
                # user doesn't exist
                return jsonify({"status":"no user"}), 404
        else:
            return jsonify({"status":"need to login"}), 401


    @cross_origin(supports_credentials=True)
    def new_user_sql(self):
        req = request.get_json(force=True)
        email = req['email']
        password = req['password']

        #check whether user exists
        r = self.eng.execute("SELECT * FROM users WHERE email='{}'".format(email)).first()

        if not r is None:
            if verify_password(r.password, password):  # existing user with correct password tried to register
                user = User(r.id, email)
                login_user(user)
                return jsonify({"status": "user logged", "email": email}), 200
            else:
                return jsonify({"status":"Email already exists"}), 400

        self.db.users.insert().values(email=email, password=hash_password(password)).execute()
        r = self.eng.execute("SELECT * FROM users WHERE email='{}'".format(email)).first()
        if r is None:
            #must not be
            return jsonify({"status": "unexpected error during registration", "email": email}), 500
        else:
            user = User(r.id, email)
            login_user(user)
            return jsonify({"status":"user registered","email":email}), 200

    @login_required
    @cross_origin(supports_credentials=True)
    def logout(self):
        logout_user()
        return jsonify({"status":"user logged out"}), 200

    # callback to reload the user object
    def load_user_sql(self, userid):
        r = select([self.db.users]).where(self.db.users.c.id == userid).execute().fetchone()
        return User(r.id, r.email)

