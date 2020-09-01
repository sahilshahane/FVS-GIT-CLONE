import authenticate
import os
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.http import MediaFileUpload

def search(searchData,mimeType,spaces="drive", service=authenticate.get_gdrive_service()):
  page_token = None
  
  while True:
      response = service.files().list(q=f"name='{searchData}' and mimeType='{mimeType}'",
                                      spaces=spaces,
                                      fields='nextPageToken, files(id, name)',
                                      pageToken=page_token).execute()
      
      files = response.get('files', [])
      
      for file in files:
          if searchData==file.get('name'):
            # print(f'Found file: %s (%s)' % (file.get('name'), file.get('id')))
            return file

      page_token = response.get('nextPageToken', None)
      if page_token is None: return None
  


def createFolder(folderName, parentID="My Drive", service=authenticate.get_gdrive_service()):
  try:
    data = search(searchData=folderName,mimeType = 'application/vnd.google-apps.folder',service=service)

    if data:
      parentFolder = getParentFolder(data["id"])
      if(parentID==parentFolder["id"]):
        # print("Folder Already Exists")
        return {
          "code":409,  #409 means file already Exists
          "data":{
            "folder":data,
            "parentFolder":parentFolder
          }
        }
      
    folder_metadata = {
      "name": folderName,
      "mimeType": "application/vnd.google-apps.folder",       #If the user wants to upload gsuit files(docs, spreadsheet etc) then there is another mimeType for that https://developers.google.com/drive/api/v3/manage-uploads#multipart
    }                                                         # In the first case the parent can be empty in order to add the main folder in "MyDrive"

    if parentID: folder_metadata["parents"] = [parentID]

    file = service.files().create(body=folder_metadata, fields="id").execute()
    folderID = file.get("id")

    # print(f"Folder {folderName} Created ----------------- Folder Id -> {folder_id}")
    parentFolder = getParentFolder(data["id"])
    if(parentID==parentFolder["id"]):
      return {
      "code":200,
      "data":{
        "folder":{
          "id":folderID,
          "name":folderName
        },
        "parentFolder": parentFolder
      }
    }
  except Exception as exp:
    print("Something Went Wrong\n",exp)
    


def getParentFolder(id):
  folderID = None
  folderName = None

  return {
    "id":folderID,
    "name":folderName
  }

# Here fileName is optional as it may be helpful when calling the function
def uploadFile(filePath, parentId, mimeType, fileName = "", service=authenticate.get_gdrive_service()):
  
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
      "mimeType": mimeType
    }

    media = MediaFileUpload(filePath, resumable=True)
    file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()  
    file_id = file.get("id")
    
    print(f"File {fileName} uploaded")
  except Exception as e:
    raise Exception("ERROR IN uploadFile in upload.py ---------> ", e)
  
  return file_id

  
# uploadFile("/home/uttkarsh/Downloads/Indian_YT_Analysis.ipynb", folder_id)


# FOR ANY REFERENCE VISIT : https://www.thepythoncode.com/article/using-google-drive--api-in-python
print(createFolder(folderName="sahil shahane"))