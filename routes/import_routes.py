from flask import Blueprint,request,jsonify
from services.csv_service import parse_csv
from services.bank_service import fetch_transactions
from services.normalization_service import normalize_transactions

import_bp = Blueprint("import",__name__)

@import_bp.route("/csv",methods=["POST"])
def import_csv():
    file = request.files.get("file")
    if not file:
        return jsonify({"error":"Brak pliku"}), 400
    transactions = parse_csv(file)
    normalized = normalize_transactions(transactions)
    return jsonify(normalized), 200

@import_bp.route("/bank", methods=["POST"])
def import_bank():
    data = request.json
    transactions =fetch_transactions(data)
    normalized = normalize_transactions(transactions)
    return jsonify(normalized), 200

@import_bp.route("/health",methods=["GET"])
def health():
    return {"status":"ok"}