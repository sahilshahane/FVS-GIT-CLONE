import os
import authenticate
import pickle

def getTime(service=authenticate.get_gdrive_service()):
  page_token = None
  filesDict = {}

  while True:
    response = service.files().list(spaces='drive', 
                                    fields="nextPageToken, files(id, modifiedTime)", # add name, in files() if you want the name also
                                    pageSize=1000,
                                    pageToken=page_token).execute()
    
    files = response.get('files', [])
    
    for file in files:
      filesDict.__setitem__(file['id'], file['modifiedTime'])
   
    page_token = response.get('nextPageToken', None)
    if page_token is None:
      break
  
  return filesDict

def saveChanges(filesDict):
  with open("modifiedTime.pickle", "wb") as f:
    pickle.dump(filesDict, f)

def loadChanges():
  with open("modifiedTime.pickle", "rb") as f:
    filesDict = pickle.load(f)
  return filesDict


def getResult():
  newDict = getTime()
  if not os.path.exists("modifiedTime.pickle"):
    saveChanges(newDict)  
    print("created modified.pickle")
    exit()

  oldDict = loadChanges()
  
  modified = {}
  changes = {}

  if len(newDict) > len(oldDict):
    print("There are new Files / Folders") 
  else:
    print("There are some deleted folders")

  for key, value in newDict.items():
    print("*")
    if key in oldDict:
      if newDict[key] == oldDict[key]:
        print(newDict[key])
        oldDict.pop(key)
      else:
        modified.__setitem__(key, newDict[key])
    else:
      changes.__setitem__(key, "Added")
  
  for key, value in oldDict.items():
    changes.__setitem__(key, "Deleted")
  
  saveChanges(newDict)
  
  print("MODIFIED")
  print(modified)
  print("CHANGED")
  print(changes)

  
getResult()