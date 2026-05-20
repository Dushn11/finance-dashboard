
def normalize_data(rows):
    normalized =[]
    for r in rows:
        try:
            normalized.append({
                "amount": float(r.get("Amount",0.0)),
                "description": r.get("Description",""),
                "type":r.get("type","INCOME")
            })
                
            
        except Exception as e:
            print("Normalization error", e)
            continue

    return normalized