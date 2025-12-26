import hashlib
import os
import binascii


def hash_password(password: str) -> str:
    """
    Hash a password using PBKDF2-HMAC-SHA256 with a random salt.
    """
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode("ascii")

    pwdhash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100000
    )

    pwdhash = binascii.hexlify(pwdhash)

    # store salt + hash together
    return (salt + pwdhash).decode("ascii")


def verify_password(stored_password: str, provided_password: str) -> bool:
    """
    Verify a stored password against a provided password.
    """
    # extract salt and hash
    salt = stored_password[:64]
    stored_hash = stored_password[64:]

    pwdhash = hashlib.pbkdf2_hmac(
        "sha256",
        provided_password.encode("utf-8"),
        salt.encode("ascii"),
        100000
    )

    pwdhash = binascii.hexlify(pwdhash).decode("ascii")

    # 🔥 THIS RETURN WAS MISSING IN YOUR CODE
    return pwdhash == stored_hash
