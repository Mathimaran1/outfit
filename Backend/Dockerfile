# Use an official lightweight Python image
FROM python:3.12-slim

# Set the working directory directly to /app
WORKDIR /app

# Install system dependencies needed for libraries like Pillow
RUN apt-get update && apt-get install -y \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install the Python dependencies (including Gunicorn and Flask)
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-root user (Hugging Face Spaces requirement)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Copy the rest of the application code into the container
# This copies everything inside the Backend directory
COPY --chown=user . /app

# Expose port 7860, the standard port for Hugging Face Spaces
EXPOSE 7860

# Define the environment variable for Hugging Face (optional but best practice)
ENV FLASK_APP=main.py

# Command to run the application using Gunicorn for production
CMD ["gunicorn", "-b", "0.0.0.0:7860", "--workers", "1", "--threads", "8", "--timeout", "0", "main:app"]
