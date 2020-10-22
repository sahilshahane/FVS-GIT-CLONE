from DrivePart import authenticate
import os
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.http import MediaFileUpload
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import json
import pickle
import httplib2
from colorama import Fore,Style


def search(searchData,mimeType,compare=None,spaces="drive", service=None):
  if service==None: service = authenticate.get_gdrive_service()

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
  
def createFolder(folderName, parentID=None,service=None):
  if service==None: service = authenticate.get_gdrive_service()

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

def getDriveID(service=None):
  if service==None: service = authenticate.get_gdrive_service()

  file_metadata = {
    'name': 'temp',
    'mimeType': 'application/vnd.google-apps.folder'
  }

  tempFolderId = service.files().create(body=file_metadata, fields='id').execute()["id"]
  driveID = service.files().get(fileId=tempFolderId, fields='parents').execute()["parents"][0]
  service.files().delete(fileId=tempFolderId).execute()

  return driveID

def Folder(folderName,parentID=None,checkFolder=False,service=None):
  if service==None: service = authenticate.get_gdrive_service()
  if not parentID: parentID = getDriveID(service=service)

  if checkFolder:
    folder = checkFolderExists(folderName,parentID,service)
    if not folder:
      folder = createFolder(folderName,parentID,service)
  else:
    folder = createFolder(folderName,parentID,service)

  return folder

def checkFolderExists(folderName, parentID=None, service=None):
  if service==None: service = authenticate.get_gdrive_service()
  if not parentID: parentID = getDriveID(service)

  data = search(searchData=folderName,mimeType = 'application/vnd.google-apps.folder',service=service)
  if(len(data)!=0):
    for FILE in data:
      FILE_parentID = getParentID(childID=FILE["id"],service=service)
      if parentID==FILE_parentID: 
        # print("Folder Already Exists")
        return FILE

  return False

def getFileData(id,fields="*",service=None):
  if service==None: service = authenticate.get_gdrive_service()
  if type(fields)==list:
    if len(fields)==1:
      fields = fields[0]
    else:
      propName = ""
      for index in range(len(fields)-1):propName+=f"{fields[index]},{fields[index+1]}"
      fields = propName
 
  return service.files().get(fileId = id,fields=fields).execute()
  
def getParentID(childID,service=None):
  if service==None: service = authenticate.get_gdrive_service()

  ID = getFileData(childID,"parents",service)["parents"]
  return ID[0]

def uploadFile(filePath, parentId, mimeType=None, fileName=None,resumeable=False, service=None):
  if service==None: service = authenticate.get_gdrive_service()
  
  try:
    # if not os.path.exists(filePath) : raise Exception("Please Provide a Valid File Path")

    if not fileName: fileName = os.path.basename(filePath)
    if not parentId : raise Exception("Give a parent id to the function uploadFile in upload.py") 

    file_metadata = {
      "name": fileName,
      "parents": [parentId],
      "mimeType": mimeType
    }

    media = MediaFileUpload(filePath,
                            mimetype=mimeType,
                            resumable=resumeable)

    file_ = service.files().create(body=file_metadata, 
                                  media_body=media, 
                                  fields='*').execute()
    # print(json.dumps(file_,indent=1))

    file_id = file_.get("id")
    print(f"{Fore.GREEN}File uploaded : {Fore.CYAN}{fileName}{Style.RESET_ALL}")

    return file_id
  except Exception as e:
    raise Exception(f"{Fore.RED}{e}{Style.RESET_ALL}")
  
def getAllTraversablePaths(foldersData,rootDirName):
  foldersData.sort()
  doneFolders = dict()

  for folderPath in foldersData:
    if doneFolders.get(folderPath)!=None: continue
    levels = folderPath.split("/")

    if len(levels)==1:
      folderName = rootDirName
      doneFolders["."+"/"] = True
      yield (folderName,folderPath+"/",None)
      continue
    

    for i in range(1,len(levels)):
      folderName = levels[i]
      parentPath = "/".join(levels[:i])+"/"
      folderPath = parentPath+folderName+"/"
      if doneFolders.get(folderPath)!=None: continue
      
      else:doneFolders[folderPath] = True
      yield (folderName,folderPath,parentPath)
  
  del(doneFolders)

# WILL WORK THIS AFTER COMPLETING BASIC OPERATIONS
def HTTP_EXCEPTION_HANDLER(function,returnVal = None):
  try:
    return function()
  except httplib2.ServerNotFoundError as exp:
      print("Please Check Your Internet Connection")

  return returnVal

def createEmptyFoldersInDrive(foldersData,rootDirName,rootID=None, service=None):
  if service==None: service = authenticate.get_gdrive_service()

  GenfoldersData = getAllTraversablePaths(foldersData,rootDirName)

  foldersCreated = dict()

  for folderName,folderPath,parentPath in GenfoldersData:
    try:
      if not foldersCreated.get(folderPath,False):
        resultData = dict()

        parentFolderID = foldersCreated.get(parentPath)

        if parentFolderID!=None: 
          parentFolderID = parentFolderID["folderID"]
        
        resultData = {
            "folderID": createFolder(folderName,parentFolderID,service)["id"],
            "HttpCode" : 200,
        }

        foldersCreated[folderPath] = resultData

        yield (resultData,folderPath)
      else:
        yield (foldersCreated[folderPath],folderPath)
      
      del(resultData)
    except Exception as exp:
      yield ({"HttpCode" : 502,"Reason":"Http Handling hasnt been added yet"},folderPath)
  
  del(foldersCreated)




# uploadFile("/home/uttkarsh/Downloads/Indian_YT_Analysis.ipynb", None)


# FOR ANY REFERENCE VISIT : https://www.thepythoncode.com/article/using-google-drive--api-in-python

# TEST CASE
# data = Folder("SAASDASD1",checkFolder=True)
# with open("fileds.txt","w") as FILE:
#   json.dump(getFileData(data["id"]),FILE,indent=2)

# print(search("Experimentse","application/vnd.google-apps.folder"))
