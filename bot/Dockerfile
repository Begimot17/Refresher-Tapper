FROM python:3.10

WORKDIR /bot

# Устанавливаем зависимости
RUN apt-get update && apt-get install -y curl jq

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "bot.py"]