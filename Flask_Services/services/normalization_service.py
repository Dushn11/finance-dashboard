def parse_amount(value):
    if not value:
        return 0.0

    return float(
        str(value)
        .replace('"', '')
        .replace(',', '.')
        .strip()
    )


def normalize_data(rows):
    normalized = []

    if not rows:
        return normalized

    is_standard_format = isinstance(rows[0], dict)

    for r in rows:
        try:

            if is_standard_format:

                normalized.append({
                    "amount": float(r.get("Amount", 0.0)),
                    "description": r.get("Description", ""),
                    "type": r.get("type", "INCOME")
                })

            else:

                description = r[3].strip()

                expense = parse_amount(r[10])
                income = parse_amount(r[11])

                if income > 0:
                    amount = income
                    tx_type = "INCOME"
                else:
                    amount = -expense
                    tx_type = "EXPENSE"

                normalized.append({
                    "amount": amount,
                    "description": description,
                    "type": tx_type
                })

        except Exception as e:
            print("Normalization error:", e)

    return normalized