from flask import Blueprint, request, jsonify
import json
from services.csv_service import parse_csv
from services.normalization_service import normalize_data

import_bp = Blueprint("import",__name__)

@import_bp.route("/csv", methods=["POST"])
def import_csv():
    file = request.files.get("file")

    if not file:
        return jsonify({"error": "Brak pliku"}), 400

    mapping_raw = request.form.get("columnMapping", "{}")
    separator = request.form.get("separator", ",")
    skip_rows = int(request.form.get("skipRows", 0))
    tab_id = request.form.get("tab_Id")
    tab_name = request.form.get("tab_Name")


    try:
        mapping = json.loads(mapping_raw)
    except Exception:
        return jsonify({"error": "Nieprawidłowy columnMapping"}), 400

    rows = parse_csv(
        file,
        separator=separator,
        skip_rows=skip_rows
    )

    normalized = normalize_data(rows, mapping)
    print("Success")
    return jsonify({
    "tabId": tab_id,
    "tabName": tab_name,
    "transactions": normalized,
    "count": len(normalized)
})

@import_bp.route("/health",methods=["GET"])
def health():
    return {"status":"ok"}