from flask import Blueprint,request,jsonify
from services.csv_service import parse_csv
from services.normalization_service import normalize_data

import_bp = Blueprint("import",__name__)

@import_bp.route("/csv",methods=["POST"])
def import_csv():
    file = request.files.get("file")
    if not file:
        return jsonify({"error":"Brak pliku"}), 400
    transactions = parse_csv(file)
    normalized = normalize_data(transactions)
    return jsonify(normalized), 200

@import_bp.route("/health",methods=["GET"])
def health():
    return {"status":"ok"}