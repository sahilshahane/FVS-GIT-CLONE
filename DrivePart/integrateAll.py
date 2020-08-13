import authenticate
import upload
import os

# This contains "folder name" : "its id"
folderIdDictionary = {}
fileIdDictionary = {}

class UploadItBoi():
  def __init__(self):
    service = authenticate.get_gdrive_service()
    fileCount = 0       # match the count of files and folders to be uploaded
    folderCount = 0
  
  def generateIDmeta(self, folderPath, parentId="", FIRSTTIME=False):
    global folderIdDictionary
    folderName = os.path.basename(folderPath)
    folderId = upload.createFolder(folderName, parentId)

    if FIRSTTIME:
      parentFolderName = (os.path.dirname(folderPath)).split("/")[-1]   #This gives the parent folder name
      for key in folderIdDictionary:
        if key == parentFolderName:
          parentId = folderIdDictionary[key]
        else:
          parentId=""                                               # This should happen only fo rthe root level folders

    folderIdDictionary.__setitem__(folderName, folderId)
    print(f"Uploaded -> {folderName} folderId -> {folderId} ParentId -> {folderId}")
    folderCount += 1

  def putFiles(self, filePath, parentId=""):
    global folderIdDictionary
    global fileIdDictionary
    fileName = os.path.basename(filePath)
    parentFolderName = (os.path.dirname(filePath)).split("/")[-1]
    fileId = upload.uploadFile(filePath, parentId)

    for key in folderIdDictionary:
      if key == parentFolderName:
        parentId = folderIdDictionary[key]
      else:
        parentId="" 

    fileIdDictionary.__setitem__(fileName, fileId)
    
    print(f"Uploaded -> {os.path.basename(filePath)} Fileid -> {fileId} ParentId -> {parentId}")
    fileCount += 1

  def readFolderId(self):
    print("")

  def createMetaFiles(self):
    global fileIdDictionary
    global folderIdDictionary

    with open("fileNameId.txt", "w") as f:
      for key in fileIdDictionary:
        f.write(f"{key}<--->{folderIdDictionary}\n")

    with open("folderNameId.txt", "w") as f:
      for key in folderIdDictionary:
        f.write(f"{key}<-->{folderIdDictionary[key]}")
  
uplo = UploadItBoi()



