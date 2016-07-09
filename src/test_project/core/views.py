'''Import Statements'''
import json
from django.shortcuts import render_to_response, render
from django.http.response import HttpResponse
from django.core import serializers
from django.contrib.auth.decorators import login_required
from pymongo import MongoClient
from bson.json_util import dumps
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

def home(request):
    ''' it transfer the controle to home page'''
    return render_to_response('index.html')

def searchresult(request):
    return render(request, 'search.html', {})

def search_api(request):
    ''' Filter the request for job_title,job_domain and job_location'''
    page = request.GET.get('page') 
    page = int(page)*5
    
    client = MongoClient()
    db = client.test
    collection = db.std
    cursor = collection.find().skip(page).limit(40);
    list_data = list(cursor)
    tweets = dumps(list_data)
    return HttpResponse(tweets)
