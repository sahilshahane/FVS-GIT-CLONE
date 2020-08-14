import authenticate
import upload
import os

# This contains "folder path" : "its id"
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
    parentPath = os.path.dirname(folderPath)
    # parentFolderName = (os.path.dirname(folderPath)).split("/")[-1]   #This gives the parent folder name

    if FIRSTTIME:
      for key in folderIdDictionary:
        if key == parentPath:
          parentId = folderIdDictionary[key]
        else:
          parentId = ""
    
    folderId = upload.createFolder(folderName, parentId)
    folderIdDictionary.__setitem__(folderPath, folderId)
    print(f"Uploaded -> {folderName} folderId -> {folderId} ParentId -> {folderId}")
    folderCount += 1

  def putFiles(self, filePath, parentId=""):
    global folderIdDictionary
    global fileIdDictionary
    fileName = os.path.basename(filePath)
    parentPath = os.path.dirname(filePath)
    # parentFolderName = (os.path.dirname(filePath)).split("/")[-1]

    for key in folderIdDictionary:
      if key == parentPath:
        parentId = folderIdDictionary[key]
      else:
        parentId="" 

    fileId = upload.uploadFile(filePath, parentId)
    fileIdDictionary.__setitem__(fileName, fileId)
    print(f"Uploaded -> {fileName} Fileid -> {fileId} ParentId -> {parentId}")
    fileCount += 1

  def readFolderId(self):
    with open("folderNameId.txt", "r") as f:
      s = (f.readline()).split("<!@#$%>")

      folderIdDictionary.__setitem__(s[0], s[1][:-1])         # This [-1] is to remove the last "\n"

  #This wont be necessary in future version
  def createMetaFiles(self):
    global fileIdDictionary
    global folderIdDictionary

    with open("fileNameId.txt", "w") as f:
      for key in fileIdDictionary:
        f.write(f"{key}<!@#$%>{folderIdDictionary}\n")

    with open("folderNameId.txt", "w") as f:
      for key in folderIdDictionary:
        f.write(f"{key}<!@#$%>{folderIdDictionary[key]}")
  
uplo = UploadItBoi()

