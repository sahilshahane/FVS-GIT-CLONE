import hashlib
import xxhash

default_hash = "xxh3_64"

def generateHash(data,hashType=default_hash):
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
        "xxh64":xxhash.xxh64,
        "xxh32":xxhash.xxh32,
        "xxh3_64":xxhash.xxh3_64,
        }[hashType](data).hexdigest()
    except TypeError:
        raise Exception("Only Input String Data for Hasing")
    

def generateFileHash(filePath,hashType=default_hash):
    with open(filePath,"rb") as EXTERNAL_FILE:
        return generateHash(EXTERNAL_FILE.read(),hashType)
       