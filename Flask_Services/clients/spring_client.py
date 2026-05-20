import requests

SPRING_URL="http://localhost:8080/api/transactions"

def send_to_spring(normalized_data):
    try:
        response=requests.post(
            SPRING_URL,
            json=normalized_data,
            headers={"Content-Type":"application/json"}
        )
        print("Spring status: ",response.status_code)
        print("Spring response:",response.text)

        return response.json() if response.text else None

    except Exception as e:
        print("error sending to spring:",e)
        return None
