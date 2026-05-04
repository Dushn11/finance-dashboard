from flask import Blueprint,request,jsonify
from services.csv_service import parse_csv
from services.normalization_service import normalize_data
from clients.spring_client import send_to_spring

import_bp = Blueprint("import",__name__)

@import_bp.route("/csv", methods=["POST"])
def import_csv():
    file = request.files.get("file")

    if not file:
        return jsonify({"error": "Brak pliku"}), 400

    transactions = parse_csv(file)
    normalized = normalize_data(transactions)

    spring_response = send_to_spring(normalized)

    return jsonify({
        "flask_processed": len(normalized),
        "spring_response": spring_response
    }), 200

@import_bp.route('/pdf',methods=["POST"])
def import_pdf():
    file = request.files.get("file")

@import_bp.route("/health",methods=["GET"])
def health():
    return {"status":"ok"}