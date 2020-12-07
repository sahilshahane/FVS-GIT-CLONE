from concurrent import futures
from os import wait
import re
from typing import final
import authenticate
import os
import multiprocessing
import pickle
from time import sleep
import concurrent.futures
import httplib2
import socket
import googlesearch
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.http import MediaFileUpload
import json

def search(searchData,mimeType,compare=None,spaces="drive", service=authenticate.get_gdrive_service()):
  try:
    page_token = None

    while True:
        response = service.files().list(q=f"name='{searchData}' and mimeType='{mimeType}'",
                                        spaces=spaces,
                                        fields='nextPageToken, files(id, name)',
                                        pageToken=page_token).execute()
  
        files = response.get('files', [])

        if compare:
          compareProperty = compare[0]
          compareValue = compare[1]
          for file in files:
              if compareValue==file.get(compareProperty):
                # print(f'Found file: %s (%s)' % (file.get('name'), file.get('id')))
                return file
        else:
          files+=files

        page_token = response.get('nextPageToken', None)
        if page_token is None: return files

  except Exception as exp:
    print("Something Went Wrong")
  
def createFolder(folderName, parentID=None,service=authenticate.get_gdrive_service()):
  folder_metadata = {
    "name": folderName,
    "mimeType": "application/vnd.google-apps.folder",       #If the user wants to upload gsuit files(docs, spreadsheet etc) then there is another mimeType for that https://developers.google.com/drive/api/v3/manage-uploads#multipart
  }                                                         # In the first case the parent can be empty in order to add the main folder in "MyDrive"

  if parentID: folder_metadata["parents"] = [parentID]

  file = service.files().create(body=folder_metadata, fields="id").execute()
  # print("New Folder Created")
  return {
    "id":file.get("id"),
    "name":folderName
  }

def getDriveID(service=authenticate.get_gdrive_service()):
  file_metadata = {
    'name': 'temp',
    'mimeType': 'application/vnd.google-apps.folder'
  }
  tempFolderId = service.files().create(body=file_metadata, fields='id').execute()["id"]
  driveID = service.files().get(fileId=tempFolderId, fields='parents').execute()["parents"][0]
  service.files().delete(fileId=tempFolderId).execute()

  return driveID


def Folder(folderName,parentID=None,checkFolder=False,service=authenticate.get_gdrive_service()):
  if not parentID: parentID = getDriveID(service)

  if checkFolder:
    folder = checkFolderExists(folderName,parentID,service)
    if not folder:
      folder = createFolder(folderName,parentID,service)
  else:
    folder = createFolder(folderName,parentID,service)

  return folder


def checkFolderExists(folderName, parentID=None, service=authenticate.get_gdrive_service()):
  if not parentID: parentID = getDriveID(service)

  data = search(searchData=folderName,mimeType = 'application/vnd.google-apps.folder',service=service)
  if(len(data)!=0):
    for FILE in data:
      FILE_parentID = getParentID(childID=FILE["id"],service=service)
      if parentID==FILE_parentID: 
        # print("Folder Already Exists")
        return FILE
          

  return False

def getFileData(id,fields="*",service=authenticate.get_gdrive_service()):
  if type(fields)==list:
    if len(fields)==1:
      fields = fields[0]
    else:
      propName = ""
      for index in range(len(fields)-1):propName+=f"{fields[index]},{fields[index+1]}"
      fields = propName

  return service.files().get(fileId = id,fields=fields).execute()
  
def getParentID(childID,service=authenticate.get_gdrive_service()):
  ID = getFileData(childID,"parents",service)["parents"]
  return ID[0]


def doUpload(fileInfo):
  filePath = fileInfo[0]
  parentId = fileInfo[1]
  mimeType = fileInfo[2]
  fileName = fileInfo[3]
  try:
    service=authenticate.get_gdrive_service()
    if fileName == "":
      fileName = os.path.basename(filePath)
    tempName = os.path.basename(filePath)

    print(f"Uploading -> {fileName}")
    
    if parentId == "":
      raise Exception("Give a parent id to the function uploadFile in upload.py")

    file_metadata = {
      "name": fileName,
      "parents": [parentId],
      "mimeType": mimeType
    }

    media = MediaFileUpload(filePath, resumable=True)
    file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()  
    file_id = file.get("id")
    print(f"File {fileName} uploaded")
    return [tempName, file_id]
  except OSError:
    print("---Check your internet---")
  except socket.gaierror:
    print("CHECK YOUR INTERNET CONNECTION BRO")
  except Exception as e:
    raise Exception("ERROR IN uploadFile in upload.py ---------> \n", e)

