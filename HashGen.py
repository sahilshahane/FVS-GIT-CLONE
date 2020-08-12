import hashlib

# class calculateFileHash():
#     hashType = None
#     HASH = None
#     def __init__(self,externalFilePath,hashType="md5"):
#         self.hashType = hashType
#         externalData = self.getFileDataInBytes(externalFilePath)
#         self.HASH = self.generateHash(externalData,"md5")
        
#     def getFileDataInBytes(self,filePath):
#         with open(filePath,"rb") as EXTERNAL_FILE:
#             return EXTERNAL_FILE.read()

#     def generateHash(self,data,hashType="md5"):
#         return {
#             "blake2b":hashlib.blake2b,
#             "blake2s":hashlib.blake2s,
#             "md5":hashlib.md5,
#             "sha1":hashlib.sha1,
#             "sha224":hashlib.sha224,
#             "sha256":hashlib.sha256,
#             "sha384":hashlib.sha384,
#             "sha3_224":hashlib.sha3_224,
#             "sha3_256":hashlib.sha3_256,
#             "sha3_384":hashlib.sha3_384,
#             "sha3_512":hashlib.sha3_512,
#             "sha512":hashlib.sha512,
#             "shake_128":hashlib.shake_128,
#             "shake_256":hashlib.shake_256,
#         }[hashType](data).hexdigest()


def generateHash(data,hashType="md5"):
    try:
        return {
        "blake2b":hashlib.blake2b,
        "blake2s":hashlib.blake2s,
        "md5":hashlib.md5,
        "sha1":hashlib.sha1,
        "sha224":hashlib.sha224,
        "sha256":hashlib.sha256,
        "sha384":hashlib.sha384,
        "sha3_224":hashlib.sha3_224,
        "sha3_256":hashlib.sha3_256,
        "sha3_384":hashlib.sha3_384,
        "sha3_512":hashlib.sha3_512,
        "sha512":hashlib.sha512,
        "shake_128":hashlib.shake_128,
        "shake_256":hashlib.shake_256,
        }[hashType](data).hexdigest()
    except TypeError:
        raise Exception("Only Input String Data for Hasing")
    

def generateFileHash(filePath,hashType="md5"):
    with open(filePath,"rb") as EXTERNAL_FILE:
        return generateHash(EXTERNAL_FILE.read(),hashType)
       