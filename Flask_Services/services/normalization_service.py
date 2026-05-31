def parse_amount(value):
    if not value:
        return 0.0

    return float(
        str(value)
        .replace('"', '')
        .replace(',', '.')
        .strip()
    )


def normalize_data(rows, mapping):
    normalized = []

    if not rows:
        return normalized

    for r in rows:
        try:
            transaction = {
                "amount": 0.0,
                "description": "",
                "type": "INCOME"
            }

            income = 0.0
            expense = 0.0

            for column_index, field_name in mapping.items():
                idx = int(column_index)

                if idx >= len(r):
                    continue

                value = r[idx].strip()

                if field_name == "description":
                    transaction["description"] = value

                elif field_name == "income":
                    income = parse_amount(value)

                elif field_name == "expense":
                    expense = parse_amount(value)

                elif field_name == "amount":
                    transaction["amount"] = parse_amount(value)

                elif field_name == "type":
                    transaction["type"] = value.upper()

                elif field_name == "date":
                    transaction["date"] = value

            if income > 0:
                transaction["amount"] = income
                transaction["type"] = "INCOME"
            elif expense > 0:
                transaction["amount"] = -expense
                transaction["type"] = "EXPENSE"

            normalized.append(transaction)

        except Exception as e:
            print("Normalization error:", e)

    return normalized