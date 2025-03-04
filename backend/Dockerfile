FROM python:3.12
RUN pip install poetry
WORKDIR /app

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Copy the rest of the application
COPY . .

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction

# Apply migrations
RUN python manage.py makemigrations
RUN python manage.py migrate

EXPOSE 8000

CMD ["sh", "-c", "ollama serve & poetry run python manage.py runserver 0.0.0.0:8000"]
