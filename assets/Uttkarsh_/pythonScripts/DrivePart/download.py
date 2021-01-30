import pickle
import os
import re
import io
import response
import upload
import authenticate
from googleapiclient.errors import HttpError 
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.http import MediaIoBaseDownload
import requests
from tqdm import tqdm
from tabulate import tabulate
import re
import json

def download(file_id, destination, saveName="", service=authenticate.get_gdrive_service()):

  if not os.path.exists(destination):
    print(f"DESTINATION {destination} not found")
    return 0

  try:
    file = service.files().get(fileId=file_id, fields="name, size, mimeType").execute()
    print(file)
  except HttpError as e:
    # print(e.content)
    err_code = int(e.resp['status'])
    print("Error Code ", err_code)
    if err_code == 404:
      print(f"FILE WITH ID {file_id} NOT FOUND")
    return 0

  if not saveName:
    saveName = file['name']
  
  mime = file['mimeType']
  if mime == 'application/vnd.google-apps.document' or mime == 'application/vnd.google-apps.spreadsheet' or mime == 'application/vnd.google-apps.presentation':
    if downloadGsuit(file_id, destination, saveName, mime, service) == 1:
      return 1
    else: return 0
  
  if not os.path.splitext(file['name'])[1]:
    saveName += resolveExtension(file['mimeType'])
  print("Save name->",saveName)
  
  request = service.files().get_media(fileId = file_id)
  fh = io.BytesIO()
  downloader = MediaIoBaseDownload(fh, request)
  done = False
  
  while not done:
    status, done = downloader.next_chunk()
    print(f"Download {int(status.progress()*100)}")

  fh.seek(0)
  # destination = os.path.join(destination, saveName)
  destination += saveName
  newPath = checkFileAlreadyExists(destination)
  print(type(newPath))
  print("New File Destination -> ", newPath)

  with open(newPath, "wb") as f:
    f.write(fh.read())
    f.close()
  
  return 1

def checkFileAlreadyExists(path, i=1, iter=0):
  if os.path.exists(path):
    if iter == 0:
      pos = len(path) - 1 - path[::-1].find('.')
      new = path[:pos] + "("+str(i)+")" + path[pos:]
    else: 
      pos = len(path) - 3 - path[::-1].find('.')
      new = path[:pos] + str(i) + path[pos+1:]

    if(os.path.exists(new)):
      i+=1
      iter+=1
      return checkFileAlreadyExists(new, i, iter)
    else:
      print("Returned Value", new)
      return new
  else:
    print("Returned Value", path)
    return path

def downloadGsuit(file_id, destination, saveName, mime, service):
  
  print("IT IS A Gsuit Document")
  
  newMime={
    "application/vnd.google-apps.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.google-apps.spreadsheet": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.google-apps.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  }[mime]
  
  request = service.files().export_media(fileId=file_id, mimeType=newMime)
  fh = io.BytesIO()
  downloader = MediaIoBaseDownload(fh, request)
  done = False
  while not done:
    status, done = downloader.next_chunk()
    print(f"Dowloaded {int(status.progress()*100)}")

  fh.seek(0)
  if not os.path.splitext(saveName)[1]:
    saveName += resolveExtension(mime)
  destination += saveName
  destination = checkFileAlreadyExists(destination)
  print(destination)
  with open(destination, "wb") as f:
    f.write(fh.read())
    f.close()
  
  return 1

def resolveExtension(mimeType):
  with open('../../installation/.usp/ExtensionToMime.json') as f:
      mimeJson = json.loads(f.read())
      return mimeJson[mimeType]

# download("1ikrvmXBcn_ZeXR3a8A6bdSQb_PG0DXGK", "/home/uttkarsh/Pictures/Test/ht/")
#MIME TYPE:-
# google doc -    application/vnd.google-apps.document
# google sheets - application/vnd.google-apps.spreadsheet
# google slides - application/vnd.google-apps.presentation

# normalFile - 1FlMtPenfHeB5GyLHwKKmrQ9omla2kk-R           ------------ working
# docs - 1TLvU8TSmHONcQttjnvufVeMhr83z-FrHOhexHNdJM-Q      ------------ working
# sheets - 1D6h9YFmZCdjY8WryicXODjOqSoHuJdjYBhH8DeKkn-A    ------------ working
# slides - 1Eg2BjGuZG15mu-Rd_e0mZVlVv6nD9IxbVORu0KzQucU    ------------ working
# folder - 1ggGA6H5ztS5IdgRxMAiQxhzDdFDSLh2A               ------------ ask
# photo - 1XKNBHQG-Alq1m3kypPq0d0s9WBvvmpgV                ------------ working
# video - 1ikrvmXBcn_ZeXR3a8A6bdSQb_PG0DXGK                ------------ working
