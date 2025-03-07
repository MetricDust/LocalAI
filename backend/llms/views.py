import json
import time
import ollama

from django.shortcuts import render
from rest_framework.response import Response
from django.http import StreamingHttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, renderer_classes
import tqdm

# Create your views here.
@api_view(["POST"])
def completions(request):
    """Streaming AI responses using Ollama with Server-Sent Events (SSE)."""
    model = request.data.get("model", "llama3.2:3b")
    prompt = request.data.get("prompt", "")

    def generate():
        """Generator function for real-time streaming AI responses."""
        try:
            for chunk in ollama.chat(model=model, messages=[{"role": "user", "content": prompt}], stream=True):
                yield f'{chunk.get("message", {}).get("content", "")}' 
        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"

    return StreamingHttpResponse(generate(), content_type="text/event-stream")


@api_view(['GET', 'PUT'])
def models(request):
    if request.method == 'GET':
        try:
            return Response(
                data=ollama.list(),
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    if request.method == 'PUT':
        try:
            model = request.data.get("model", "llama3.2:3b")
            def generate():
                for progress in ollama.pull(model=model, stream=True):
                    total = progress.get('total', 1)  # Avoid division by zero
                    completed = progress.get('completed', 0)

                    if total > 0:
                        percentage = (completed / total) * 100
                        yield f"pulling {model}... {percentage:.2f}%\n\n"
            return StreamingHttpResponse(generate(), content_type="text/event-stream")
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def ensamble_chat(request):
    try:
        models = request.data.get("models", [])
        prompt = request.data.get("prompt", "")
        return Response(
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )