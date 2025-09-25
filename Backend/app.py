from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, User, Transaction, Goal
from auth import token_required
from datetime import datetime
import os