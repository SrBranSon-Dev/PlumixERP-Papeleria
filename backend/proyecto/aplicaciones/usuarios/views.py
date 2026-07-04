from django.shortcuts import render
from django.http import JsonResponse

def home(request):
    return JsonResponse({
        "mensaje": "API de PlumixERP funcionando"
    })

# Create your views here.