def generateIds(x, service=authenticate.get_gdrive_service()):
	ids = service.files().generateIds(count=x).execute().get("ids")
	return ids

def getStorageInfo(allFiles, service=authenticate.get_gdrive_service()):
  info = service.about().get(fields="storageQuota").execute().get('storageQuota')
  # info = {'limit': '16106127360', 'usage': '5919890824', 'usageInDrive': '5003790615', 'usageInDriveTrash': '50486252'}
  totalStorageNeeded=0
  limit = int(info.get('limit'))
  usage = int(info.get('usage'))

  for file in allFiles:
    totalStorageNeeded += os.path.getsize(file[0]) 
  
  if((usage+1610612736)>=limit):
    print("You are running low on space")
    print(f"You are left with {(limit-usage)/1073741824} Gb of storage")
    print("Or you can extend your quota by going to :-")
    print("https://one.google.com/storage?i=m&utm_source=drive&utm_medium=web&utm_campaign=widget_normal#upgrade")

  if(totalStorageNeeded+usage < limit):
    print(f"Current space left = {(limit-usage)/1073741824}")
    print(f"Total space of the current files = {totalStorageNeeded/1073741824}")
    print(f"Space left after uploading = {(limit-(usage+totalStorageNeeded))/1073741824} ")
    while(1):
      ans = input("Do you want to continue? Y/N\n").strip().lower()
      if(ans=='y' or ans==""):
        return True
      elif(ans.strip().lower()=='n'):
        return False

def uploadFiles(allFiles):

  if(not getStorageInfo(allFiles)):    
    return False

  uploadedFiles = []
  results=""
  try:
    socket.create_connection(("www.google.com", 80))
    with concurrent.futures.ThreadPoolExecutor() as executor:

      results = [executor.submit(doUpload, file) for file in allFiles]
      for f in futures.as_completed(results):
        data = f.result()
        if data!=None:
          uploadedFiles.append(data)

    print("\nFinal Uploaded files")
    print(uploadedFiles)

  except OSError:
    print("Check your internet connection")
    return False
  except Exception as e:     
    print("Your Internet Connection was inturrupted")
    print("The files left to to upload will be uploaded next time when you run the code")
    return False
  finally:
    if len(uploadedFiles) != len(allFiles):
      print("Your Internet Connection was inturrupted")
      print("The files left to to upload will be uploaded next time when you run the code")
      for uploadedFile in uploadedFiles:
        for file in allFiles:
          if uploadedFile[0] == os.path.basename(file[0]):
            allFiles.remove(file)
      if(len(allFiles) != 0):
        if os.path.exists("remaningUplad.pickle"):
          with open("remaningUplad.pickle", "rb") as f:
            temp = pickle.load(f)
            for f in allFiles:
              temp.append(f)
            allFiles = temp
        with open("remaningUpload.pickle", "wb") as f:
          pickle.dump(allFiles, f)
      print("\nTHESE ARE THE FILES THAT ARE NOT UPLOADED")
      for f in allFiles:
        print(f)
      return False
  return True

def resumeUpload():
  if os.path.exists("remaningUpload.pickle"):
    with open("remaningUpload.pickle", "rb") as f:
      if(uploadFiles(pickle.load(f))):
        os.remove("remaningUpload.pickle")      

fileInfo =[
            ["/home/uttkarsh/Videos/SampleVideo.mp4", "1BjDkr3FfaUtYlAncX4SOEB5lOxG6zXJx", "video/mp4", ""],
            ["/home/uttkarsh/Videos/Pexels Videos 3688.mp4", "1BjDkr3FfaUtYlAncX4SOEB5lOxG6zXJx", "video/mp4", ""],
            ["/home/uttkarsh/Videos/pexels-aleks-b-5290028.mp4", "1BjDkr3FfaUtYlAncX4SOEB5lOxG6zXJx", "video/mp4", ""],
            ["/home/uttkarsh/Videos/production ID_3873465.mp4", "1BjDkr3FfaUtYlAncX4SOEB5lOxG6zXJx", "video/mp4", ""],
            ["/home/uttkarsh/Videos/video (1).mp4", "1BjDkr3FfaUtYlAncX4SOEB5lOxG6zXJx", "video/mp4", ""],
          ]

# uploadFiles(fileInfo)
# resumeUpload()
generateIds(20)

# TEST CASE
# data = Folder("Photos",checkFolder=True)
# print(data)
# allFiles => filePath, parentId, mimeType, fileName = "", service=authenticate.get_gdrive_service()  
