import secrets
import string


def generate_jwt_secret(length: int = 64) -> str:
    alphabet = string.ascii_letters + string.digits + "_-"
    return ''.join(secrets.choice(alphabet) for _ in range(length))


if __name__ == "__main__":
    secret = generate_jwt_secret()
    print(f"Generated JWT Secret Key:\n{secret}")
