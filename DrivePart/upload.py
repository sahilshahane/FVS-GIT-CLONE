from __future__ import print_function
import authenticate   
import pickle
import os
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.http import MediaFileUpload

service = authenticate.get_gdrive_service()
folder_id = ""

def createFolder(folderName, parentId=""):
  global folder_id

  folder_metadata = {
    "name": folderName,
    "mimeType": "application/vnd.google-apps.folder",       #If the user wants to upload gsuit files(docs, spreadsheet etc) then there is another mimeType for that https://developers.google.com/drive/api/v3/manage-uploads#multipart
    "parents": [parentId],                                  # If the parents is left empty then the files will be added to your MyDrive and not inside any other folder
  }                                                         # In the first case the parent can be empty in order to add the main folder in "MyDrive"

  file = service.files().create(body=folder_metadata, fields="id").execute()
  folder_id = file.get("id")

  print(f"Folder {folderName} Created ----------------- Folder Id -> {folder_id}")

  return folder_id


# Here fileName is optional as it may be helpful when calling the function
def uploadFile(filePath, parentId, fileName = ""):
  
  try:
    if fileName == "":
      fileName = os.path.basename(filePath)

    print(f"parentId ---------------------------------> {parentId}")
    
    if parentId == "":
      raise Exception("Give a parent id to the function uploadFile in upload.py")
    
    print(parentId)

    file_metadata = {
      "name": fileName,
      "parents": [parentId],
    }

    media = MediaFileUpload(filePath, resumable=True)
    file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()  
    file_id = file.get("id")
    
    print(f"File {fileName} uploaded")
  except Exception as e:
    raise Exception("ERROR IN uploadFile in upload.py ---------> ", e)
  
  return file_id

 

# createFolder("TheFinalTest", "")
# uploadFile("/home/uttkarsh/Downloads/Indian_YT_Analysis.ipynb", folder_id)


# FOR ANY REFERENCE VISIT : https://www.thepythoncode.com/article/using-google-drive--api-in-python