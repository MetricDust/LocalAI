import ollama

from django.shortcuts import render
from rest_framework.response import Response
from django.http import StreamingHttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, renderer_classes

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
                yield chunk.get("message", {}).get("content", "")  
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
            for i in ollama.pull(model=model, stream=True):
                print(i)
            return Response(content_type="text/plain", status=status.HTTP_200_OK)

        except Exception as e:
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