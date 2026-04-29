def normalize_data(rows):
    normalized =[]
    for r in rows:
        try:
            normalized.append({
                "id":int(r.get("ID",0)),
                "income":int(r.get("Income",0)),
                "age": int(r.get("Age",0)),
                "education":r.get("Education",""),
                "gender":r.get("Gender","")
            })
                
            
        except Exception:
            continue

    return normalized