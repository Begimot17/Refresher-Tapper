FROM python:3.10

WORKDIR /bot

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y curl jq

# Копируем только requirements.txt для установки зависимостей
COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

# Копируем остальные файлы (они будут перезаписаны через bind mount)
COPY . .

CMD ["python", "bot.py"]