
def normalize_data(rows):
    normalized =[]
    for r in rows:
        try:
            normalized.append({
                "email": r.get("Email",""),
                "password": r.get("Password",""),
                "role":r.get("Role","USER"),
                "amount": float(r.get("Amount",0.0)),
                "type":r.get("type",None),
                "age": int(r.get("Age",0)),
                "education":r.get("Education",""),
                "gender":r.get("Gender","")
            })
                
            
        except Exception:
            continue

    return normalized